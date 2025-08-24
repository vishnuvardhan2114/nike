"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, Loader2 } from "lucide-react";
import { createStripeCheckoutSession } from "@/lib/actions/checkout";
import { getCurrentCartId } from "@/lib/utils/mergeSessions";
import { type CartWithItems } from "@/lib/actions/cart";
import { User } from "better-auth";
import Link from "next/link";

interface CartSummaryProps {
  cart: CartWithItems;
  user: User | null;
}

export default function CartSummary({ cart, user }: CartSummaryProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  
  const handleGuestCheckout = () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
  };


  const handleCheckout = async () => {
    if (!cart || cart.items.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    handleGuestCheckout();
    try {
      // Get current cart ID
      const cartResult = await getCurrentCartId();
      if (!cartResult.success) {
        throw new Error("Failed to get cart information");
      }

      // Create Stripe checkout session
      const result = await createStripeCheckoutSession(cartResult.cartId as string);

      if (!result.success) {
        throw new Error(result.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to initiate checkout. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-light-200 p-6 rounded-lg space-y-6">
      <h2 className="text-heading-3 text-dark-900 flex items-center gap-2">
        Order Summary
      </h2>

      <div className="space-y-4">
        <div className="flex justify-between text-body">
          <span className="text-dark-700">Subtotal ({cart.items.length} items)</span>
          <span className="text-dark-900 font-medium">{formatPrice(cart.subtotal)}</span>
        </div>

        <div className="flex justify-between text-body">
          <span className="text-dark-700">Estimated Delivery & Handling</span>
          <span className="text-dark-900 font-medium">{formatPrice(cart.estimatedDelivery)}</span>
        </div>

        <div className="border-t border-light-400 pt-4">
          <div className="flex justify-between text-body-medium">
            <span className="text-dark-900 font-semibold">Total</span>
            <span className="text-dark-900 font-semibold">{formatPrice(cart.total)}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleCheckout}
          disabled={isProcessing || cart.items.length === 0}
          className="w-full bg-dark-900 cursor-pointer text-light-100 py-4 px-6 rounded-full hover:bg-dark-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-body-medium font-medium flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Proceed to Checkout
            </>
          )}
        </button>

        {!user && (
          <p className="text-caption text-dark-600 text-center">
            <Link href="/sign-in" className="text-dark-900 font-medium border-b border-dark-900">
              Sign in
            </Link> for faster checkout and order tracking

          </p>
        )}
      </div>

    </div>
  );
}
