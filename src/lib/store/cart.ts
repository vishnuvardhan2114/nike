import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getCart, addCartItem, updateCartItem, removeCartItem, clearCart, type CartWithItems } from '@/lib/actions/cart';

// Event emitter for notifications
class NotificationEmitter {
  private listeners: Map<string, ((data?: string) => void)[]> = new Map();

  on(event: string, callback: (data?: string) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  emit(event: string, data?: string) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  off(event: string, callback: (data?: string) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }
}

export const notificationEmitter = new NotificationEmitter();

interface CartState {
  // Server state
  cart: CartWithItems | null;
  isLoading: boolean;
  error: string | null;
  
  // Client state for optimistic updates
  pendingUpdates: Map<string, number>; // cartItemId -> quantity
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productVariantId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  clearCartItems: () => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed values
  getItemCount: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,
      error: null,
      pendingUpdates: new Map(),
      
      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const cart = await getCart();
          set({ cart, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to fetch cart', 
            isLoading: false 
          });
        }
      },
      
      addItem: async (productVariantId: string, quantity: number = 1) => {
        set({ isLoading: true, error: null });
        try {
          const result = await addCartItem(productVariantId, quantity);
          if (result.success) {
            await get().fetchCart();
            notificationEmitter.emit('cartSuccess', 'Item added to cart successfully!');
          } else {
            set({ error: result.error || 'Failed to add item', isLoading: false });
            notificationEmitter.emit('cartError', result.error || 'Failed to add item');
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to add item';
          set({ error: errorMessage, isLoading: false });
          notificationEmitter.emit('cartError', errorMessage);
        }
      },
      
      updateQuantity: async (cartItemId: string, quantity: number) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        
        // Optimistic update
        const optimisticCart = {
          ...currentCart,
          items: currentCart.items.map(item => 
            item.id === cartItemId 
              ? { ...item, quantity }
              : item
          )
        };
        
        // Recalculate totals
        const totalItems = optimisticCart.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = optimisticCart.items.reduce((sum, item) => {
          const price = parseFloat(item.variant.salePrice || item.variant.price);
          return sum + (price * item.quantity);
        }, 0);
        const estimatedDelivery = totalItems > 0 ? 2.00 : 0;
        const total = subtotal + estimatedDelivery;
        
        set({ 
          cart: { ...optimisticCart, totalItems, subtotal, estimatedDelivery, total },
          isLoading: true,
          error: null 
        });
        
        try {
          const result = await updateCartItem(cartItemId, quantity);
          if (result.success) {
            await get().fetchCart();
            notificationEmitter.emit('cartSuccess', 'Cart updated successfully!');
          } else {
            set({ error: result.error || 'Failed to update quantity', isLoading: false });
            notificationEmitter.emit('cartError', result.error || 'Failed to update quantity');
            // Revert optimistic update
            await get().fetchCart();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update quantity';
          set({ error: errorMessage, isLoading: false });
          notificationEmitter.emit('cartError', errorMessage);
          // Revert optimistic update
          await get().fetchCart();
        }
      },
      
      removeItem: async (cartItemId: string) => {
        const currentCart = get().cart;
        if (!currentCart) return;
        
        // Optimistic update
        const optimisticCart = {
          ...currentCart,
          items: currentCart.items.filter(item => item.id !== cartItemId)
        };
        
        // Recalculate totals
        const totalItems = optimisticCart.items.reduce((sum, item) => sum + item.quantity, 0);
        const subtotal = optimisticCart.items.reduce((sum, item) => {
          const price = parseFloat(item.variant.salePrice || item.variant.price);
          return sum + (price * item.quantity);
        }, 0);
        const estimatedDelivery = totalItems > 0 ? 2.00 : 0;
        const total = subtotal + estimatedDelivery;
        
        set({ 
          cart: { ...optimisticCart, totalItems, subtotal, estimatedDelivery, total },
          isLoading: true,
          error: null 
        });
        
        try {
          const result = await removeCartItem(cartItemId);
          if (result.success) {
            await get().fetchCart();
            notificationEmitter.emit('cartSuccess', 'Item removed from cart successfully!');
          } else {
            set({ error: result.error || 'Failed to remove item', isLoading: false });
            notificationEmitter.emit('cartError', result.error || 'Failed to remove item');
            // Revert optimistic update
            await get().fetchCart();
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to remove item';
          set({ error: errorMessage, isLoading: false });
          notificationEmitter.emit('cartError', errorMessage);
          // Revert optimistic update
          await get().fetchCart();
        }
      },
      
      clearCartItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const result = await clearCart();
          if (result.success) {
            await get().fetchCart();
          } else {
            set({ error: result.error || 'Failed to clear cart', isLoading: false });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to clear cart', 
            isLoading: false 
          });
        }
      },
      
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
      
      getItemCount: () => {
        const cart = get().cart;
        return cart ? cart.totalItems : 0;
      },
      
      getTotal: () => {
        const cart = get().cart;
        return cart ? cart.total : 0;
      },
      
      getSubtotal: () => {
        const cart = get().cart;
        return cart ? cart.subtotal : 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        // Only persist minimal state, fetch from server on load
        cart: state.cart,
      }),
    }
  )
);