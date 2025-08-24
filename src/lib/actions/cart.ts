"use server";

import { cookies } from "next/headers";
import { and, eq, isNull, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { carts, cartItems, guests, users, productVariants, products, colors, sizes, productImages } from "@/lib/db/schema";
import { getCurrentUser, createGuestSession, guestSession } from "@/lib/auth/actions";
import { revalidatePath } from "next/cache";

export type CartItemWithDetails = {
  id: string;
  cartId: string;
  productVariantId: string;
  quantity: number;
  variant: {
    id: string;
    sku: string;
    price: string;
    salePrice: string | null;
    inStock: number;
    color: {
      id: string;
      name: string;
      slug: string;
      hexCode: string;
    } | null;
    size: {
      id: string;
      name: string;
      slug: string;
      sortOrder: number;
    } | null;
  };
  product: {
    id: string;
    name: string;
    description: string;
  } | null;
  image: {
    id: string;
    url: string;
  } | null;
};

export type CartWithItems = {
  id: string;
  userId: string | null;
  guestId: string | null;
  items: CartItemWithDetails[];
  totalItems: number;
  subtotal: number;
  estimatedDelivery: number;
  total: number;
};

async function getOrCreateCart() {
  const user = await getCurrentUser();
  
  if (user) {
    // User is authenticated - find or create user cart
    const existingCart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, user.id), isNull(carts.guestId)))
      .limit(1);

    if (existingCart.length > 0) {
      return existingCart[0];
    }

    // Create new user cart
    const [newCart] = await db
      .insert(carts)
      .values({
        userId: user.id,
        guestId: null,
      })
      .returning();

    return newCart;
  } else {
    // Guest user - find or create guest cart
    const { sessionToken } = await guestSession();
    
    if (!sessionToken) {
      // Create new guest session and cart
      const { sessionToken: newToken } = await createGuestSession();
      
      // First create the guest record
      const [guestRecord] = await db
        .insert(guests)
        .values({
          sessionToken: newToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .returning();
      
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: null,
          guestId: guestRecord.id,
        })
        .returning();
      return newCart;
    }

    // Find existing guest cart
    const guestRecord = await db
      .select()
      .from(guests)
      .where(eq(guests.sessionToken, sessionToken))
      .limit(1);
    
    if (guestRecord.length === 0) {
      // Create new guest record
      const [newGuestRecord] = await db
        .insert(guests)
        .values({
          sessionToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        })
        .returning();
      
      const [newCart] = await db
        .insert(carts)
        .values({
          userId: null,
          guestId: newGuestRecord.id,
        })
        .returning();
      return newCart;
    }
    
    const existingCart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.guestId, guestRecord[0].id), isNull(carts.userId)))
      .limit(1);

    if (existingCart.length > 0) {
      return existingCart[0];
    }

    // Create new guest cart
    const [newCart] = await db
      .insert(carts)
      .values({
        userId: null,
        guestId: guestRecord[0].id,
      })
      .returning();

    return newCart;
  }
}

export async function getCart(): Promise<CartWithItems | null> {
  try {
    const cart = await getOrCreateCart();
    if (!cart) return null;

    const items = await db
      .select({
        id: cartItems.id,
        cartId: cartItems.cartId,
        productVariantId: cartItems.productVariantId,
        quantity: cartItems.quantity,
        variantId: productVariants.id,
        variantSku: productVariants.sku,
        variantPrice: productVariants.price,
        variantSalePrice: productVariants.salePrice,
        variantInStock: productVariants.inStock,
        colorId: colors.id,
        colorName: colors.name,
        colorSlug: colors.slug,
        colorHex: colors.hexCode,
        sizeId: sizes.id,
        sizeName: sizes.name,
        sizeSlug: sizes.slug,
        sizeSortOrder: sizes.sortOrder,
        productId: products.id,
        productName: products.name,
        productDescription: products.description,
        imageId: productImages.id,
        imageUrl: productImages.url,
      })
      .from(cartItems)
      .innerJoin(productVariants, eq(cartItems.productVariantId, productVariants.id))
      .innerJoin(products, eq(productVariants.productId, products.id))
      .leftJoin(colors, eq(productVariants.colorId, colors.id))
      .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
      .leftJoin(
        productImages,
        and(
          eq(productImages.productId, products.id),
          or(
            eq(productImages.variantId, productVariants.id),
            isNull(productImages.variantId)
          ),
          eq(productImages.isPrimary, true)
        )
      )
      .where(eq(cartItems.cartId, cart.id));

    const cartItemsWithDetails: CartItemWithDetails[] = items.map((item) => ({
      id: item.id,
      cartId: item.cartId,
      productVariantId: item.productVariantId,
      quantity: item.quantity,
      variant: {
        id: item.variantId,
        sku: item.variantSku,
        price: item.variantPrice,
        salePrice: item.variantSalePrice,
        inStock: item.variantInStock,
        color: item.colorId ? {
          id: item.colorId,
          name: item.colorName!,
          slug: item.colorSlug!,
          hexCode: item.colorHex!,
        } : null,
        size: item.sizeId ? {
          id: item.sizeId,
          name: item.sizeName!,
          slug: item.sizeSlug!,
          sortOrder: item.sizeSortOrder!,
        } : null,
      },
      product: item.productId ? {
        id: item.productId,
        name: item.productName!,
        description: item.productDescription!,
      } : null,
      image: item.imageId ? {
        id: item.imageId,
        url: item.imageUrl!,
      } : null,
    }));

    const totalItems = cartItemsWithDetails.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItemsWithDetails.reduce((sum, item) => {
      const price = parseFloat(item.variant.salePrice || item.variant.price);
      return sum + (price * item.quantity);
    }, 0);
    const estimatedDelivery = totalItems > 0 ? 2.00 : 0;
    const total = subtotal + estimatedDelivery;

    return {
      id: cart.id,
      userId: cart.userId,
      guestId: cart.guestId,
      items: cartItemsWithDetails,
      totalItems,
      subtotal,
      estimatedDelivery,
      total,
    };
  } catch (error) {
    console.error("Error getting cart:", error);
    return null;
  }
}

