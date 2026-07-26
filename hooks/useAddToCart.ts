"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "./useCart";
import { getApiErrorMessage } from "@/lib/api-error";

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

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(json, "Failed to add item to cart"));

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };

  return { addToCart, loading };
}
