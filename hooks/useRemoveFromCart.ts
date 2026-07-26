"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "./useCart";
import { getApiErrorMessage } from "@/lib/api-error";

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

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(json, "Failed to remove item"));

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to remove item");
    } finally {
      setLoading(false);
    }
  };

  return { removeItem, loading };
}
