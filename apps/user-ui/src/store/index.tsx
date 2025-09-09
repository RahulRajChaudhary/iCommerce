import { create } from "zustand";
import { persist } from "zustand/middleware";
// import { sendKafkaEvent } from "../actions/track-user";

type Product = {
  id: string;
  title: string;
  price: number;
  image: string;
  quantity?: number;
  shopId: string;
};

type Store = {
  cart: Product[];
  wishlist: Product[];
  addToCart: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromCart: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;

  addToWishlist: (
    product: Product,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
  removeFromWishlist: (
    id: string,
    user: any,
    location: any,
    deviceInfo: any
  ) => void;
};

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      wishlist: [],

      // Add to Cart
      addToCart: (product, user, location, deviceInfo) => {
        set((state) => {
          const existing = state.cart.find((item) => item.id === product.id);
          if (existing) {
            return {
              cart: state.cart.map((item) =>
                item.id === product.id
                  ? { ...item, quantity: (item.quantity ?? 1) + 1 }
                  : item
              ),
            };
          }
          return {
            cart: [...state.cart, { ...product, quantity: product?.quantity }],
          };
        });
       
      },

      // remove from cart
      removeFromCart: (id, user, location, deviceInfo) => {
        // find the product before calling set
        const removeProduct = get().cart.find((item) => item.id === id);

        set((state) => ({
          cart: state.cart?.filter((item) => item.id !== id),
        }));

        
      },

      // Add to wishlist
      addToWishlist: (product, user, location, deviceInfo) => {
        set((state) => {
          if (state.wishlist.find((item) => item.id === product.id))
            return state;
          return { wishlist: [...state.wishlist, product] };
        });

        
      },

      removeFromWishlist: (id, user, location, deviceInfo) => {
        // Find the product BEFORE calling `set`
        const removeProduct = get().wishlist.find((item) => item.id === id);

        set((state) => ({
          wishlist: state.wishlist.filter((item) => item.id !== id),
        }));
      },
    }),
    { name: "store-storage" }
  )
);