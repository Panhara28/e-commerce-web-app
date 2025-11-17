"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp, Image } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "../ui/checkbox";
import MediaDialog from "../media-upload/media-dialog";

/* -------------------------------------------------------------------------- */
/*                                   TYPES                                     */
/* -------------------------------------------------------------------------- */

export type SubVariant = {
  size?: string;
  color: string;
  material: string;
  price: number;
  stock: number;
  imageVariant?: string | null;
  barcode?: string;
};

export type Variant = {
  id?: string;
  size?: string;
  color?: string;
  material?: string;
  price: number;
  stock: number;
  imageVariant?: string | null;
  barcode?: string;
  sub_variants: SubVariant[];
  name?: string;
  available?: number;
};

type MediaFile = {
  url: string;
  name?: string;
  size?: number;
  type?: string;
};

type Props = {
  data: { variants: Variant[] };
  onVariantsChange?: (updated: Variant[]) => void;
};

/* -------------------------------------------------------------------------- */
/*                              SET FIELD HELPER                              */
/* -------------------------------------------------------------------------- */

function setField<T extends Variant | SubVariant>(
  obj: T,
  field: keyof Variant | keyof SubVariant,
  value: string | number
): void {
  (obj as Record<string, unknown>)[field] = value;
}

/* -------------------------------------------------------------------------- */
/*                             COMPONENT START                                 */
/* -------------------------------------------------------------------------- */

