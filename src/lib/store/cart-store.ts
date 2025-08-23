import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../db/schema';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, size?: string, color?: string) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity = 1, size, color) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => 
              item.id === product.id && 
              item.selectedSize === size && 
              item.selectedColor === color
          );

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === product.id && 
                item.selectedSize === size && 
                item.selectedColor === color
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return {
            items: [
              ...state.items,
              { ...product, quantity, selectedSize: size, selectedColor: color },
            ],
          };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.id !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: quantity <= 0 
            ? state.items.filter((item) => item.id !== productId)
            : state.items.map((item) =>
                item.id === productId ? { ...item, quantity } : item
              ),
        })),
      clearCart: () => set({ items: [] }),
      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },
      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

