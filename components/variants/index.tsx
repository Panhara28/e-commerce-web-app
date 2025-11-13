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

// --------------------- Types ---------------------
type SubVariant = {
  color: string;
  material: string;
  price: number;
  stock: number;
};

type Variant = {
  id?: string;
  size?: string;
  color?: string;
  material?: string;
  price?: number;
  stock?: number;
  sub_variants?: SubVariant[];
  name?: string;
  available?: number;
  icon?: string;
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

interface VariantGroup {
  id: string;
  size: string;
  variantCount: number;
  isExpanded: boolean;
  variants: Variant[];
}

// --------------------- Component ---------------------
export default function Variants() {
  const [showAdditional, setShowAdditional] = useState(false);
  const [groups, setGroups] = useState<VariantGroup[]>([
    {
      id: "M",
      size: "M",
      variantCount: 4,
      isExpanded: true,
      variants: [
        { id: "1", name: "Red / Rubby", price: 0.0, available: 0 },
        { id: "2", name: "Red / Leather", price: 0.0, available: 0 },
        { id: "3", name: "Black / Rubby", price: 0.0, available: 0 },
        { id: "4", name: "Black / Leather", price: 0.0, available: 0 },
      ],
    },
    {
      id: "L",
      size: "L",
      variantCount: 4,
      isExpanded: false,
      variants: [
        { id: "5", name: "Red / Rubby", price: 0.0, available: 0 },
        { id: "6", name: "Red / Leather", price: 0.0, available: 0 },
        { id: "7", name: "Black / Rubby", price: 0.0, available: 0 },
        { id: "8", name: "Black / Leather", price: 0.0, available: 0 },
      ],
    },
  ]);

  const toggleGroup = (groupId: string) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId ? { ...g, isExpanded: !g.isExpanded } : g
      )
    );
  };

  const updateVariant = (
    groupId: string,
    variantId: string,
    field: "price" | "available",
    value: string | number
  ) => {
    setGroups(
      groups.map((g) =>
        g.id === groupId
          ? {
              ...g,
              variants: g.variants.map((v) =>
                v.id === variantId
                  ? {
                      ...v,
                      [field]:
                        field === "price"
                          ? Number.parseFloat(value as string)
                          : Number.parseInt(value as string),
                    }
                  : v
              ),
            }
          : g
      )
    );
  };
  const [options, setOptions] = useState<Option[]>([
    { id: "1", name: "Size", value: "Medium", hasError: true },
    { id: "2", name: "Color", value: "Black", hasError: true },
  ]);

  const handleAddOption = () => {
    const newOption: Option = {
      id: Math.random().toString(),
      name: "",
      value: "",
      hasError: false,
    };
    setOptions([...options, newOption]);
  };

  const handleDeleteOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
  };

  const handleOptionNameChange = (id: string, newName: string) => {
    setOptions(
      options.map((opt) =>
        opt.id === id
          ? { ...opt, name: newName, hasError: newName === "" }
          : opt
      )
    );
  };

  const handleOptionValueChange = (id: string, newValue: string) => {
    setOptions(
      options.map((opt) => (opt.id === id ? { ...opt, value: newValue } : opt))
    );
  };
  const toggleAdditional = () => setShowAdditional((prev) => !prev);
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

  // ✅ Product fields
  const [productForm, setProductForm]: any = useState({
    title: "",
    description: "",
    categoryId: "",
    productCode: "",
    status: "",
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

  // ------------------------- Manage Variant Options -------------------------
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

  // ------------------------- Generate Variants -------------------------
  const generatedOutput = useMemo(() => {
    const active = variants
      .filter((v) => v.name.trim() && v.values.some((val) => val.trim()))
      .map((v) => ({
        name: v.name.toLowerCase(),
        values: v.values.filter(Boolean).map((x) => x.trim()),
      }));

    if (active.length === 0) return { variants: [] };

    const combine = (arrs: string[][]) =>
      arrs.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [
        [],
      ] as string[][]);

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
        sub_variants: children.map((r) => ({
          color: r.color || "",
          material: r.material || "",
          price: 0,
          stock: 0,
        })),
      };
    });

    return { variants: grouped };
  }, [variants]);

  // ------------------------- Sync to localStorage -------------------------
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
            const mergedSubs = v.sub_variants.map((s, i) => ({
              ...s,
              price: existing.sub_variants![i]?.price ?? s.price,
              stock: existing.sub_variants![i]?.stock ?? s.stock,
            }));
            return {
              ...v,
              price: existing.price,
              stock: existing.stock,
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

  // ------------------------- Save Product (Connected to API) -------------------------
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

    // Validate required fields
    if (!title || !price || !categoryId) {
      alert("⚠️ Please fill all required product fields!");
      return;
    }

    // ✅ Build product payload EXACTLY matching API
    const productPayload = {
      title: title.trim(),
      description: { text: description.trim() },

      categoryId: parseInt(categoryId),
      productCode: productCode?.trim() || "",
      status: status || "DRAFT",

      price: parseFloat(price) || 0,
      salePriceHold: parseFloat(salePriceHold) || 0,
      discountHold: parseFloat(discountHold) || 0,
      salePricePremium: parseFloat(salePricePremium) || 0,
      discountPremium: parseFloat(discountPremium) || 0,

      // Variants generated from your variant system
      variants: output.variants.map((v: any) => ({
        size: v.size || "",
        color: v.color || "",
        material: v.material || "",
        price: v.price || 0,
        stock: v.stock || 0,
        barcode: v.barcode || "",
        imageVariant: v.imageVariant || "",
      })),

      // TODO: Add uploaded images later
      mediaUrls: [],
    };

    try {
      // Call your API
      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        alert(`✅ ${data.message}`);

        // Reset form + variant data
        setProductForm({
          title: "",
          description: "",
          categoryId: "",
          productCode: "",
          status: "",
          price: "",
          salePriceHold: "",
          discountHold: "",
          salePricePremium: "",
          discountPremium: "",
        });

        localStorage.removeItem(STRUCTURE_KEY);
        setOutput({ variants: [] });
        setVariants([]);
      } else {
        console.error("❌ API Error:", data);
        alert(data.message || "Failed to create product!");
      }
    } catch (error) {
      console.error("❌ Request Error:", error);
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
                  value={productForm.description}
                  onChange={(val) =>
                    setProductForm({ ...productForm, description: val })
                  }
                />
              </div>
              <div className="px-5">
                <h6 className="text-sm py-1">Media</h6>
                <MediaUpload />
              </div>
              <div className="flex flex-wrap">
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Category</h6>
                  <Select
                    value={productForm.categoryId}
                    onValueChange={(val) =>
                      setProductForm({ ...productForm, categoryId: val })
                    }
                  >
                    <SelectTrigger className="w-[100%] shadow-none border border-black">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1">Clothes</SelectItem>
                        <SelectItem value="2">Shoes</SelectItem>
                        <SelectItem value="3">Accessories</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
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
                  />
                </div>

                <div className="px-5 w-1/2  mb-4">
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

            <Card>
              <div className="px-5">
                <h6 className="text-sm py-1 font-bold">Variant</h6>
              </div>
              <div className="flex justify-center">
                {/* 🧩 Variant Builder Section - NEW UI INTERFACE */}
                <div className="w-full mx-5 rounded-lg border border-border bg-card p-6">
                  <div className="space-y-6">
                    {/* --- Variant Options UI (Size, Color, Material) --- */}
                    {variants.map((variant, i) => (
                      <div key={i} className="space-y-4">
                        <div className="flex items-start gap-3">
                          {/* Drag Handle */}
                          <div className="mt-3 cursor-grab active:cursor-grabbing">
                            <Grip2 className="h-5 w-5 text-muted-foreground" />
                          </div>

                          <div className="flex-1 space-y-2">
                            {/* Label */}
                            <label className="text-sm font-medium text-foreground">
                              Option name
                            </label>

                            {/* Option Name Input (OLD LOGIC) */}
                            <Input
                              className="border-border"
                              placeholder={defaultVariants[i] || "Option name"}
                              value={variant.name}
                              onChange={(e) =>
                                handleNameChange(i, e.target.value)
                              }
                            />

                            {/* Values Label */}
                            <label className="mt-4 block text-sm font-medium text-foreground">
                              Option values
                            </label>

                            {/* Option Values Inputs (OLD LOGIC FULLY APPLIED) */}
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

                                {/* Delete Value button (ONLY IF NOT EMPTY — OLD LOGIC) */}
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

                            {/* Action Buttons (OLD LOGIC: delete entire option) */}
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

                        {/* Divider */}
                        {i !== variants.length - 1 && (
                          <hr className="border-border" />
                        )}
                      </div>
                    ))}

                    {/* Add Another Option (OLD LOGIC) */}
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

                    {/* 🧩 Variant Combination List */}
                    {isGenerating && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" /> Generating
                        variants…
                      </div>
                    )}
                    {!isGenerating && output.variants.length > 0 && (
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
