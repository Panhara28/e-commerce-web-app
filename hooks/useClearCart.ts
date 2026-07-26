"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "./useCart";
import { getApiErrorMessage } from "@/lib/api-error";

export function useClearCart() {
  const [loading, setLoading] = useState(false);
  const { refresh } = useCart();

  const clearCart = async () => {
    setLoading(true);

    try {
      const res = await fetch("/api/cart/clear", {
        method: "POST",
      });

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(json, "Failed to clear cart"));

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to clear cart");
    } finally {
      setLoading(false);
    }
  };

  return { clearCart, loading };
}
