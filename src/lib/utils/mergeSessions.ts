import { db } from "@/lib/db";
import { carts, cartItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/actions";
import { guestSession } from "@/lib/auth/actions";

export async function mergeGuestCartWithUserCart() {
  try {
    const user = await getCurrentUser();
    const { sessionToken: guestToken } = await guestSession();

    if (!user || !guestToken) {
      return { success: false, error: "No user or guest session found" };
    }

    // Find guest cart
    const guestCart = await db
      .select()
      .from(carts)
      .where(eq(carts.guestId, guestToken))
      .limit(1);

    if (!guestCart || guestCart.length === 0) {
      return { success: false, error: "No guest cart found" };
    }

    // Find user cart
    const userCart = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, user.id))
      .limit(1);

    if (userCart && userCart.length > 0) {
      // User cart exists, merge items
      const guestCartItems = await db
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, guestCart[0].id));

      // Move items to user cart
      for (const item of guestCartItems) {
        // Check if item already exists in user cart
        const existingItem = await db
          .select()
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, userCart[0].id),
              eq(cartItems.productVariantId, item.productVariantId)
            )
          )
          .limit(1);

        if (existingItem && existingItem.length > 0) {
          // Update quantity
          await db
            .update(cartItems)
            .set({ quantity: existingItem[0].quantity + item.quantity })
            .where(eq(cartItems.id, existingItem[0].id));
        } else {
          // Add new item
          await db
            .insert(cartItems)
            .values({
              cartId: userCart[0].id,
              productVariantId: item.productVariantId,
              quantity: item.quantity,
            });
        }
      }

      // Delete guest cart
      await db.delete(carts).where(eq(carts.id, guestCart[0].id));
    } else {
      // No user cart, just update guest cart to user cart
      await db
        .update(carts)
        .set({
          userId: user.id,
          guestId: null,
        })
        .where(eq(carts.id, guestCart[0].id));
    }

    return { success: true };
  } catch (error) {
    console.error("Error merging guest cart with user cart:", error);
    return { success: false, error: "Failed to merge carts" };
  }
}

export async function getCurrentCartId() {
  try {
    const user = await getCurrentUser();
    const { sessionToken: guestToken } = await guestSession();

    if (user) {
      // Get user cart
      const userCart = await db
        .select()
        .from(carts)
        .where(eq(carts.userId, user.id))
        .limit(1);

      if (userCart && userCart.length > 0) {
        return { success: true, cartId: userCart[0].id };
      }
    }

    if (guestToken) {
      // Get guest cart
      const guestCart = await db
        .select()
        .from(carts)
        .where(eq(carts.guestId, guestToken))
        .limit(1);

      if (guestCart && guestCart.length > 0) {
        return { success: true, cartId: guestCart[0].id };
      }
    }

    return { success: false, error: "No cart found" };
  } catch (error) {
    console.error("Error getting current cart ID:", error);
    return { success: false, error: "Failed to get cart ID" };
  }
}
