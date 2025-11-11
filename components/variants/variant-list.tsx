"use client";
import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, PackageOpen } from "lucide-react";

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

  const handleChange = (
    vIndex: number,
    sIndex: number | null,
    field: "price" | "stock",
    value: string
  ) => {
    const newVariants = [...variants];
    const num = parseFloat(value) || 0;

    if (sIndex === null) {
      // parent
      newVariants[vIndex][field] = num;
      if (field === "price") {
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({
            ...s,
            price: num,
          })
        );
      }
      if (field === "stock") {
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({
            ...s,
            stock: num,
          })
        );
      }
    } else {
      // child
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

    setVariants(newVariants);
    onVariantsChange?.(newVariants);
  };

  const getPricePlaceholder = (variant: Variant) => {
    const prices = variant.sub_variants.map((s) => s.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (!variant.sub_variants.length) return "៛ 0.00";
    return min === max
      ? `៛ ${min.toFixed(2)}`
      : `៛ ${min.toFixed(2)} – ${max.toFixed(2)}`;
  };

  /** ✅ FIXED LOGIC:
   * Only show dropdown when there are two or more unique sub-variant combos
   */
  const hasExpandableChildren = (variant: Variant) => {
    if (!variant.sub_variants) return false;

    const validSubs = variant.sub_variants.filter(
      (s) =>
        (s.color && s.color.trim().length > 0) ||
        (s.material && s.material.trim().length > 0)
    );

    if (validSubs.length === 0) return false;

    // still clean up duplicates
    const uniqueCombos = new Set(
      validSubs.map(
        (s) =>
          `${s.color?.trim().toLowerCase() || ""}-${
            s.material?.trim().toLowerCase() || ""
          }`
      )
    );

    return uniqueCombos.size >= 1; // ✅ dropdown for any valid sub (1 or more)
  };

  return (
    <div className="variant-list">
      {variants.map((variant, vIndex) => {
        const prices = variant.sub_variants.map((s) => s.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const isRange = min !== max;
        const expandable = hasExpandableChildren(variant);

        return (
          <div key={vIndex} className="variant-group">
            {/* Parent Row */}
            <div
              className={`variant-header ${expandable ? "cursor-pointer" : ""}`}
              onClick={() => expandable && toggleExpand(vIndex)}
            >
              <div className="variant-main">
                <PackageOpen className="variant-icon" />
                <span className="variant-title">
                  {variant.size ||
                    variant.color ||
                    variant.material ||
                    "Variant"}
                </span>

                {/* ✅ hide count when only 1 */}
                {variant.sub_variants.length > 1 && (
                  <span className="variant-count">
                    {variant.sub_variants.length} variants
                  </span>
                )}
              </div>

              <div className="variant-inputs">
                <input
                  type="text"
                  inputMode="decimal"
                  className="price-input"
                  placeholder={getPricePlaceholder(variant)}
                  value={
                    isRange ? "" : variant.price ? variant.price.toString() : ""
                  }
                  onChange={(e) =>
                    handleChange(vIndex, null, "price", e.target.value)
                  }
                />
                <input
                  type="text"
                  inputMode="decimal"
                  className="stock-input"
                  value={variant.stock ? variant.stock.toString() : ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "stock", e.target.value)
                  }
                />

                {/* ✅ only show dropdown when multiple combos */}
                {expandable &&
                  (expanded.includes(vIndex) ? (
                    <ChevronUp className="toggle-icon" />
                  ) : (
                    <ChevronDown className="toggle-icon" />
                  ))}
              </div>
            </div>

            {/* Sub Variants */}
            {expandable && expanded.includes(vIndex) && (
              <div className="sub-variant-list">
                {variant.sub_variants.map((sub, sIndex) => (
                  <div key={sIndex} className="sub-variant-row">
                    <PackageOpen className="variant-icon" />
                    <span className="sub-variant-title">
                      {sub.color || sub.material
                        ? `${sub.color || ""}${
                            sub.color && sub.material ? " / " : ""
                          }${sub.material || ""}`
                        : ""}
                    </span>

                    <div className="variant-inputs">
                      <input
                        type="text"
                        inputMode="decimal"
                        className="price-input"
                        placeholder="៛ 0.00"
                        value={sub.price ? sub.price.toString() : ""}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "price", e.target.value)
                        }
                      />
                      <input
                        type="text"
                        inputMode="decimal"
                        className="stock-input"
                        placeholder="0"
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
          </div>
        );
      })}
    </div>
  );
}
