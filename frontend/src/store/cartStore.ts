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

export interface AppliedCoupon {
  code: string;
  discount: number;
  type: string;
  name: string;
}

interface CartState {
  items: CartItemType[];
  cartId: string | null;
  itemCount: number;
  total: number;
  appliedCoupon: AppliedCoupon | null;
  setCart: (id: string, items: CartItemType[]) => void;
  setCoupon: (coupon: AppliedCoupon) => void;
  clearCoupon: () => void;
  clear: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  cartId: null,
  itemCount: 0,
  total: 0,
  appliedCoupon: null,

  setCart: (id, items) => {
    const count = items.reduce((acc, item) => acc + item.quantity, 0);
    const total = items.reduce((acc, item) => acc + item.quantity * item.price, 0);
    set({ cartId: id, items, itemCount: count, total });
  },

  setCoupon: (coupon) => set({ appliedCoupon: coupon }),

  clearCoupon: () => set({ appliedCoupon: null }),

  clear: () => set({ items: [], cartId: null, itemCount: 0, total: 0, appliedCoupon: null }),
}));
