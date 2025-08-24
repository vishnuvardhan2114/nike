"use client";

import Image from "next/image";
import { CheckCircle, Package, Home } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
  id?: string;
  quantity: number;
  priceAtPurchase?: string;
  variant: {
    id: string;
    price: string;
    salePrice?: string | null;
    color?: {
      name: string;
    } | null;
    size?: {
      name: string;
    } | null;
  } | null;
  product: {
    id: string;
    name: string;
  } | null;
  image?: {
    id: string;
    url: string;
  } | null;
}

export interface Order {
  id: string;
  status: string;
  totalAmount: string;
  createdAt: Date;
  items: OrderItem[];
  payment?: {
    id: string;
    method: string;
    status: string;
    transactionId?: string | null;
  } | null;
}

interface OrderSuccessProps {
  order: Order;
}

export default function OrderSuccess({ order }: OrderSuccessProps) {
  const router = useRouter();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "text-green-600";
      case "pending":
        return "text-yellow-600";
      case "shipped":
        return "text-blue-600";
      case "delivered":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-heading-2 text-dark-900 mb-2">Thank you for your order!</h1>
        <p className="text-body text-dark-700 mb-4">
          Your order has been confirmed and will be shipped soon.
        </p>
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-caption font-medium">
          <Package className="w-4 h-4" />
          Order #{order.id.slice(0, 8).toUpperCase()}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Items */}
        <div className="lg:col-span-2">
          <h2 className="text-heading-3 text-dark-900 mb-6">Order Details</h2>
          
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-light-100 border border-light-300 rounded-lg">
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
                                     <h3 className="text-body-medium text-dark-900 font-medium mb-1">
                     {item.product?.name || "Product"}
                   </h3>
                   <p className="text-caption text-dark-700 mb-2">
                     {item.variant?.color?.name && `${item.variant.color.name} • `}
                     {item.variant?.size?.name && `Size ${item.variant.size.name}`}
                   </p>
                  <div className="flex items-center justify-between">
                    <span className="text-caption text-dark-600">
                      Qty: {item.quantity}
                    </span>
                                         <span className="text-body text-dark-900 font-medium">
                       {formatPrice(parseFloat(item.priceAtPurchase || "0") * item.quantity)}
                     </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <h2 className="text-heading-3 text-dark-900 mb-6">Order Summary</h2>
          
          <div className="bg-light-200 p-6 rounded-lg space-y-4">
            <div className="flex justify-between text-body">
              <span className="text-dark-700">Order Date</span>
              <span className="text-dark-900 font-medium">
                {formatDate(order.createdAt)}
              </span>
            </div>
            
            <div className="flex justify-between text-body">
              <span className="text-dark-700">Order Status</span>
              <span className={`font-medium ${getOrderStatusColor(order.status)}`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>
            
            <div className="flex justify-between text-body">
              <span className="text-dark-700">Payment Method</span>
              <span className="text-dark-900 font-medium capitalize">
                {order.payment?.method || "Stripe"}
              </span>
            </div>
            
            {order.payment?.transactionId && (
              <div className="flex justify-between text-body">
                <span className="text-dark-700">Transaction ID</span>
                <span className="text-dark-900 font-medium text-caption">
                  {order.payment.transactionId.slice(0, 8)}...
                </span>
              </div>
            )}
            
            <div className="border-t border-light-400 pt-4">
              <div className="flex justify-between text-body-medium">
                <span className="text-dark-900 font-semibold">Total</span>
                <span className="text-dark-900 font-semibold">
                                     {formatPrice(parseFloat(order.totalAmount))}
                </span>
              </div>
            </div>
          </div>

          {/* Next Steps */}
          <div className="mt-6 bg-blue-50 p-6 rounded-lg">
            <h3 className="text-body-medium text-dark-900 font-medium mb-4">
              What happens next?
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-caption font-bold">1</span>
                </div>
                <div>
                  <p className="text-caption text-dark-700">
                    We&apos;ll send you an email confirmation with your order details
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-caption font-bold">2</span>
                </div>
                <div>
                  <p className="text-caption text-dark-700">
                    Your order will be processed and shipped within 1-2 business days
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600 text-caption font-bold">3</span>
                </div>
                <div>
                  <p className="text-caption text-dark-700">
                    You&apos;ll receive tracking information once your order ships
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => router.push("/products")}
              className="w-full bg-dark-900 text-light-100 py-3 px-6 rounded-full hover:bg-dark-700 transition-colors text-body-medium font-medium flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full bg-light-300 text-dark-700 py-3 px-6 rounded-full hover:bg-light-400 transition-colors text-body-medium font-medium"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
