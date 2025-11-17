"use client";

import { useState, useEffect, useMemo, startTransition, useRef } from "react";
import { useParams } from "next/navigation";
import { Loader2, X, Grip as Grip2, Trash2, Plus } from "lucide-react";

import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RichText from "../ui/rich-text";
import { MediaUpload } from "../media-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { SelectCategory } from "../select-category";
import VariantList from "../variants/variant-list";
import {
  convertHTMLtoLexicalJSON,
  defaultEmptyLexicalState,
} from "@/utlis/convertLexical";
import { SerializedEditorState } from "lexical";

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export type SubVariant = {
  size?: string; // ⬅ make optional
  color: string;
  material: string;
  price: number;
  stock: number;
  barcode?: string;
  imageVariant?: string | null;
};

export type Variant = {
  id?: string;
  slug?: string;
  productId?: number;

  size?: string;
  color?: string;
  material?: string;

  price: number;
  stock: number;

  barcode?: string;
  imageVariant?: string | null;

  sub_variants: SubVariant[]; // ALWAYS required
};

type FlatVariant = {
  size: string;
  color: string;
  material: string;
  price: number;
  stock: number;
  barcode?: string;
  imageVariant?: string;
};

type MediaFile = {
  url: string;
  name?: string;
  size?: number;
  type?: string;
};

interface ProductForm {
  title: string;
  description: SerializedEditorState | null;
  categoryId: string;
  productCode: string;
  status: "DRAFT" | "PUBLISHED";
  price: string;
  discount: string;
  salePriceHold: string;
  discountHold: string;
  salePricePremium: string;
  discountPremium: string;
}
type ProductMedia = {
  url: string;
};
const STRUCTURE_KEY = "variant_data_v1";

/* -------------------------------------------------------------------------- */
/* MAIN EDIT COMPONENT                                                        */
/* -------------------------------------------------------------------------- */

