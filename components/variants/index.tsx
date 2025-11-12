"use client";

import {
  PlusCircle,
  X,
  Loader2,
  Save,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Grip as Grip2,
  Trash2,
  Plus,
  Image,
} from "lucide-react";
import { useState, useEffect, useMemo, startTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import VariantList from "./variant-list";
import { Card, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import RichText from "../ui/rich-text";
import { MediaUpload } from "../media-upload";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";

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
  compareAtPrice: number;
  costPerItem: number;
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
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    categoryId: "",
    type: "",
    vendor: "",
    price: "",
    compareAtPrice: "",
    costPerItem: "",
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
    const { title, price, categoryId, vendor } = productForm;

    if (!title || !price || !categoryId || !vendor) {
      alert("⚠️ Please fill all required product fields!");
      return;
    }

    // ✅ Build product payload
    const productPayload = {
      title: productForm.title.trim(),
      description: { text: productForm.description.trim() },
      categoryId: parseInt(productForm.categoryId),
      type: productForm.type || "Standard",
      vendor: productForm.vendor.trim(),
      price: parseFloat(productForm.price),
      compareAtPrice: parseFloat(productForm.compareAtPrice) || 0,
      costPerItem: parseFloat(productForm.costPerItem) || 0,
      variants: output.variants,
      mediaUrls: [], // Optional: later connect your image uploader here
    };

    try {
      // ✅ Call your API
      const response = await fetch("/api/products/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productPayload),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        alert(`✅ ${data.message}`);

        // Optional: store locally for cache/history
        const existingRaw = localStorage.getItem(PRODUCT_KEY);
        const existing: Product[] = existingRaw ? JSON.parse(existingRaw) : [];
        localStorage.setItem(
          PRODUCT_KEY,
          JSON.stringify([...existing, data.data])
        );

        // Reset form + variant data
        setProductForm({
          title: "",
          description: "",
          categoryId: "",
          type: "",
          vendor: "",
          price: "",
          compareAtPrice: "",
          costPerItem: "",
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
          <div className="w-2/3 rounded-lg">
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Title</h6>
                <Input
                  className="shadow-none border border-black"
                  type="text"
                  placeholder="Short sleeve t-shirt"
                />
              </div>
              <div className="px-5">
                <h6 className="text-sm py-1">Description</h6>
                <RichText />
              </div>
              <div className="px-5">
                <h6 className="text-sm py-1">Media</h6>
                <MediaUpload />
              </div>
              <div className="flex flex-wrap">
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Category</h6>
                  <Select>
                    <SelectTrigger className="w-[100%] shadow-none border border-black">
                      <SelectValue placeholder="Select a fruit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Fruits</SelectLabel>
                        <SelectItem value="apple">Apple</SelectItem>
                        <SelectItem value="banana">Banana</SelectItem>
                        <SelectItem value="blueberry">Blueberry</SelectItem>
                        <SelectItem value="grapes">Grapes</SelectItem>
                        <SelectItem value="pineapple">Pineapple</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Product code</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="text"
                    placeholder="Short sleeve t-shirt"
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
                    placeholder="$ 0.00"
                  />
                </div>
                <div className="px-5 w-1/2">
                  <h6 className="text-sm py-1">Discount Hold Sale (%)</h6>
                  <Input
                    className="shadow-none border border-black"
                    type="number"
                    placeholder="$ 0.00"
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
                    placeholder="$ 0.00"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <div className="px-5">
                <h6 className="text-sm py-1 font-bold">Variant</h6>
              </div>
              <div className="flex justify-center">
                <div className="w-full mx-5 rounded-lg border border-border bg-card p-6">
                  <div className="space-y-6">
                    {options.map((option) => (
                      <div key={option.id} className="space-y-4">
                        {/* Option Row with Drag Handle */}
                        <div className="flex items-start gap-3">
                          <div className="mt-3 cursor-grab active:cursor-grabbing">
                            <Grip2 className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1 space-y-2">
                            {/* Option Name Label */}
                            <label className="text-sm font-medium text-foreground">
                              Option name
                            </label>

                            {/* Option Name Input */}
                            <Input
                              className={`${
                                option.hasError
                                  ? "border-destructive bg-destructive/10"
                                  : "border-border"
                              }`}
                              placeholder="e.g. Size"
                            />

                            {/* Error Message */}
                            {option.hasError && (
                              <div className="flex items-center gap-2 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4" />
                                <span>Option name is required.</span>
                              </div>
                            )}

                            {/* Option Values Label */}
                            <label className="mt-4 block text-sm font-medium text-foreground">
                              Option values
                            </label>

                            {/* Option Values Input */}
                            <Input
                              className="border-border"
                              placeholder="e.g. Small, Medium, Large"
                            />

                            {/* Action Buttons */}
                            <div className="flex items-center justify-between gap-2 pt-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => handleDeleteOption(option.id)}
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
                        {option.id !== options[options.length - 1].id && (
                          <hr className="border-border" />
                        )}
                      </div>
                    ))}
                    <CardFooter className="px-0 border-t">
                      <Button
                        variant="ghost"
                        className="text-foreground hover:bg-muted"
                        onClick={handleAddOption}
                      >
                        <Plus className="" />
                        Add another option
                      </Button>
                    </CardFooter>
                    {/* Add Another Option Button */}
                    <div className="max-w-6xl mx-auto">
                      <div className="bg-white rounded-lg shadow">
                        {/* Header */}
                        <div className="grid grid-cols-[auto_1fr_150px_150px_150px] gap-4 px-6 py-4 border-b border-gray-200 text-sm font-medium text-gray-600">
                          <div className="w-6">
                            <Checkbox />
                          </div>
                          <div>Variant · Collapse all</div>
                          <div>Barcode</div>
                          <div>Price</div>
                          <div>Available</div>
                        </div>

                        {/* Variant Groups */}
                        <div className="divide-y divide-gray-200">
                          {groups.map((group) => (
                            <div key={group.id}>
                              {/* Group Header */}
                              <div className="grid grid-cols-[auto_1fr_150px_150px_150px] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors">
                                <div className="w-6">
                                  <Checkbox />
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="w-25 h-25 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-xl bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                                    <div className="flex flex-col items-center justify-center text-blue-600">
                                      <Image />
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => toggleGroup(group.id)}
                                    className="flex items-center gap-2 cursor-pointer hover:opacity-70 transition-opacity"
                                  >
                                    <span className="text-base font-semibold text-gray-900">
                                      {group.size}
                                    </span>
                                    <span className="text-sm text-gray-600">
                                      {group.variantCount} variants
                                    </span>
                                    <ChevronDown
                                      size={16}
                                      className={`transition-transform ${
                                        group.isExpanded ? "" : "-rotate-90"
                                      }`}
                                    />
                                  </button>
                                </div>

                                {/* Barcode for Group */}
                                <Input
                                  type="text"
                                  placeholder="Scan or enter barcode"
                                  className="border border-gray-300"
                                />

                                {/* Price */}
                                <Input
                                  type="number"
                                  placeholder="$ 0.00"
                                  className="bg-gray-50"
                                />

                                {/* Available */}
                                 <Input
                                  type="number"
                                  placeholder="$ 0.00"
                                  className="bg-gray-50"
                                />
                              </div>

                              {/* Expanded Variants */}
                              {group.isExpanded && (
                                <div className="bg-gray-50">
                                  {group.variants.map((variant: any) => (
                                    <div
                                      key={variant.id}
                                      className="grid grid-cols-[auto_1fr_150px_150px_150px] pl-16 gap-4 px-6 py-4 items-center border-t border-gray-100 hover:bg-white transition-colors"
                                    >
                                      <div className="w-6">
                                        <Checkbox />
                                      </div>
                                      <div className="flex items-center gap-3">
                                        <div className="w-15 h-15 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors cursor-pointer">
                                          <div className="flex flex-col items-center justify-center text-blue-600">
                                            <Image />
                                          </div>
                                        </div>
                                        <span className="text-gray-900">
                                          {variant.name}
                                        </span>
                                      </div>

                                      {/* Barcode */}
                                      <Input
                                        type="text"
                                        placeholder="Barcode"
                                        className="border border-gray-300"
                                      />

                                      {/* Price */}
                                      <Input
                                        type="number"
                                        placeholder="$ 0.00"
                                        className="border border-gray-300"
                                      />

                                      {/* Available */}
                                      <Input
                                        type="number"
                                        placeholder="0"
                                        className="border border-gray-300"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-6 text-center text-gray-700 bg-gray-50 rounded-b-lg">
                          Total inventory at Shop location: 0 available
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="w-1/3 rounded-lg">
            <Card className="shadow-none border rounded-lg">
              <div className="px-5">
                <h6 className="text-sm py-1">Status</h6>
                <Select>
                  <SelectTrigger className="w-[100%] shadow-none border border-black">
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Status</SelectLabel>
                      <SelectItem value="apple">Drafted</SelectItem>
                      <SelectItem value="banana">Published</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </Card>
           <div className="flex mt-4 justify-end">
            <Button className="w-full">Save</Button>
           </div>
          </div>
        </div>
      </div>
    </>
  );
}
