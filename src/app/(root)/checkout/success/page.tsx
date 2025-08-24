import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getOrderByStripeSession } from "@/lib/actions/orders";
import OrderSuccess, { Order } from "@/components/OrderSuccess";

interface CheckoutSuccessPageProps {
  searchParams: {
    session_id?: string;
  };
}

async function OrderSuccessWrapper({ sessionId }: { sessionId: string }) {
  const result = await getOrderByStripeSession(sessionId);
  
  if (!result.success || !result.order) {
    notFound();
  }

  return <OrderSuccess 
  order={result.order as Order} />;
}

export default function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id } = searchParams;

  if (!session_id) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Suspense fallback={<OrderSuccessSkeleton />}>
        <OrderSuccessWrapper sessionId={session_id} />
      </Suspense>
    </div>
  );
}

function OrderSuccessSkeleton() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header Skeleton */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-light-300 rounded-full mx-auto mb-4 animate-pulse" />
        <div className="h-8 bg-light-300 rounded w-64 mx-auto mb-2 animate-pulse" />
        <div className="h-4 bg-light-300 rounded w-96 mx-auto mb-4 animate-pulse" />
        <div className="h-8 bg-light-300 rounded w-32 mx-auto animate-pulse" />
      </div>

      {/* Order Details Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-8 bg-light-300 rounded w-32 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 bg-light-200 rounded-lg">
                <div className="w-20 h-20 bg-light-300 rounded animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-light-300 rounded w-3/4 animate-pulse" />
                  <div className="h-3 bg-light-300 rounded w-1/2 animate-pulse" />
                  <div className="h-3 bg-light-300 rounded w-1/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="h-8 bg-light-300 rounded w-32 mb-6 animate-pulse" />
          <div className="bg-light-200 p-6 rounded-lg space-y-4">
            <div className="h-4 bg-light-300 rounded animate-pulse" />
            <div className="h-4 bg-light-300 rounded animate-pulse" />
            <div className="h-4 bg-light-300 rounded animate-pulse" />
            <div className="h-4 bg-light-300 rounded animate-pulse" />
            <div className="h-8 bg-light-300 rounded mt-4 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