export default function ProductEditForm() {
  const params = useParams();
  const slug = params?.slug as string;
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const descriptionRef = useRef<unknown>(null);

  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [resetKey] = useState(0);

  const [variants, setVariants] = useState<
    { name: string; values: string[] }[]
  >([]);

  const [output, setOutput] = useState<{ variants: Variant[] }>({
    variants: [],
  });

  const [, setIsGenerating] = useState(false);

  const [productForm, setProductForm] = useState<ProductForm>({
    title: "",
    description: null,
    categoryId: "",
    productCode: "",
    status: "DRAFT",
    price: "",
    discount: "",
    salePriceHold: "",
    discountHold: "",
    salePricePremium: "",
    discountPremium: "",
  });

  const persistStructure = (data: { variants: Variant[] }) =>
    localStorage.setItem(STRUCTURE_KEY, JSON.stringify(data));

  const defaultVariants = ["Size", "Color", "Material"];

  const getPlaceholder = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("size")) return "Medium";
    if (n.includes("color")) return "Black";
    if (n.includes("material")) return "Rubber";
    return "Enter option value";
  };

  /* -------------------------------------------------------------------------- */
  /* FETCH PRODUCT DATA                                                          */
  /* -------------------------------------------------------------------------- */

  // const loadProduct = async () => {
  //   try {
  //     const res = await fetch(`/api/products/${slug}`);
  //     const json = await res.json();

  //     const p = json.data;
  //     let descriptionJSON;

  //     // CASE 1: Already JSON in DB
  //     if (p.description?.root) {
  //       descriptionJSON = p.description;
  //     }
  //     // CASE 2: Old HTML (first version before editor implemented)
  //     else if (p.description?.html) {
  //       // Convert HTML → JSON once
  //       descriptionJSON = convertHTMLtoLexicalJSON(p.description.html);
  //     }
  //     // CASE 3: Empty
  //     else {
  //       descriptionJSON = defaultEmptyLexicalState();
  //     }

  //     setProductForm({
  //       title: p.title,
  //       description: descriptionJSON,
  //       categoryId: p.categoryId,
  //       productCode: p.productCode || "",
  //       status: p.status,
  //       price: p.price,
  //       discount: p.discount,
  //       salePriceHold: p.salePriceHold,
  //       discountHold: p.discountHold,
  //       salePricePremium: p.salePricePremium,
  //       discountPremium: p.discountPremium,
  //     });

  //     descriptionRef.current = descriptionJSON;

  //     /* -------------------- MEDIA FILES -------------------- */
  //     const media = (p.MediaProductDetails || []).map((m: ProductMedia) => ({
  //       url: m.url,
  //     }));

  //     setMediaFiles(media);

  //     /* -------------------- VARIANT CONVERSION -------------------- */
  //     const grouped = convertFlatVariants(p.variants);
  //     setOutput({ variants: grouped });
  //     persistStructure({ variants: grouped });

  //     /* -------------------- OPTION BUILDER AUTO-FILL -------------------- */
  //     const opts = autoGenerateOptions(grouped);
  //     setVariants(opts);

  //     setInitialLoaded(true);
  //     setLoading(false);
  //   } catch (error) {
  //     console.error("Failed to load product:", error);
  //     setLoading(false);
  //   }
  // };

  /* -------------------------------------------------------------------------- */
  /* FLAT → GROUPED VARIANT CONVERSION                                          */
  /* -------------------------------------------------------------------------- */

  const convertFlatVariants = (flat: FlatVariant[]): Variant[] => {
    if (!flat?.length) return [];

    // Group by SIZE (or first option)
    const groups: Record<string, Variant> = {};

    for (const v of flat) {
      const primary = v.size || v.color || v.material || "";

      if (!groups[primary]) {
        groups[primary] = {
          size: v.size || "",
          color: "",
          material: "",
          price: v.price,
          stock: v.stock,
          barcode: v.barcode,
          imageVariant: v.imageVariant || "",
          sub_variants: [],
        };
      }

      groups[primary].sub_variants.push({
        size: v.size || "", // ✅ add size
        color: v.color,
        material: v.material,
        price: v.price,
        stock: v.stock,
        barcode: v.barcode,
        imageVariant: v.imageVariant || "",
      });
    }

    // Parent inherits first child
    Object.values(groups).forEach((g) => {
      if (g.sub_variants.length > 0) {
        const first = g.sub_variants[0];
        g.imageVariant = first.imageVariant;
        g.price = first.price;
        g.stock = first.stock;
        g.barcode = first.barcode;
      }
    });

    return Object.values(groups);
  };

  /* -------------------------------------------------------------------------- */
  /* AUTO-GENERATE OPTION BUILDER FROM EXISTING PRODUCT                         */
  /* -------------------------------------------------------------------------- */

  const autoGenerateOptions = (variants: Variant[]) => {
    const sizes = new Set<string>();
    const colors = new Set<string>();
    const materials = new Set<string>();

    variants.forEach((v) => {
      if (v.size) sizes.add(v.size);
      v.sub_variants?.forEach((s) => {
        if (s.color) colors.add(s.color);
        if (s.material) materials.add(s.material);
      });
    });

    return [
      ...(sizes.size ? [{ name: "Size", values: [...sizes, ""] }] : []),
      ...(colors.size ? [{ name: "Color", values: [...colors, ""] }] : []),
      ...(materials.size
        ? [{ name: "Material", values: [...materials, ""] }]
        : []),
    ];
  };

  /* -------------------------------------------------------------------------- */
  /* VARIANT BUILDER AUTO GENERATION (UNCHANGED FROM ADD MODE)                 */
  /* -------------------------------------------------------------------------- */

  const generatedOutput = useMemo(() => {
    const active = variants
      .filter((v) => v.name.trim() && v.values.some((val) => val.trim()))
      .map((v) => ({
        name: v.name.toLowerCase(),
        values: v.values.filter(Boolean).map((x) => x.trim()),
      }));

    if (active.length === 0) return { variants: [] };

    const combine = (arrs: string[][]): string[][] =>
      arrs.reduce<string[][]>(
        (acc, cur) => acc.flatMap((a) => cur.map((b) => [...a, b])),
        [[]]
      );

    const combos = combine(active.map((x) => x.values));

    const result = combos.map((combo) => {
      const obj: Variant = { sub_variants: [], price: 0, stock: 0 };
      active.forEach((opt, i) => {
        if (opt.name.includes("size")) obj.size = combo[i];
        else if (opt.name.includes("color")) obj.color = combo[i];
        else if (opt.name.includes("material")) obj.material = combo[i];
      });
      return obj;
    });

    const primaryKey =
      active.find((o) => o.name.includes("size"))?.name || active[0].name;

    const getPrimaryValue = (r: Variant) =>
      primaryKey.includes("size")
        ? r.size
        : primaryKey.includes("color")
        ? r.color
        : primaryKey.includes("material")
        ? r.material
        : undefined;

    const uniquePrimary = [
      ...new Set(result.map((r) => getPrimaryValue(r))),
    ].filter(Boolean) as string[];

    const grouped = uniquePrimary.map((val) => {
      const children = result.filter((r) => getPrimaryValue(r) === val);

      return {
        size: primaryKey.includes("size") ? val : "",
        color: primaryKey.includes("color") ? val : "",
        material: primaryKey.includes("material") ? val : "",
        price: 0,
        stock: 0,
        imageVariant: "",
        sub_variants: children.map((r) => ({
          color: r.color || "",
          material: r.material || "",
          price: 0,
          stock: 0,
          imageVariant: "",
        })),
      };
    });

    return { variants: grouped };
  }, [variants]);

  /* -------------------------------------------------------------------------- */
  /* MERGE EXISTING VARIANT DATA WITH NEW STRUCTURE                            */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    if (!initialLoaded) return;

    startTransition(() => setIsGenerating(true));

    const t = setTimeout(() => {
      setOutput((prev) => {
        const merged = generatedOutput.variants.map((v: Variant) => {
          const existing = prev.variants.find(
            (o) =>
              o.size === v.size &&
              o.color === v.color &&
              o.material === v.material
          );

          if (existing) {
            const mergedSubs = v.sub_variants!.map((s: SubVariant, i) => {
              const prevSub: SubVariant = existing.sub_variants?.[i] ?? {
                color: "",
                material: "",
                price: 0,
                stock: 0,
                barcode: "",
                imageVariant: "",
              };

              return {
                color: s.color,
                material: s.material,
                price: prevSub.price ?? s.price,
                stock: prevSub.stock ?? s.stock,
                barcode: prevSub.barcode ?? s.barcode ?? "",
                imageVariant: prevSub.imageVariant ?? s.imageVariant ?? "",
              };
            });

            return {
              ...v,

              /* 🟢 Preserve database values */
              id: existing.id,
              slug: existing.slug,
              productId: existing.productId,

              price: existing.price ?? v.price ?? 0,
              stock: existing.stock ?? v.stock ?? 0,
              barcode: existing.barcode ?? v.barcode ?? "",
              imageVariant: existing.imageVariant ?? v.imageVariant ?? "",

              sub_variants: mergedSubs,
            };
          }

          return v;
        });

        const updated = { variants: merged };
        persistStructure(updated);
        return updated;
      });

      setIsGenerating(false);
    }, 200);

    return () => clearTimeout(t);
  }, [generatedOutput, initialLoaded]);

  /* -------------------------------------------------------------------------- */
  /* SAVE UPDATED PRODUCT (PUT REQUEST)                                         */
  /* -------------------------------------------------------------------------- */

  const handleSaveProduct = async () => {
    const p = productForm;

    if (!p.title || !p.price || !p.categoryId) {
      alert("⚠️ Please fill all required product fields!");
      return;
    }

    const payload = {
      title: p.title.trim(),
      description: productForm.description,
      categoryId: Number(p.categoryId),
      productCode: p.productCode || "",
      status: p.status,
      price: parseFloat(p.price),
      salePriceHold: parseFloat(p.salePriceHold) || 0,
      discountHold: parseFloat(p.discountHold) || 0,
      salePricePremium: parseFloat(p.salePricePremium) || 0,
      discountPremium: parseFloat(p.discountPremium) || 0,
      discount: parseFloat(p.discount) || 0,

      variants: output.variants.flatMap((v: Variant) =>
        v.sub_variants.length > 0
          ? v.sub_variants.map((s: SubVariant) => ({
              size: v.size || "",
              color: s.color || "",
              material: s.material || "",
              price: s.price || 0,
              stock: s.stock || 0,
              barcode: s.barcode || "",
              imageVariant: s.imageVariant || "",
            }))
          : [
              {
                size: v.size || "",
                color: v.color || "",
                material: v.material || "",
                price: v.price || 0,
                stock: v.stock || 0,
                barcode: v.barcode || "",
                imageVariant: v.imageVariant || "",
              },
            ]
      ),

      mediaUrls: mediaFiles.map((m) => ({ url: m.url })),
    };

    try {
      const response = await fetch(`/api/products/${slug}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        alert("✅ Product updated successfully!");
      } else {
        alert(data.message || "Failed to update product!");
      }
    } catch (error) {
      console.log("Network error while updating product!", error);
    }
  };

  /* -------------------------------------------------------------------------- */
  /* LOAD PRODUCT ONCE                                                          */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const res = await fetch(`/api/products/${slug}`);
        const json = await res.json();

        if (!isMounted) return;

        const p = json.data;

        let descriptionJSON;

        if (p.description?.root) descriptionJSON = p.description;
        else if (p.description?.html)
          descriptionJSON = convertHTMLtoLexicalJSON(p.description.html);
        else descriptionJSON = defaultEmptyLexicalState();

        setProductForm({
          title: p.title,
          description: descriptionJSON,
          categoryId: p.categoryId,
          productCode: p.productCode || "",
          status: p.status,
          price: p.price,
          discount: p.discount,
          salePriceHold: p.salePriceHold,
          discountHold: p.discountHold,
          salePricePremium: p.salePricePremium,
          discountPremium: p.discountPremium,
        });

        descriptionRef.current = descriptionJSON;

        const media = (p.MediaProductDetails || []).map((m: ProductMedia) => ({
          url: m.url,
        }));
        setMediaFiles(media);

        const grouped = convertFlatVariants(p.variants);
        setOutput({ variants: grouped });
        persistStructure({ variants: grouped });

        const opts = autoGenerateOptions(grouped);
        setVariants(opts);

        setInitialLoaded(true);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load product", err);
        setLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  /* -------------------------------------------------------------------------- */
  /* RENDER                                                                     */
  /* -------------------------------------------------------------------------- */

  if (loading)
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  return (
    <>
      <div className="container mx-auto">
        <div className="flex gap-3">
          {/* ----------------------- LEFT COLUMN ----------------------- */}
          <div className="w-2/2 rounded-lg">
            {/* ----------------------- PRODUCT MAIN ----------------------- */}
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Title</h6>
                <Input
                  className="shadow-none border border-black"
                  type="text"
                  value={productForm.title}
                  onChange={(e) =>
                    setProductForm({ ...productForm, title: e.target.value })
                  }
                />
              </div>

              <div className="px-5">
                <h6 className="text-sm py-1">Description</h6>
                {productForm.description !== null && (
                  <RichText
                    initialValue={productForm.description}
                    onChange={(val: unknown) => {
                      descriptionRef.current = val; // safe, no re-render
                    }}
                  />
                )}
              </div>

              <div className="px-5">
                <h6 className="text-sm py-1">Media</h6>
                <MediaUpload value={mediaFiles} onChange={setMediaFiles} />
              </div>

              <div className="flex flex-wrap">
                {/* Category */}
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Category</h6>
                  <SelectCategory
                    onSelect={(id) =>
                      setProductForm({ ...productForm, categoryId: String(id) })
                    }
                    resetSignal={resetKey}
                    defaultValue={Number(productForm.categoryId) || undefined}
                  />
                </div>

                {/* Product Code */}
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Product code</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="text"
                    value={productForm.productCode}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        productCode: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* ----------------------- PRICES ----------------------- */}
            <Card className="shadow-none border rounded-lg my-3">
              <div className="flex flex-wrap">
                <div className="px-5 w-1/2 mb-4">
                  <h6 className="text-sm py-1">Price</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.price}
                    onChange={(e) =>
                      setProductForm({ ...productForm, price: e.target.value })
                    }
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Discount</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.discount}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discount: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="px-5 w-1/2 mb-4">
                  <h6 className="text-sm py-1">Sale Price For Hold Sale ($)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.salePriceHold}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        salePriceHold: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Discount Hold Sale (%)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.discountHold}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discountHold: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Sale Price for Premium ($)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.salePricePremium}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        salePricePremium: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Discount Premium (%)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    value={productForm.discountPremium}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        discountPremium: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </Card>

            {/* ----------------------- VARIANT BUILDER ----------------------- */}
            <Card>
              <div className="px-5">
                <h6 className="text-sm py-1 font-bold">Variant</h6>
              </div>

              <div className="flex justify-center">
                <div className="w-full mx-5 rounded-lg border border-border bg-card p-6">
                  <div className="space-y-6">
                    {/* Option builder UI remains unchanged */}
                    {variants.map((variant, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-3 cursor-grab active:cursor-grabbing">
                            <Grip2 className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium text-foreground">
                              Option name
                            </label>

                            <Input
                              className="border-border"
                              placeholder={defaultVariants[i] || "Option name"}
                              value={variant.name}
                              onChange={(e) => {
                                const updated = [...variants];
                                updated[i].name = e.target.value;
                                setVariants(updated);
                              }}
                            />

                            <label className="mt-4 block text-sm font-medium text-foreground">
                              Option values
                            </label>

                            {variant.values.map((val, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-2 my-1"
                              >
                                <Input
                                  className="border-border"
                                  placeholder={getPlaceholder(
                                    variant.name || defaultVariants[i]
                                  )}
                                  value={val}
                                  onChange={(e) => {
                                    const updated = [...variants];
                                    updated[i].values[j] = e.target.value;

                                    const isLast =
                                      j === updated[i].values.length - 1;
                                    if (
                                      isLast &&
                                      e.target.value.trim().length > 0
                                    ) {
                                      updated[i].values.push("");
                                    }

                                    setVariants(updated);
                                  }}
                                />

                                {val.trim() && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => {
                                      const updated = [...variants];
                                      updated[i].values = updated[
                                        i
                                      ].values.filter((_, idx) => idx !== j);
                                      if (updated[i].values.length === 0)
                                        updated[i].values.push("");

                                      setVariants(updated);
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            ))}

                            <div className="flex items-center justify-between gap-2 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => {
                                  const updated = variants.filter(
                                    (_, idx) => idx !== i
                                  );
                                  setVariants(updated);
                                }}
                              >
                                <Trash2 className="mr-1 h-4 w-4" />
                                Delete
                              </Button>

                              <Button
                                size="sm"
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                              >
                                Done
                              </Button>
                            </div>
                          </div>
                        </div>

                        {i !== variants.length - 1 && (
                          <hr className="border-border" />
                        )}
                      </div>
                    ))}

                    {variants.length < defaultVariants.length && (
                      <CardFooter className="px-0">
                        <Button
                          variant="ghost"
                          className="text-foreground hover:bg-muted flex items-center gap-2"
                          onClick={() =>
                            setVariants((prev) => [
                              ...prev,
                              { name: "", values: [""] },
                            ])
                          }
                        >
                          <Plus className="h-4 w-4" /> Add another option
                        </Button>
                      </CardFooter>
                    )}

                    {output.variants.length > 0 && (
                      <VariantList
                        data={output}
                        onVariantsChange={(updated) => {
                          const newData = { variants: updated };
                          setOutput(newData);
                          persistStructure(newData);
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* ----------------------- RIGHT COLUMN ----------------------- */}
          <div className="w-1/3 rounded-lg">
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Status</h6>

                <Select
                  value={productForm.status}
                  onValueChange={(val: "DRAFT" | "PUBLISHED") =>
                    setProductForm({ ...productForm, status: val })
                  }
                >
                  <SelectTrigger className="w-[100%] shadow-none border border-black">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            <div className="flex mt-4 justify-end">
              <Button className="w-full" onClick={handleSaveProduct}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
