"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "./useCart";
import { getApiErrorMessage } from "@/lib/api-error";

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

      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(getApiErrorMessage(json, "Failed to update cart"));

      await refresh();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to update cart");
    } finally {
      setLoading(false);
    }
  };

  return { updateItem, loading };
}
