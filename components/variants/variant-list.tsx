"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, PackageOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type SubVariant = {
  color: string;
  material: string;
  price: number;
  stock: number;
};

type Variant = {
  size?: string;
  color?: string;
  material?: string;
  price: number;
  stock: number;
  sub_variants: SubVariant[];
};

type Props = {
  data: { variants: Variant[] };
  onVariantsChange?: (updated: Variant[]) => void;
};

export default function VariantList({ data, onVariantsChange }: Props) {
  const [variants, setVariants] = useState<Variant[]>(data.variants);
  const [expanded, setExpanded] = useState<number[]>([]);

  useEffect(() => {
    const id = setTimeout(() => setVariants(data.variants), 0);
    return () => clearTimeout(id);
  }, [data.variants]);

  const toggleExpand = (index: number) =>
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  // 🔧 Determine if a variant has “real” sub-variants (with color/material)
  const hasRealSubVariants = (variant: Variant): boolean => {
    if (!variant.sub_variants?.length) return false;
    return variant.sub_variants.some(
      (s) => s.color.trim() !== "" || s.material.trim() !== ""
    );
  };

  const handleChange = (
    vIndex: number,
    sIndex: number | null,
    field: "price" | "stock",
    value: string
  ) => {
    const newVariants = [...variants];
    const num = parseFloat(value) || 0;
    const variant = newVariants[vIndex];
    const realSubs = hasRealSubVariants(variant);

    // ✅ Case 1: No sub-variants (update parent only)
    if (!realSubs) {
      if (sIndex === null) {
        newVariants[vIndex][field] = num;
        // Keep sub_variants (dummy entry) in sync visually
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({ ...s, [field]: num })
        );
      }
    }

    // ✅ Case 2: With real sub-variants
    else {
      if (sIndex === null) {
        // Editing parent → propagate to all subs
        newVariants[vIndex][field] = num;
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({ ...s, [field]: num })
        );
      } else {
        // Editing specific sub-variant
        const updatedSubs = newVariants[vIndex].sub_variants.map((sub, i) =>
          i === sIndex ? { ...sub, [field]: num } : sub
        );
        newVariants[vIndex].sub_variants = updatedSubs;

        if (field === "price") {
          const prices = updatedSubs.map((s) => s.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          newVariants[vIndex].price = min === max ? min : 0;
        }
      }
    }

    setVariants(newVariants);
    onVariantsChange?.(newVariants);
  };

  const getPricePlaceholder = (variant: Variant) => {
    const prices = variant.sub_variants.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (!variant.sub_variants.length) return "$ 0.00";
    return min === max
      ? `$ ${min.toFixed(2)}`
      : `$ ${min.toFixed(2)} – ${max.toFixed(2)}`;
  };

  const hasExpandableChildren = (variant: Variant) => {
    const validSubs = variant.sub_variants.filter(
      (s) =>
        (s.color && s.color.trim().length > 0) ||
        (s.material && s.material.trim().length > 0)
    );
    if (validSubs.length === 0) return false;
    const uniqueCombos = new Set(
      validSubs.map(
        (s) =>
          `${s.color?.trim().toLowerCase() || ""}-${
            s.material?.trim().toLowerCase() || ""
          }`
      )
    );
    return uniqueCombos.size >= 1;
  };

  return (
    <div className="space-y-4">
      {variants.map((variant, vIndex) => {
        const prices = variant.sub_variants.map((s) => s.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const isRange = min !== max;
        const expandable = hasExpandableChildren(variant);
        const realSubs = hasRealSubVariants(variant);

        return (
          <Card
            key={vIndex}
            className="p-4 border border-border/50 bg-card shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Parent Header */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ${
                expandable ? "hover:bg-muted/40 rounded-md p-2 cursor-pointer" : ""
              }`}
              onClick={() => expandable && toggleExpand(vIndex)}
            >
              {/* Left side */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-md">
                  <PackageOpen className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {variant.size ||
                      variant.color ||
                      variant.material ||
                      `Variant ${vIndex + 1}`}
                  </div>
                  {variant.sub_variants.length > 1 && (
                    <p className="text-xs text-muted-foreground">
                      {variant.sub_variants.length} combinations
                    </p>
                  )}
                </div>
              </div>

              {/* Right side inputs */}
              <div className="flex items-center gap-3 sm:ml-auto">
                <Input
                  type="number"
                  placeholder={getPricePlaceholder(variant)}
                  className="w-50 text-right"
                  value={
                    isRange ? "" : variant.price ? variant.price.toString() : ""
                  }
                  onChange={(e) =>
                    handleChange(vIndex, null, "price", e.target.value)
                  }
                />
                <Input
                  type="number"
                  placeholder="Stock"
                  className="w-50 text-right"
                  value={variant.stock ? variant.stock.toString() : ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "stock", e.target.value)
                  }
                />
                {expandable &&
                  (expanded.includes(vIndex) ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  ))}
              </div>
            </div>

            {/* Sub Variants */}
            {expandable && expanded.includes(vIndex) && realSubs && (
              <div className="mt-3 pl-9 space-y-2">
                <Separator className="my-2" />
                {variant.sub_variants.map((sub, sIndex) => (
                  <div
                    key={sIndex}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 py-1"
                  >
                    <div className="flex items-center gap-2">
                      <PackageOpen className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {sub.color || sub.material
                          ? `${sub.color || ""}${
                              sub.color && sub.material ? " / " : ""
                            }${sub.material || ""}`
                          : "Sub variant"}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 sm:ml-auto">
                      <Input
                        type="number"
                        placeholder="$ 0.00"
                        className="w-50 text-right"
                        value={sub.price ? sub.price.toString() : ""}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "price", e.target.value)
                        }
                      />
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-50 text-right"
                        value={sub.stock ? sub.stock.toString() : ""}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "stock", e.target.value)
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
