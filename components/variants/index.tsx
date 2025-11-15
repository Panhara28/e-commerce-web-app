"use client";

import { Loader2, X, Grip as Grip2, Trash2, Plus } from "lucide-react";
import { useState, useEffect, useMemo, startTransition } from "react";
import VariantList from "./variant-list";
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
import { useCategories } from "@/hooks/useCategories";

// --------------------- Types ---------------------
type SubVariant = {
  color: string;
  material: string;
  price: number;
  stock: number;
  imageVariant?: string;
  barcode?: string;
};

type Variant = {
  id?: string;
  size?: string;
  color?: string;
  material?: string;
  price?: number;
  stock?: number;
  imageVariant?: string;
  barcode?: string;
  sub_variants?: SubVariant[];
  name?: string;
  available?: number;
};

type Product = {
  id: number;
  slug: string;
  title: string;
  description: { text: string };
  categoryId: number;
  type: string;
  vendor: string;
  price: number;
  variants: Variant[];
  created_at: string;
};

interface Option {
  id: string;
  name: string;
  value: string;
  hasError: boolean;
}

const STRUCTURE_KEY = "variant_data_v1";
const PRODUCT_KEY = "products_v1";

export default function Variants() {
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const { setCategories } = useCategories();

  const [showAdditional, setShowAdditional] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const [options, setOptions] = useState<Option[]>([
    { id: "1", name: "Size", value: "Medium", hasError: true },
    { id: "2", name: "Color", value: "Black", hasError: true },
  ]);

  const [variants, setVariants] = useState<
    { name: string; values: string[] }[]
  >([]);

  const [output, setOutput] = useState<{ variants: Variant[] }>(() => {
    try {
      const raw = localStorage.getItem(STRUCTURE_KEY);
      return raw ? JSON.parse(raw) : { variants: [] };
    } catch {
      return { variants: [] };
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);

  // PRODUCT FIELDS
  const [productForm, setProductForm]: any = useState({
    title: "",
    description: "",
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

  // ------------------------- Variant Builder Logic -------------------------
  const handleAddVariant = () => {
    if (variants.length < defaultVariants.length) {
      setVariants((prev) => [...prev, { name: "", values: [""] }]);
    }
  };

  const handleDeleteVariant = (index: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== index));

  const handleDeleteValue = (vIndex: number, valIndex: number) =>
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIndex) return v;
        const newValues = v.values.filter((_, idx) => idx !== valIndex);
        if (newValues.length === 0) newValues.push("");
        return { ...v, values: newValues };
      })
    );

  const handleNameChange = (index: number, newName: string) =>
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, name: newName } : v))
    );

  const handleValueChange = (
    vIndex: number,
    valIndex: number,
    newValue: string
  ) =>
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIndex) return v;
        const newValues = [...v.values];
        newValues[valIndex] = newValue;
        const isLast = valIndex === newValues.length - 1;
        if (isLast && newValue.trim() !== "") newValues.push("");
        return { ...v, values: newValues };
      })
    );

  // ------------------------- Generate Variant Output -------------------------
  const generatedOutput = useMemo(() => {
    const active = variants
      .filter((v) => v.name.trim() && v.values.some((val) => val.trim()))
      .map((v) => ({
        name: v.name.toLowerCase(),
        values: v.values.filter(Boolean).map((x) => x.trim()),
      }));

    if (active.length === 0) return { variants: [] };

    const combine = (arrs: string[][]) =>
      arrs.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]]);

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

  // ------------------------- MERGE FIX HERE (the only fix) -------------------------
  useEffect(() => {
    startTransition(() => setIsGenerating(true));

    const t = setTimeout(() => {
      setOutput((prev) => {
        const merged = generatedOutput.variants.map((v) => {
          const existing = prev.variants.find(
            (o) =>
              o.size === v.size &&
              o.color === v.color &&
              o.material === v.material
          );

          if (existing) {
            const mergedSubs = v.sub_variants!.map((s, i) => {
              const prevSub = existing.sub_variants?.[i] || {};

              return {
                ...s,
                price: prevSub.price ?? s.price,
                stock: prevSub.stock ?? s.stock,
                barcode: prevSub.barcode ?? s.barcode ?? "",
                imageVariant: prevSub.imageVariant ?? s.imageVariant ?? "",
              };
            });

            return {
              ...v,
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
  }, [generatedOutput]);

  // ------------------------- Save Product -------------------------
  const handleSaveProduct = async () => {
    const {
      title,
      description,
      categoryId,
      productCode,
      status,
      price,
      salePriceHold,
      discountHold,
      salePricePremium,
      discountPremium,
    } = productForm;

    if (!title || !price || !categoryId) {
      alert("⚠️ Please fill all required product fields!");
      return;
    }

    const productPayload = {
      title: title.trim(),
      description: description ? description : {},
      categoryId: parseInt(categoryId),
      productCode: productCode?.trim() || "",
      status: status || "DRAFT",
      price: parseFloat(price) || 0,
      salePriceHold: parseFloat(salePriceHold) || 0,
      discountHold: parseFloat(discountHold) || 0,
      salePricePremium: parseFloat(salePricePremium) || 0,
      discountPremium: parseFloat(discountPremium) || 0,
      discount: parseInt(productForm.discount) || 0,

      variants: output.variants.flatMap((v: any) =>
        v.sub_variants.length > 0
          ? v.sub_variants.map((s: any) => ({
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

      mediaUrls: mediaFiles.map((m) => ({
        url: m.url,
      })),
    };

    try {
      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        alert(`✅ ${data.message}`);

        setProductForm({
          title: "",
          description: "",
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

        localStorage.removeItem(STRUCTURE_KEY);
        setOutput({ variants: [] });
        setVariants([]);
        setMediaFiles([]);
        setCategories([]);
        setResetKey(Date.now());
      } else {
        alert(data.message || "Failed to create product!");
      }
    } catch (error) {
      alert("Network error while creating product!");
    }
  };

  // ------------------------- Render UI -------------------------
  return (
    <>
      <div className="container mx-auto">
        <div className="flex gap-3">
          <div className="w-2/2 rounded-lg">
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Title</h6>
                <Input
                  className="shadow-none border border-black"
                  type="text"
                  placeholder="Short sleeve t-shirt"
                  value={productForm.title}
                  onChange={(e) =>
                    setProductForm({ ...productForm, title: e.target.value })
                  }
                />
              </div>

              <div className="px-5">
                <h6 className="text-sm py-1">Description</h6>
                <RichText
                  key={resetKey}
                  value={productForm.description}
                  onChange={(val) =>
                    setProductForm({ ...productForm, description: val })
                  }
                />
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
                      setProductForm({ ...productForm, categoryId: id })
                    }
                    resetSignal={resetKey}
                  />
                </div>

                {/* Product Code */}
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Product code</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="text"
                    placeholder="TSH-001"
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

            {/* Prices */}
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
                    placeholder="$ 0.00"
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Discount</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    placeholder="$ 0.00"
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
                    placeholder="$ 0.00"
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
                    placeholder="0"
                  />
                </div>

                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Sale Price for Premium ($)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    placeholder="$ 0.00"
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
                    placeholder="0"
                  />
                </div>
              </div>
            </Card>

            {/* Variant Builder */}
            <Card>
              <div className="px-5">
                <h6 className="text-sm py-1 font-bold">Variant</h6>
              </div>

              <div className="flex justify-center">
                <div className="w-full mx-5 rounded-lg border border-border bg-card p-6">
                  <div className="space-y-6">
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
                              onChange={(e) =>
                                handleNameChange(i, e.target.value)
                              }
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
                                  onChange={(e) =>
                                    handleValueChange(i, j, e.target.value)
                                  }
                                />

                                {val.trim() && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDeleteValue(i, j)}
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
                                onClick={() => handleDeleteVariant(i)}
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
                          onClick={handleAddVariant}
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

          {/* Right Column */}
          <div className="w-1/3 rounded-lg">
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Status</h6>

                <Select
                  value={productForm.status}
                  onValueChange={(val) =>
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
