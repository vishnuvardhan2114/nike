"use client";

import { useEffect } from "react";
import { useCartStore } from "@/lib/store/cart";

interface CartProviderProps {
  children: React.ReactNode;
}

export default function CartProvider({ children }: CartProviderProps) {
  const { fetchCart } = useCartStore();

  useEffect(() => {
    // Initialize cart on app load
    fetchCart();
  }, [fetchCart]);

  return <>{children}</>;
}
