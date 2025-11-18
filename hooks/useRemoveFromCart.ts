"use client";

import { useState } from "react";
import { useCart } from "./useCart";

export function useRemoveFromCart() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useCart();

  const removeItem = async (itemId: number) => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart/remove", {
        method: "POST",
        body: JSON.stringify({ itemId }),
      });

      if (!res.ok) throw new Error("Failed to remove item");

      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { removeItem, loading };
}
