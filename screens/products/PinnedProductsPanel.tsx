"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pin, PinOff } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api-error";

export type PinnedProduct = {
  id: number;
  slug: string;
  title: string | null;
  productCode: string | null;
  price: number;
  pinOrder: number | null;
  media?: Array<{ url: string }>;
};

type Props = {
  /** Bump to make the panel reload (e.g. after pinning from the table). */
  refreshKey: number;
  /** Called after the panel changes pins, so the table can reload. */
  onChange: () => void;
};

function SortableRow({
  product,
  index,
  disabled,
  onUnpin,
}: {
  product: PinnedProduct;
  index: number;
  disabled: boolean;
  onUnpin: (product: PinnedProduct) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: product.slug, disabled });
  const image = product.media?.[0]?.url;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-lg border bg-background px-3 py-2 ${
        isDragging ? "relative z-10 shadow-lg ring-2 ring-amber-400" : ""
      }`}
    >
      <button
        type="button"
        className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing disabled:cursor-not-allowed"
        aria-label={`Drag to reorder ${product.title ?? "product"}`}
        disabled={disabled}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <span className="w-6 text-center text-sm font-semibold text-amber-600">
        {index + 1}
      </span>

      <div className="h-10 w-10 shrink-0 overflow-hidden rounded border bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{product.title || "-"}</div>
        <div className="text-xs text-muted-foreground">
          {product.productCode || "-"} · ${product.price}
        </div>
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={disabled}
        onClick={() => onUnpin(product)}
        title="Unpin product"
        aria-label={`Unpin ${product.title ?? "product"}`}
      >
        <PinOff className="h-4 w-4 text-amber-600" />
      </Button>
    </li>
  );
}

export default function PinnedProductsPanel({ refreshKey, onChange }: Props) {
  const [items, setItems] = useState<PinnedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/products/pinned", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok || json.status !== "ok") {
        throw new Error(getApiErrorMessage(json, "Failed to load pinned products"));
      }
      setItems(json.data as PinnedProduct[]);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to load pinned products");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load, refreshKey]);

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    const previous = items;
    const oldIndex = items.findIndex((p) => p.slug === active.id);
    const newIndex = items.findIndex((p) => p.slug === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);

    setItems(reordered); // optimistic
    setSaving(true);
    try {
      const res = await fetch("/api/products/pinned/reorder", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: reordered.map((p) => p.slug) }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(getApiErrorMessage(json, "Failed to save order"));
      }
      setItems(json.data as PinnedProduct[]);
      toast.success("Pinned order saved");
      onChange();
    } catch (err) {
      console.error(err);
      setItems(previous);
      toast.error(err instanceof Error ? err.message : "Failed to save order");
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleUnpin = async (product: PinnedProduct) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${product.slug}/pin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pinned: false }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => null);
        throw new Error(getApiErrorMessage(json, "Failed to unpin product"));
      }
      toast.success(`"${product.title}" unpinned`);
      await load();
      onChange();
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Failed to unpin product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="mb-6 px-10 py-6">
      <div className="mb-4 flex items-center gap-2">
        <Pin className="h-4 w-4 fill-amber-500 text-amber-500" />
        <h2 className="text-lg font-semibold">Pinned products</h2>
        <span className="text-sm text-muted-foreground">
          Shown first on the storefront, in this order. Drag to reorder.
        </span>
        {saving ? (
          <span className="ml-auto text-xs text-muted-foreground">Saving…</span>
        ) : null}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No pinned products yet. Use the pin button on a product below to pin it.
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((p) => p.slug)}
            strategy={verticalListSortingStrategy}
          >
            <ul className="space-y-2">
              {items.map((product, index) => (
                <SortableRow
                  key={product.slug}
                  product={product}
                  index={index}
                  disabled={saving}
                  onUnpin={handleUnpin}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </Card>
  );
}
