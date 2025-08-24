import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/actions";
import { getCart } from "@/lib/actions/cart";
import CartClient from "@/components/CartClient";

export default async function CartPage() {
  const user = await getCurrentUser();
  const cart = await getCart();

  return (
    <div className="min-h-screen bg-light-100">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<CartSkeleton />}>
          <CartClient initialCart={cart} user={user} />
        </Suspense>
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