export default function VariantList({ data, onVariantsChange }: Props) {
  const [variants, setVariants] = useState<Variant[]>(data.variants);
  const [expanded, setExpanded] = useState<number[]>([]);
  const prevJson = useRef<string>("");

  /* Keep local state synced with parent */
  useEffect(() => {
    const incoming = JSON.stringify(data.variants);

    if (prevJson.current !== incoming) {
      prevJson.current = incoming;
      setVariants(data.variants);
    }
  }, [data.variants]);

  const [imagePicker, setImagePicker] = useState<{
    open: boolean;
    vIndex: number | null;
    sIndex: number | null;
  }>({
    open: false,
    vIndex: null,
    sIndex: null,
  });

  const [mediaList, setMediaList] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media/list");
      const json = await res.json();
      setMediaList(json.media || []);
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------------------------------------------------------- */
  /*                          IMAGE SELECTION FIXED                             */
  /* -------------------------------------------------------------------------- */

  const applySelectedImage = (file: MediaFile) => {
    const updated = [...variants];
    const { vIndex, sIndex } = imagePicker;

    if (vIndex !== null) {
      const parent = updated[vIndex];

      if (sIndex === null) {
        parent.imageVariant = file.url;
        parent.sub_variants = parent.sub_variants.map((s) => ({
          ...s,
          imageVariant: file.url,
        }));
      } else {
        parent.sub_variants[sIndex].imageVariant = file.url;
        parent.imageVariant = null;
      }
    }

    setVariants(updated);
    onVariantsChange?.(updated);

    setImagePicker({ open: false, vIndex: null, sIndex: null });
  };

  const toggleExpand = (index: number) =>
    setExpanded((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );

  const hasRealSubVariants = (variant: Variant): boolean => {
    return variant.sub_variants.some(
      (s) => s.color.trim() !== "" || s.material.trim() !== ""
    );
  };

  /* -------------------------------------------------------------------------- */
  /*                               HANDLE CHANGE                                */
  /* -------------------------------------------------------------------------- */

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
    const parsed: string | number = isNumber ? parseFloat(value) || 0 : value;

    /* No real sub-variants → parent controls all */
    if (!realSubs) {
      if (sIndex === null) {
        setField(variant, field, parsed);

        variant.sub_variants = variant.sub_variants.map((s) => {
          const updated = { ...s };
          setField(updated, field, parsed);
          return updated;
        });
      }
    } else {
      /* Real sub-variants exist */
      if (sIndex === null) {
        setField(variant, field, parsed);

        if (isNumber) {
          variant.sub_variants = variant.sub_variants.map((s) => {
            const updated = { ...s };
            setField(updated, field, parsed);
            return updated;
          });
        }
      } else {
        const updatedSubs = variant.sub_variants.map((sub, i) => {
          if (i === sIndex) {
            const updated = { ...sub };
            setField(updated, field, parsed);
            return updated;
          }
          return sub;
        });

        variant.sub_variants = updatedSubs;

        /* Auto recompute parent price range */
        if (field === "price") {
          const prices = updatedSubs.map((s) => s.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          variant.price = min === max ? min : 0;
        }
      }
    }

    setVariants(newVariants);
    onVariantsChange?.(newVariants);
  };

  /* -------------------------------------------------------------------------- */
  /*                       CHILD IMAGE STATE (STACKED UI)                       */
  /* -------------------------------------------------------------------------- */

  const getChildImageState = (variant: Variant) => {
    const imgs = variant.sub_variants
      .map((s) => s.imageVariant)
      .filter((u): u is string => !!u && u.trim() !== "");

    if (imgs.length === 0) return { hasImages: false, mixed: false, urls: [] };

    const unique = Array.from(new Set(imgs));

    return {
      hasImages: true,
      mixed: unique.length > 1,
      urls: unique,
    };
  };

  /* -------------------------------------------------------------------------- */
  /*                              SELECTED URL                                  */
  /* -------------------------------------------------------------------------- */

  const selectedUrl =
    imagePicker.vIndex !== null && imagePicker.sIndex === null
      ? variants[imagePicker.vIndex]?.imageVariant || null
      : imagePicker.vIndex !== null && imagePicker.sIndex !== null
      ? variants[imagePicker.vIndex]?.sub_variants[imagePicker.sIndex]
          ?.imageVariant || null
      : null;

  /* -------------------------------------------------------------------------- */
  /*                                 UI RENDER                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <>
      <MediaDialog
        open={imagePicker.open}
        onOpenChange={(v: boolean) =>
          setImagePicker({ open: v, vIndex: null, sIndex: null })
        }
        mediaList={mediaList}
        loading={loading}
        fetchMedia={fetchMedia}
        triggerFileUpload={() => {}}
        onSelect={applySelectedImage}
        selectedUrl={selectedUrl}
      />

      {/* 🧩 Your existing UI (unchanged) */}
      {/* -------------------------------------------------------------------------- */}
      {/* EVERYTHING BELOW IS EXACTLY SAME — ONLY THE LOGIC ABOVE WAS FIXED         */}
      {/* -------------------------------------------------------------------------- */}

      <div className="space-y-4">
        <div className="grid grid-cols-[auto_1fr_150px_150px_150px] border-t gap-4 px-6 py-4 border-b text-sm font-medium text-gray-600">
          <div className="w-6">
            <Checkbox className="prevent-expand" />
          </div>
          <div>Variant · Collapse all</div>
          <div>Barcode</div>
          <div>Price</div>
          <div>Available</div>
        </div>

        {variants.map((variant, vIndex) => {
          const expandable = hasRealSubVariants(variant);
          const isExpanded = expanded.includes(vIndex);

          const prices = variant.sub_variants.map((s) => s.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          const isRange = min !== max;

          return (
            <div
              key={vIndex}
              className="bg-white rounded-lg shadow border border-border/40"
            >
              {/* Parent row */}
              <div
                className="grid grid-cols-[auto_1fr_150px_150px_150px] gap-4 px-6 py-4 items-center hover:bg-slate-50 cursor-pointer"
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.closest("input") ||
                    target.closest("button") ||
                    target.closest(".prevent-expand")
                  )
                    return;

                  if (expandable) toggleExpand(vIndex);
                }}
              >
                <div className="w-6 prevent-expand">
                  <Checkbox className="prevent-expand" />
                </div>

                <div className="flex items-center gap-3">
                  {/* Parent image block */}
                  <div
                    className="w-20 h-20 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white shrink-0 prevent-expand cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setImagePicker({ open: true, vIndex, sIndex: null });
                      fetchMedia();
                    }}
                  >
                    {(() => {
                      const child = getChildImageState(variant);
                      if (variant.imageVariant && !child.mixed)
                        return (
                          <img
                            src={variant.imageVariant}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        );

                      if (child.hasImages && child.mixed)
                        return (
                          <div className="relative w-full h-full">
                            {child.urls.slice(0, 3).map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                className={`absolute w-10 h-10 object-cover rounded-lg border-2 border-white
                                ${i === 0 ? "top-1 left-1" : ""}
                                ${i === 1 ? "top-1 right-1" : ""}
                                ${i === 2 ? "bottom-1 left-1" : ""}
                              `}
                              />
                            ))}
                          </div>
                        );

                      if (child.hasImages && !child.mixed)
                        return (
                          <img
                            src={child.urls[0]}
                            className="w-full h-full object-cover rounded-xl"
                          />
                        );

                      return <Image className="text-blue-600" />;
                    })()}
                  </div>

                  <div className="flex flex-col">
                    <span className="text-base font-semibold">
                      {variant.size || variant.color || variant.material}
                    </span>

                    {variant.sub_variants.length > 1 && (
                      <span className="text-sm text-gray-600">
                        {variant.sub_variants.length} variants
                      </span>
                    )}
                  </div>

                  {expandable && (isExpanded ? <ChevronUp /> : <ChevronDown />)}
                </div>

                <Input
                  type="text"
                  placeholder="Barcode"
                  value={variant.barcode || ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "barcode", e.target.value)
                  }
                  className="border prevent-expand"
                />

                <Input
                  type="number"
                  placeholder={isRange ? `${min} - ${max}` : `${variant.price}`}
                  value={!isRange ? variant.price : ""}
                  onChange={(e) =>
                    handleChange(vIndex, null, "price", e.target.value)
                  }
                  className="border prevent-expand"
                />

                <Input
                  type="number"
                  placeholder="0"
                  value={variant.stock}
                  onChange={(e) =>
                    handleChange(vIndex, null, "stock", e.target.value)
                  }
                  className="border prevent-expand"
                />
              </div>

              {/* Expandable children */}
              {expandable && isExpanded && (
                <div className="bg-gray-50">
                  {variant.sub_variants.map((sub, sIndex) => (
                    <div
                      key={sIndex}
                      className="grid grid-cols-[auto_1fr_150px_150px_150px] pl-16 px-6 py-4 gap-4 border-t hover:bg-white"
                    >
                      <div className="w-6 prevent-expand">
                        <Checkbox className="prevent-expand" />
                      </div>

                      {/* Sub variant image */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer prevent-expand"
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

                        <span className="text-sm">
                          {sub.color} {sub.material && `/ ${sub.material}`}
                        </span>
                      </div>

                      <Input
                        type="text"
                        placeholder="Barcode"
                        value={sub.barcode || ""}
                        onChange={(e) =>
                          handleChange(
                            vIndex,
                            sIndex,
                            "barcode",
                            e.target.value
                          )
                        }
                        className="border prevent-expand"
                      />

                      <Input
                        type="number"
                        placeholder="0"
                        value={sub.price}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "price", e.target.value)
                        }
                        className="border prevent-expand"
                      />

                      <Input
                        type="number"
                        placeholder="0"
                        value={sub.stock}
                        onChange={(e) =>
                          handleChange(vIndex, sIndex, "stock", e.target.value)
                        }
                        className="border prevent-expand"
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
