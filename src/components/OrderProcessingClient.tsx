"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { getOrderByStripeSession } from "@/lib/actions/orders";
import OrderSuccess, { Order } from "./OrderSuccess";

interface OrderProcessingClientProps {
  sessionId: string;
}

export default function OrderProcessingClient({ sessionId }: OrderProcessingClientProps) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 10;

  useEffect(() => {
    const checkOrder = async () => {
      try {
        const result = await getOrderByStripeSession(sessionId);
        if (result.success && result.order) {
          setOrder(result.order as Order);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error checking order:", error);
      }

      setAttempts(prev => prev + 1);
      
      if (attempts >= maxAttempts) {
        setLoading(false);
        return;
      }

      // Wait 2 seconds before next attempt
      setTimeout(checkOrder, 2000);
    };

    checkOrder();
  }, [sessionId, attempts]);

  if (order) {
    return <OrderSuccess order={order} />;
  }

  if (!loading && attempts >= maxAttempts) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-8 h-8 text-yellow-600" />
          </div>
          <h1 className="text-heading-2 text-dark-900 mb-2">Order processing delayed</h1>
          <p className="text-body text-dark-700 mb-4">
            Your payment was successful, but we&apos;re still processing your order.
          </p>
          <div className="inline-flex items-center gap-2 bg-yellow-50 text-yellow-700 px-4 py-2 rounded-full text-caption font-medium">
            Session ID: {sessionId.slice(0, 8)}...
          </div>
        </div>

        <div className="bg-light-200 p-6 rounded-lg text-center">
          <p className="text-body text-dark-700 mb-4">
            Please check back in a few minutes or contact support if you don&apos;t see your order.
          </p>
          <p className="text-caption text-dark-600">
            You can also check your email for order confirmation.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Processing Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h1 className="text-heading-2 text-dark-900 mb-2">Processing your order...</h1>
        <p className="text-body text-dark-700 mb-4">
          Please wait while we confirm your payment and create your order.
        </p>
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-caption font-medium">
          Session ID: {sessionId.slice(0, 8)}...
        </div>
      </div>

      {/* Processing Message */}
      <div className="bg-light-200 p-6 rounded-lg text-center">
        <p className="text-body text-dark-700 mb-4">
          Your payment has been processed successfully. We&apos;re now creating your order.
        </p>
        <p className="text-caption text-dark-600">
          Attempt {attempts + 1} of {maxAttempts} - This page will automatically refresh to show your order details.
        </p>
      </div>
    </div>
  );
}
