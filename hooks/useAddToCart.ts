"use client";

import { useState } from "react";
import { useCart } from "./useCart";

export function useAddToCart() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useCart();

  const addToCart = async (
    productId: number,
    variantId?: number | null,
    quantity: number = 1
  ) => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, variantId, quantity }),
      });

      if (!res.ok) throw new Error("Failed add to cart");

      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
}
