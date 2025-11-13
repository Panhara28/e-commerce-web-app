"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, PackageOpen, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";

type SubVariant = {
  color: string;
  material: string;
  price: number;
  stock: number;
  sku?: string;
  imageVariant?: string;
};

type Variant = {
  size?: string;
  color?: string;
  material?: string;
  price: number;
  stock: number;
  sku?: string;
  imageVariant?: string;
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

  const hasRealSubVariants = (variant: Variant): boolean => {
    if (!variant.sub_variants?.length) return false;
    return variant.sub_variants.some(
      (s) => s.color.trim() !== "" || s.material.trim() !== ""
    );
  };

  const handleChange = (
    vIndex: number,
    sIndex: number | null,
    field: keyof Variant | keyof SubVariant,
    value: string
  ) => {
    const newVariants = [...variants];
    const variant = newVariants[vIndex];
    const realSubs = hasRealSubVariants(variant);

    // Numeric fields
    const isNumber = field === "price" || field === "stock";
    const parsed = isNumber ? parseFloat(value) || 0 : value;

    // ✅ Case 1: No sub-variants (update parent only)
    if (!realSubs) {
      if (sIndex === null) {
        (newVariants[vIndex] as any)[field] = parsed;
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({ ...s, [field]: parsed })
        );
      }
    }

    // ✅ Case 2: With sub-variants
    else {
      if (sIndex === null) {
        // Editing parent → propagate to all subs for numeric fields
        (newVariants[vIndex] as any)[field] = parsed;
        if (isNumber) {
          newVariants[vIndex].sub_variants = newVariants[
            vIndex
          ].sub_variants.map((s) => ({ ...s, [field]: parsed }));
        }
      } else {
        // Editing specific sub-variant
        const updatedSubs = newVariants[vIndex].sub_variants.map((sub, i) =>
          i === sIndex ? { ...sub, [field]: parsed } : sub
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
      <div className="grid grid-cols-[auto_1fr_150px_150px_150px] border-t gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-600">
        <div className="w-6">
          <Checkbox />
        </div>
        <div>Variant · Collapse all</div>
        <div>Barcode</div>
        <div>Price</div>
        <div>Available</div>
      </div>
      {variants.map((variant, vIndex) => {
        const prices = variant.sub_variants.map((s) => s.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const isRange = min !== max;

        const expandable = hasExpandableChildren(variant);
        const realSubs = hasRealSubVariants(variant);
        const isExpanded = expanded.includes(vIndex);

        return (
          <div
            key={vIndex}
            className="bg-white rounded-lg shadow border border-border/40"
          >
            {/* ---------- Parent Variant Row (NEW UI) ---------- */}
            <div
              className="grid grid-cols-[auto_1fr_150px_150px_150px] gap-4 px-6 py-4 items-center hover:bg-slate-50 cursor-pointer"
              onClick={() => expandable && toggleExpand(vIndex)}
            >
              {/* Checkbox */}
              <div className="w-6 min-w-0">
                <Checkbox />
              </div>

              {/* Image + Title */}
              <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                <div className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 cursor-pointer shrink-0">
                  <Image className="text-blue-600" />
                </div>

                <div className="flex flex-col truncate">
                  <span className="text-base font-semibold text-gray-900 truncate">
                    {variant.size || variant.color || variant.material}
                  </span>

                  {variant.sub_variants.length > 1 && (
                    <span className="text-sm text-gray-600">
                      {variant.sub_variants.length} variants
                    </span>
                  )}
                </div>

                {expandable &&
                  (isExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  ))}
              </div>

              {/* Barcode */}
              <Input
                type="text"
                placeholder="Barcode"
                className="border border-gray-300 w-full min-w-0"
                value={variant.sku ?? ""}
                onChange={(e) =>
                  handleChange(vIndex, null, "sku", e.target.value)
                }
              />

              {/* Price */}
              <Input
                type="number"
                placeholder={getPricePlaceholder(variant)}
                className="border border-gray-300 w-full min-w-0"
                value={
                  isRange ? "" : variant.price ? variant.price.toString() : ""
                }
                onChange={(e) =>
                  handleChange(vIndex, null, "price", e.target.value)
                }
              />

              {/* Stock */}
              <Input
                type="number"
                placeholder="0"
                className="border border-gray-300 w-full min-w-0"
                value={variant.stock ? variant.stock.toString() : ""}
                onChange={(e) =>
                  handleChange(vIndex, null, "stock", e.target.value)
                }
              />
            </div>

            {/* ---------- Children Sub-Variants (NEW UI) ---------- */}
            {expandable && isExpanded && realSubs && (
              <div className="bg-gray-50">
                {variant.sub_variants.map((sub, sIndex) => (
                  <div
                    key={sIndex}
                    className="grid grid-cols-[auto_1fr_150px_150px_150px] pl-16 gap-4 px-6 py-4 items-center border-t border-gray-100 hover:bg-white"
                  >
                    <div className="w-6">
                      <Checkbox />
                    </div>

                    {/* Sub Variant Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50">
                        <Image className="text-blue-600" />
                      </div>

                      <span className="text-gray-900 text-sm">
                        {sub.color || ""} {sub.color && sub.material ? "/" : ""}{" "}
                        {sub.material || ""}
                      </span>
                    </div>

                    {/* Barcode */}
                    <Input
                      type="text"
                      placeholder="Barcode"
                      className="border border-gray-300"
                      value={sub.sku ?? ""}
                      onChange={(e) =>
                        handleChange(vIndex, sIndex, "sku", e.target.value)
                      }
                    />

                    {/* Price */}
                    <Input
                      type="number"
                      placeholder="$ 0.00"
                      className="border border-gray-300"
                      value={sub.price ? sub.price.toString() : ""}
                      onChange={(e) =>
                        handleChange(vIndex, sIndex, "price", e.target.value)
                      }
                    />

                    {/* Stock */}
                    <Input
                      type="number"
                      placeholder="0"
                      className="border border-gray-300"
                      value={sub.stock ? sub.stock.toString() : ""}
                      onChange={(e) =>
                        handleChange(vIndex, sIndex, "stock", e.target.value)
                      }
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
