"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { type CartWithItems, type CartItemWithDetails } from "@/lib/actions/cart";
import { User } from "better-auth";
import CartSummary from "./CartSummary";

interface CartClientProps {
  initialCart: CartWithItems | null;
  user: User | null;
}

export default function CartClient({ initialCart, user }: CartClientProps) {
  const router = useRouter();
  const { 
    cart, 
    isLoading, 
    error, 
    fetchCart, 
    updateQuantity, 
    removeItem, 
    setError, 
    clearError 
  } = useCartStore();

  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (initialCart) {
      useCartStore.setState({ cart: initialCart });
    } else {
      fetchCart();
    }
  }, [initialCart, fetchCart]);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(itemId);
    setError(null);
    
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      setError("Failed to update quantity");
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    setIsUpdating(itemId);
    setError(null);
    
    try {
      await removeItem(itemId);
    } catch (error) {
      setError("Failed to remove item");
    } finally {
      setIsUpdating(null);
    }
  };


  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const getDeliveryStatus = (index: number) => {
    // Simulate delivery status based on item index
    if (index === 0) {
      return { status: "estimated", date: "24 Sep 2025", color: "text-orange" };
    } else {
      return { status: "delivered", date: "04 August", color: "text-green" };
    }
  };

  if (isLoading && !cart) {
    return <CartSkeleton />;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 mx-auto mb-4 bg-light-300 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h2 className="text-heading-3 text-dark-900 mb-2">Your cart is empty</h2>
          <p className="text-body text-dark-700 mb-6">Looks like you haven&apos;t added any items to your cart yet.</p>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center px-6 py-3 bg-dark-900 text-light-100 rounded-lg hover:bg-dark-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      {/* Cart Items */}
      <div className="lg:col-span-2">
        <h1 className="text-heading-3 text-dark-900 mb-6">Cart</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-body">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 text-caption hover:text-red-700 mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="space-y-6">
          {cart.items.map((item, index) => {
            const deliveryStatus = getDeliveryStatus(index);
            const price = parseFloat(item.variant.salePrice || item.variant.price);
            const itemTotal = price * item.quantity;
            
            return (
              <CartItem
                key={item.id}
                item={item}
                deliveryStatus={deliveryStatus}
                itemTotal={itemTotal}
                isUpdating={isUpdating === item.id}
                onQuantityChange={handleQuantityChange}
                onRemove={handleRemoveItem}
                formatPrice={formatPrice}
              />
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="lg:col-span-1">
        <CartSummary cart={cart} user={user} />
      </div>
    </div>
  );
}

interface CartItemProps {
  item: CartItemWithDetails;
  deliveryStatus: { status: string; date: string; color: string };
  itemTotal: number;
  isUpdating: boolean;
  onQuantityChange: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  formatPrice: (price: number) => string;
}

function CartItem({
  item,
  deliveryStatus,
  itemTotal,
  isUpdating,
  onQuantityChange,
  onRemove,
  formatPrice,
}: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityUpdate = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onQuantityChange(item.id, newQuantity);
  };

  return (
    <div className="flex gap-4 p-4 bg-light-100 border border-light-300 rounded-lg">
      {/* Product Image */}
      <div className="flex-shrink-0">
        <div className="w-20 h-20 bg-light-300 rounded-lg overflow-hidden">
          {item.image ? (
            <Image
              src={item.image.url}
              alt={item.product?.name || "Product"}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-light-300 flex items-center justify-center">
              <svg className="w-8 h-8 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0">
        <div className="mb-2">
          <p className={`text-caption ${deliveryStatus.color} font-medium`}>
            {deliveryStatus.status === "estimated" ? "Estimated arrival" : "Delivered on"} {deliveryStatus.date}
          </p>
        </div>
        
        <h3 className="text-body-medium text-dark-900 font-medium mb-1 line-clamp-2">
          {item.product?.name}
        </h3>
        
        <p className="text-caption text-dark-700 mb-2">
          {item.variant.color?.name && `${item.variant.color.name} • `}
          {item.variant.size?.name && `Size ${item.variant.size.name}`}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center border border-light-400 rounded-lg">
            <button
              onClick={() => handleQuantityUpdate(quantity - 1)}
              disabled={isUpdating || quantity <= 1}
              className="p-2 hover:bg-light-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Minus className="w-4 h-4 text-dark-700" />
            </button>
            
            <span className="px-4 py-2 text-body text-dark-900 font-medium min-w-[3rem] text-center">
              {isUpdating ? "..." : quantity}
            </span>
            
            <button
              onClick={() => handleQuantityUpdate(quantity + 1)}
              disabled={isUpdating}
              className="p-2 hover:bg-light-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Plus className="w-4 h-4 text-dark-700" />
            </button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-body text-dark-900 font-medium">
              {formatPrice(itemTotal)}
            </span>
            
            <button
              onClick={() => onRemove(item.id)}
              disabled={isUpdating}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <div className="h-8 w-24 bg-light-300 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4 bg-light-200 rounded-lg">
              <div className="w-20 h-20 bg-light-300 rounded animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-light-300 rounded animate-pulse w-3/4" />
                <div className="h-3 bg-light-300 rounded animate-pulse w-1/2" />
                <div className="h-3 bg-light-300 rounded animate-pulse w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="h-8 w-24 bg-light-300 rounded animate-pulse mb-6" />
        <div className="bg-light-200 p-6 rounded-lg space-y-4">
          <div className="h-4 bg-light-300 rounded animate-pulse" />
          <div className="h-4 bg-light-300 rounded animate-pulse" />
          <div className="h-4 bg-light-300 rounded animate-pulse" />
          <div className="h-12 bg-dark-900 rounded animate-pulse mt-6" />
        </div>
      </div>
    </div>
  );
}
