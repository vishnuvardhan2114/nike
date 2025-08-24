"use server";

import { stripe } from "@/lib/stripe/client";
import { db } from "@/lib/db";
import { carts, cartItems, productVariants, products, productImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/actions";
import { guestSession } from "@/lib/auth/actions";

export async function createStripeCheckoutSession(cartId: string) {
  try {
    // Get current user and guest session
    const user = await getCurrentUser();
    const { sessionToken: guestToken } = await guestSession();

    // Fetch cart with items and product details
    const cartWithItems = await db
      .select({
        cart: carts,
        items: cartItems,
        variant: productVariants,
        product: products,
        image: productImages,
      })
      .from(carts)
      .leftJoin(cartItems, eq(carts.id, cartItems.cartId))
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .where(
        and(
          eq(carts.id, cartId),
          user ? eq(carts.userId, user.id) : eq(carts.guestId, guestToken as string)
        )
      );

    if (!cartWithItems || cartWithItems.length === 0) {
      throw new Error("Cart not found or access denied");
    }

    // Check if cart has items
    const cartItemsData = cartWithItems.filter(item => item.items);
    if (cartItemsData.length === 0) {
      throw new Error("Cart is empty");
    }

    // Prepare line items for Stripe
    const lineItems = cartItemsData.map((item) => {
      const price = parseFloat(item.variant?.salePrice || item.variant?.price || "0");
      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product?.name || "Product",
            images: item.image ? [item.image.url] : [],
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: item.items?.quantity || 1,
      };
    });

    // Calculate total amount
    const totalAmount = cartItemsData.reduce((total, item) => {
      const price = parseFloat(item.variant?.salePrice || item.variant?.price || "0");
      const quantity = item.items?.quantity || 1;
      return total + (price * quantity);
    }, 0);

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/cart`,
      metadata: {
        cartId: cartId,
        userId: user?.id || "",
        guestToken: guestToken || "",
        totalAmount: totalAmount.toString(),
      },
      customer_email: user?.email || undefined,
      allow_promotion_codes: true,
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "IT", "ES", "NL", "BE"],
      },
    });

    return { success: true, url: session.url };
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return { success: false, error: "Failed to create checkout session" };
  }
}

export async function getStripeCheckoutSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return { success: true, session };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    return { success: false, error: "Failed to retrieve checkout session" };
  }
}
