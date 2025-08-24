"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";
import { useCartStore, notificationEmitter } from "@/lib/store/cart";

export default function CartNotification() {
  const { error, setError } = useCartStore();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const handleSuccess = (message?: string) => {
      if (message) {
        setSuccessMessage(message);
        setShowSuccess(true);
      }
    };

    const handleError = (message?: string) => {
      if (message) {
        setError(message);
      }
    };

    notificationEmitter.on('cartSuccess', handleSuccess);
    notificationEmitter.on('cartError', handleError);

    return () => {
      notificationEmitter.off('cartSuccess', handleSuccess);
      notificationEmitter.off('cartError', handleError);
    };
  }, [setError]);

  useEffect(() => {
    if (error) {
      // Auto-hide error after 5 seconds
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  useEffect(() => {
    if (showSuccess) {
      // Auto-hide success after 3 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage("");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const handleCloseError = () => {
    setError(null);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
    setSuccessMessage("");
  };

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-red-800">{error}</p>
            </div>
            <button
              onClick={handleCloseError}
              className="ml-3 text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="fixed top-4 right-4 z-50 max-w-sm">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
            <div className="ml-3 flex-1">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
            <button
              onClick={handleCloseSuccess}
              className="ml-3 text-green-500 hover:text-green-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Helper function to show success notification
export const showCartSuccess = (message: string) => {
  // This would need to be implemented with a global state or context
  // For now, we'll use a simple approach with localStorage
  localStorage.setItem("cartSuccessMessage", message);
  window.dispatchEvent(new Event("cartSuccess"));
};
