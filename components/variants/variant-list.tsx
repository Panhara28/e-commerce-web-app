"use client";

import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import MediaDialog from "../media-upload/media-dialog"; // <-- ADDED

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

  // ------------------- IMAGE PICKER STATE (ADDED) -------------------
  const [imagePicker, setImagePicker] = useState({
    open: false,
    vIndex: null as number | null,
    sIndex: null as number | null,
  });

  const [mediaList, setMediaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media/list");
      const data = await res.json();
      setMediaList(data.media || []);
    } finally {
      setLoading(false);
    }
  };

  const applySelectedImage = (file: any) => {
    const updated = [...variants];
    const { vIndex, sIndex } = imagePicker;

    if (vIndex !== null) {
      if (sIndex === null) {
        updated[vIndex].imageVariant = file.url;
      } else {
        updated[vIndex].sub_variants[sIndex].imageVariant = file.url;
      }
    }

    setVariants(updated);
    onVariantsChange?.(updated);

    setImagePicker({ open: false, vIndex: null, sIndex: null });
  };
  // -------------------------------------------------------------------

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

    const isNumber = field === "price" || field === "stock";
    const parsed = isNumber ? parseFloat(value) || 0 : value;

    if (!realSubs) {
      if (sIndex === null) {
        (newVariants[vIndex] as any)[field] = parsed;
        newVariants[vIndex].sub_variants = newVariants[vIndex].sub_variants.map(
          (s) => ({ ...s, [field]: parsed })
        );
      }
    } else {
      if (sIndex === null) {
        (newVariants[vIndex] as any)[field] = parsed;
        if (isNumber) {
          newVariants[vIndex].sub_variants = newVariants[
            vIndex
          ].sub_variants.map((s) => ({ ...s, [field]: parsed }));
        }
      } else {
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
    if (!validSubs.length) return false;

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
    <>
      {/* ------------------- IMAGE DIALOG (ADDED, UI UNTOUCHED) ------------------- */}
      <MediaDialog
        open={imagePicker.open}
        onOpenChange={(v) =>
          setImagePicker({ open: v, vIndex: null, sIndex: null })
        }
        mediaList={mediaList}
        loading={loading}
        fetchMedia={fetchMedia}
        triggerFileUpload={() => {}}
        onSelect={applySelectedImage}
        selectedUrl={
          imagePicker.vIndex !== null
            ? imagePicker.sIndex === null
              ? variants[imagePicker.vIndex]?.imageVariant
              : variants[imagePicker.vIndex]?.sub_variants[imagePicker.sIndex]
                  ?.imageVariant
            : null
        }
      />
      {/* -------------------------------------------------------------------------- */}

      <div className="space-y-4">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_150px_150px_150px] border-t gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-600">
          <div className="w-6">
            <Checkbox className="prevent-expand" />
          </div>
          <div>Variant · Collapse all</div>
          <div>Barcode</div>
          <div>Price</div>
          <div>Available</div>
        </div>

        {variants.map((variant, vIndex) => {
          const expandable = hasExpandableChildren(variant);
          const isExpanded = expanded.includes(vIndex);
          const realSubs = hasRealSubVariants(variant);

          const prices = variant.sub_variants.map((s) => s.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const isRange = min !== max;

          return (
            <div
              key={vIndex}
              className="bg-white rounded-lg shadow border border-border/40"
            >
              {/* Parent Row */}
              <div
                className="grid grid-cols-[auto_1fr_150px_150px_150px] gap-4 px-6 py-4 items-center hover:bg-slate-50 cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;

                  if (
                    target.closest("input") ||
                    target.closest("button") ||
                    target.closest(".prevent-expand")
                  ) {
                    return;
                  }

                  if (expandable) toggleExpand(vIndex);
                }}
              >
                <div className="w-6 prevent-expand">
                  <Checkbox className="prevent-expand" />
                </div>

                <div className="flex items-center gap-3">
                  {/* ------------------- ADD IMAGE CLICK (NO UI CHANGE) ------------------- */}
                  <div
                    className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white shrink-0 prevent-expand cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePicker({ open: true, vIndex, sIndex: null });
                      fetchMedia();
                    }}
                  >
                    {variant.imageVariant ? (
                      <img
                        src={variant.imageVariant}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    ) : (
                      <Image className="text-blue-600" />
                    )}
                  </div>
                  {/* ------------------------------------------------------------------- */}

                  <div className="flex flex-col truncate">
                    <span className="text-base font-semibold text-gray-900">
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

                <Input
                  type="text"
                  placeholder="Barcode"
                  className="border border-gray-300 prevent-expand"
                  value={variant.sku ?? ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "sku", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder={getPricePlaceholder(variant)}
                  className="border border-gray-300 prevent-expand"
                  value={!isRange && variant.price ? variant.price : ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "price", e.target.value)
                  }
                />

                <Input
                  type="number"
                  placeholder="0"
                  className="border border-gray-300 prevent-expand"
                  value={variant.stock || ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "stock", e.target.value)
                  }
                />
              </div>

              {/* Sub Variants */}
              {expandable && isExpanded && realSubs && (
                <div className="bg-gray-50">
                  {variant.sub_variants.map((sub, sIndex) => (
                    <div
                      key={sIndex}
                      className="grid grid-cols-[auto_1fr_150px_150px_150px] pl-16 gap-4 px-6 py-4 items-center border-t border-gray-100 hover:bg-white"
                    >
                      <div className="w-6 prevent-expand">
                        <Checkbox className="prevent-expand" />
                      </div>

                      <div className="flex items-center gap-3">
                        {/* ------------------- SUB IMAGE CLICK ------------------- */}
                        <div
                          className="w-12 h-12 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white prevent-expand cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImagePicker({ open: true, vIndex, sIndex });
                            fetchMedia();
                          }}
                        >
                          {sub.imageVariant ? (
                            <img
                              src={sub.imageVariant}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <Image className="text-blue-600" />
                          )}
                        </div>
                        {/* ------------------------------------------------------ */}

                        <span className="text-gray-900 text-sm">
                          {sub.color} {sub.material && "/"} {sub.material}
                        </span>
                      </div>

                      <Input
                        type="text"
                        placeholder="Barcode"
                        className="border border-gray-300 prevent-expand"
                        value={sub.sku ?? ""}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "sku", e.target.value)
                        }
                      />

                      <Input
                        type="number"
                        placeholder="$ 0.00"
                        className="border border-gray-300 prevent-expand"
                        value={sub.price || ""}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "price", e.target.value)
                        }
                      />

                      <Input
                        type="number"
                        placeholder="0"
                        className="border border-gray-300 prevent-expand"
                        value={sub.stock || ""}
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
    </>
  );
}
