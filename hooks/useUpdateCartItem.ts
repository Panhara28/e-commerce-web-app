"use client";

import { useState } from "react";
import { useCart } from "./useCart";

export function useUpdateCartItem() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useCart();

  const updateItem = async (itemId: number, quantity: number) => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart/update", {
        method: "POST",
        body: JSON.stringify({ itemId, quantity }),
      });

      if (!res.ok) throw new Error("Failed to update cart");

      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { updateItem, loading };
}
