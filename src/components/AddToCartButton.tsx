"use client";

import { useState } from "react";
import { useCartStore } from "@/lib/store/cart";
import { ShoppingBag } from "lucide-react";

interface AddToCartButtonProps {
  productVariantId: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export default function AddToCartButton({
  productVariantId,
  disabled = false,
  className = "",
  children = "Add to Bag",
}: AddToCartButtonProps) {
  const { addItem, isLoading, setError } = useCartStore();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (disabled || isAdding) return;

    setIsAdding(true);
    setError(null);

    try {
      await addItem(productVariantId, 1);
    } catch (error) {
      setError("Failed to add item to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={disabled || isAdding || isLoading}
      className={`flex items-center justify-center gap-2 rounded-full bg-dark-900 px-6 py-4 text-body-medium text-light-100 transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-dark-500] disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <ShoppingBag className="h-5 w-5" />
      {isAdding ? "Adding..." : children}
    </button>
  );
}