export async function addCartItem(productVariantId: string, quantity: number = 1): Promise<{ success: boolean; error?: string }> {
  try {
    if (quantity <= 0) {
      return { success: false, error: "Quantity must be greater than 0" };
    }

    const cart = await getOrCreateCart();
    if (!cart) {
      return { success: false, error: "Failed to create cart" };
    }

    // Check if variant exists and is in stock
    const variant = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, productVariantId))
      .limit(1);

    if (variant.length === 0) {
      return { success: false, error: "Product variant not found" };
    }

    if (variant[0].inStock < quantity) {
      return { success: false, error: "Insufficient stock" };
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productVariantId, productVariantId)
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update existing item quantity
      await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      // Add new item
      await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productVariantId,
          quantity,
        });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error adding cart item:", error);
    return { success: false, error: "Failed to add item to cart" };
  }
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<{ success: boolean; error?: string }> {
  try {
    if (quantity <= 0) {
      // Remove item if quantity is 0 or negative
      return await removeCartItem(cartItemId);
    }

    const cart = await getOrCreateCart();
    if (!cart) {
      return { success: false, error: "Cart not found" };
    }

    // Verify the item belongs to the current cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.cartId, cart.id)
        )
      )
      .limit(1);

    if (existingItem.length === 0) {
      return { success: false, error: "Cart item not found" };
    }

    // Check stock availability
    const variant = await db
      .select()
      .from(productVariants)
      .where(eq(productVariants.id, existingItem[0].productVariantId))
      .limit(1);

    if (variant.length === 0 || variant[0].inStock < quantity) {
      return { success: false, error: "Insufficient stock" };
    }

    // Update quantity
    await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, cartItemId));

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error updating cart item:", error);
    return { success: false, error: "Failed to update cart item" };
  }
}

export async function removeCartItem(cartItemId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const cart = await getOrCreateCart();
    if (!cart) {
      return { success: false, error: "Cart not found" };
    }

    // Verify the item belongs to the current cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.id, cartItemId),
          eq(cartItems.cartId, cart.id)
        )
      )
      .limit(1);

    if (existingItem.length === 0) {
      return { success: false, error: "Cart item not found" };
    }

    // Remove item
    await db
      .delete(cartItems)
      .where(eq(cartItems.id, cartItemId));

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error removing cart item:", error);
    return { success: false, error: "Failed to remove cart item" };
  }
}

export async function clearCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const cart = await getOrCreateCart();
    if (!cart) {
      return { success: false, error: "Cart not found" };
    }

    // Remove all items from cart
    await db
      .delete(cartItems)
      .where(eq(cartItems.cartId, cart.id));

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error clearing cart:", error);
    return { success: false, error: "Failed to clear cart" };
  }
}

export async function mergeGuestCartWithUserCart(): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    const { sessionToken } = await guestSession();
    if (!sessionToken) {
      return { success: true }; // No guest cart to merge
    }

    // Find guest record
    const guestRecord = await db
      .select()
      .from(guests)
      .where(eq(guests.sessionToken, sessionToken))
      .limit(1);
    
    if (guestRecord.length === 0) {
      return { success: true }; // No guest cart to merge
    }
    
    // Find guest cart
    const guestCart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.guestId, guestRecord[0].id), isNull(carts.userId)))
      .limit(1);

    if (guestCart.length === 0) {
      return { success: true }; // No guest cart to merge
    }

    // Find or create user cart
    let userCart = await db
      .select()
      .from(carts)
      .where(and(eq(carts.userId, user.id), isNull(carts.guestId)))
      .limit(1);

    if (userCart.length === 0) {
      // Create new user cart
      const [newUserCart] = await db
        .insert(carts)
        .values({
          userId: user.id,
          guestId: null,
        })
        .returning();
      userCart = [newUserCart];
    }

    // Get guest cart items
    const guestItems = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.cartId, guestCart[0].id));

    // Merge items into user cart
    for (const guestItem of guestItems) {
      const existingItem = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, userCart[0].id),
            eq(cartItems.productVariantId, guestItem.productVariantId)
          )
        )
        .limit(1);

      if (existingItem.length > 0) {
        // Update existing item quantity
        await db
          .update(cartItems)
          .set({ quantity: existingItem[0].quantity + guestItem.quantity })
          .where(eq(cartItems.id, existingItem[0].id));
      } else {
        // Add new item to user cart
        await db
          .insert(cartItems)
          .values({
            cartId: userCart[0].id,
            productVariantId: guestItem.productVariantId,
            quantity: guestItem.quantity,
          });
      }
    }

    // Delete guest cart and items
    await db.delete(cartItems).where(eq(cartItems.cartId, guestCart[0].id));
    await db.delete(carts).where(eq(carts.id, guestCart[0].id));

    // Clear guest session cookie
    const cookieStore = await cookies();
    cookieStore.delete("guest_session");

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    console.error("Error merging guest cart:", error);
    return { success: false, error: "Failed to merge guest cart" };
  }
}
