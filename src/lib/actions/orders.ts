"use server";

import { db } from "@/lib/db";
import { orders, orderItems, payments, carts, cartItems, productVariants, products, productImages } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { stripe } from "@/lib/stripe/client";

export async function createOrder(stripeSessionId: string, userId?: string) {
  try {
    // Retrieve the Stripe session
    const session = await stripe.checkout.sessions.retrieve(stripeSessionId);
    
    if (!session || session.payment_status !== 'paid') {
      throw new Error("Payment not completed");
    }

    const { cartId, totalAmount } = session.metadata || {};
    if (!cartId || !totalAmount) {
      throw new Error("Missing cart information in session metadata");
    }

    // Fetch cart items to create order items
    const cartItemsData = await db
      .select({
        cartItem: cartItems,
        variant: productVariants,
        product: products,
      })
      .from(cartItems)
      .leftJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .where(eq(cartItems.cartId, cartId));

    if (cartItemsData.length === 0) {
      throw new Error("No items found in cart");
    }

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: userId || null,
        status: 'paid',
        totalAmount: totalAmount,
        createdAt: new Date(),
      })
      .returning();

    // Create order items
    const orderItemsData = cartItemsData.map((item) => ({
      orderId: order.id,
      productVariantId: item.cartItem.productVariantId,
      quantity: item.cartItem.quantity,
      priceAtPurchase: item.variant?.salePrice || item.variant?.price || "0",
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Create payment record
    await db.insert(payments).values({
      orderId: order.id,
      method: 'stripe',
      status: 'completed',
      paidAt: new Date(),
      transactionId: session.payment_intent as string,
    });

    // Clear the cart (optional - you might want to keep it for order history)
    // await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Error creating order:", error);
    return { success: false, error: "Failed to create order" };
  }
}

export async function getOrder(orderId: string) {
  try {
    const orderData = await db
      .select({
        order: orders,
        items: orderItems,
        variant: productVariants,
        product: products,
        image: productImages,
        payment: payments,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(orders.id, orderId));

    if (!orderData || orderData.length === 0) {
      return { success: false, error: "Order not found" };
    }

    const order = orderData[0].order;
    const items = orderData
      .filter(item => item.items)
      .map(item => ({
        ...item.items,
        variant: item.variant,
        product: item.product,
        image: item.image,
      }));
    const payment = orderData[0].payment;

    return {
      success: true,
      order: {
        ...order,
        items,
        payment,
      },
    };
  } catch (error) {
    console.error("Error retrieving order:", error);
    return { success: false, error: "Failed to retrieve order" };
  }
}

export async function getOrderByStripeSession(sessionId: string) {
  try {
    // First try to find order by payment transaction ID (payment intent)
    let orderData = await db
      .select({
        order: orders,
        items: orderItems,
        variant: productVariants,
        product: products,
        image: productImages,
        payment: payments,
      })
      .from(orders)
      .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
      .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
      .leftJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(productImages, eq(products.id, productImages.productId))
      .leftJoin(payments, eq(orders.id, payments.orderId))
      .where(eq(payments.transactionId, sessionId));

    // If not found by payment intent, try to find by session ID in metadata
    if (!orderData || orderData.length === 0) {
      // Get the Stripe session to find the payment intent
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_intent) {
        orderData = await db
          .select({
            order: orders,
            items: orderItems,
            variant: productVariants,
            product: products,
            image: productImages,
            payment: payments,
          })
          .from(orders)
          .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
          .leftJoin(productVariants, eq(orderItems.productVariantId, productVariants.id))
          .leftJoin(products, eq(productVariants.productId, products.id))
          .leftJoin(productImages, eq(products.id, productImages.productId))
          .leftJoin(payments, eq(orders.id, payments.orderId))
          .where(eq(payments.transactionId, session.payment_intent as string));
      }
    }

    if (orderData && orderData.length > 0) {
      const order = orderData[0].order;
      const items = orderData
        .filter(item => item.items)
        .map(item => ({
          ...item.items,
          variant: item.variant,
          product: item.product,
          image: item.image,
        }));
      const payment = orderData[0].payment;

      return {
        success: true,
        order: {
          ...order,
          items,
          payment,
        },
      };
    }

    return { success: false, error: "Order not found" };
  } catch (error) {
    console.error("Error retrieving order by session:", error);
    return { success: false, error: "Failed to retrieve order" };
  }
}
