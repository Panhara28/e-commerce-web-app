"use client";

import { useEffect, useState } from "react";

export interface CartItem {
  id: number;
  productId: number;
  variantId: number | null;
  quantity: number;
  price: number;
  total: number;
  product?: any;
  variant?: any;
}

export interface CartData {
  items: CartItem[];
  totalQuantity: number;
  subtotal: number;
  total: number;
}

export function useCart() {
  const [cart, setCart] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Failed to fetch cart:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Fix: schedule async state update, not inside effect directly
  useEffect(() => {
    queueMicrotask(() => {
      fetchCart();
    });
  }, []);

  return {
    cart,
    loading,
    refresh: fetchCart,
  };
}
