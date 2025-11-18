"use client";

import { useState } from "react";
import { useCart } from "./useCart";

export function useClearCart() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useCart();

  const clearCart = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to clear cart");

      await refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { clearCart, loading };
}
