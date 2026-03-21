import { create } from 'zustand';

export interface CartItemType {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  product?: {
    name: string;
    slug: string;
    images: { url: string }[];
  };
  variant?: {
    name: string;
    price: number;
  };
}

interface CartState {
  items: CartItemType[];
  cartId: string | null;
  itemCount: number;
  total: number;
  setCart: (id: string, items: CartItemType[]) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  cartId: null,
  itemCount: 0,
  total: 0,

  setCart: (id, items) => {
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    set({ cartId: id, items, itemCount: count, total });
  },

  clear: () => set({ items: [], cartId: null, itemCount: 0, total: 0 }),
}));
