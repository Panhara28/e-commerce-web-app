"use client";

import { PlusCircle, X, Loader2, Save } from "lucide-react";
import { useState, useEffect, useMemo, startTransition } from "react";
import { v4 as uuidv4 } from "uuid";
import VariantList from "./variant-list";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

// --------------------- Types ---------------------
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

const STRUCTURE_KEY = "variant_data_v1";
const PRODUCT_KEY = "products_v1";

// --------------------- Component ---------------------
export default function Variants() {
  const [variants, setVariants] = useState<{ name: string; values: string[] }[]>([]);
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

  const handleValueChange = (vIndex: number, valIndex: number, newValue: string) =>
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
      arrs.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [[]] as string[][]);

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

    const primaryKey = active.find((o) => o.name.includes("size"))?.name || active[0].name;

    const getPrimaryValue = (r: Variant) =>
      primaryKey.includes("size")
        ? r.size
        : primaryKey.includes("color")
        ? r.color
        : primaryKey.includes("material")
        ? r.material
        : undefined;

    const uniquePrimary = [...new Set(result.map((r) => getPrimaryValue(r)))].filter(Boolean) as string[];

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
            (o) => o.size === v.size && o.color === v.color && o.material === v.material
          );
          if (existing) {
            const mergedSubs = v.sub_variants.map((s, i) => ({
              ...s,
              price: existing.sub_variants[i]?.price ?? s.price,
              stock: existing.sub_variants[i]?.stock ?? s.stock,
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

  // ------------------------- Save Product -------------------------
  const handleSaveProduct = () => {
    const { title, price, categoryId, vendor } = productForm;

    if (!title || !price || !categoryId || !vendor) {
      alert("⚠️ Please fill all required product fields!");
      return;
    }

    const existingRaw = localStorage.getItem(PRODUCT_KEY);
    const existing: Product[] = existingRaw ? JSON.parse(existingRaw) : [];

    const newProduct: Product = {
      id: existing.length + 1,
      slug: uuidv4(),
      title: title.trim(),
      description: { text: productForm.description.trim() },
      categoryId: parseInt(productForm.categoryId),
      type: productForm.type || "Standard",
      vendor: productForm.vendor.trim(),
      price: parseFloat(productForm.price),
      compareAtPrice: parseFloat(productForm.compareAtPrice) || 0,
      costPerItem: parseFloat(productForm.costPerItem) || 0,
      variants: output.variants,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(PRODUCT_KEY, JSON.stringify([...existing, newProduct]));

    alert(`✅ Product "${title}" saved successfully!`);
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
  };

  // ------------------------- Render UI -------------------------
  return (
    <Card className="p-6 space-y-6 border border-border/60 bg-card shadow-sm">
      {/* 🧩 Product Info Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Product Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input placeholder="Title" value={productForm.title} onChange={(e) => setProductForm((p) => ({ ...p, title: e.target.value }))} />
          <Input placeholder="Vendor" value={productForm.vendor} onChange={(e) => setProductForm((p) => ({ ...p, vendor: e.target.value }))} />
          <Input placeholder="Type (e.g., Gadget)" value={productForm.type} onChange={(e) => setProductForm((p) => ({ ...p, type: e.target.value }))} />
          <Input placeholder="Category ID" value={productForm.categoryId} onChange={(e) => setProductForm((p) => ({ ...p, categoryId: e.target.value }))} />
          <Input type="number" placeholder="Price ($)" value={productForm.price} onChange={(e) => setProductForm((p) => ({ ...p, price: e.target.value }))} />
          <Input type="number" placeholder="Compare At Price ($)" value={productForm.compareAtPrice} onChange={(e) => setProductForm((p) => ({ ...p, compareAtPrice: e.target.value }))} />
          <Input type="number" placeholder="Cost Per Item ($)" value={productForm.costPerItem} onChange={(e) => setProductForm((p) => ({ ...p, costPerItem: e.target.value }))} />
        </div>
        <Textarea placeholder="Product Description" value={productForm.description} onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))} />
      </div>

      <Separator />

      {/* 🧩 Variant Builder Section */}
      <div>
        <h3 className="text-base font-semibold mb-2">Variants</h3>
        {variants.length === 0 ? (
          <Button variant="outline" onClick={handleAddVariant} className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4" /> Add options like size or color
          </Button>
        ) : (
          <div className="space-y-6">
            {variants.map((variant, i) => (
              <Card key={i} className="p-4 border border-border/40 bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">Option {i + 1}</h4>
                  <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteVariant(i)}>
                    Delete
                  </Button>
                </div>
                <div className="space-y-3">
                  <Input placeholder={defaultVariants[i] || "Option name"} value={variant.name} onChange={(e) => handleNameChange(i, e.target.value)} />
                  {variant.values.map((val, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <Input placeholder={getPlaceholder(variant.name || defaultVariants[i])} value={val} onChange={(e) => handleValueChange(i, j, e.target.value)} />
                      {val.trim() && (
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteValue(i, j)}>
                          <X className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
            {variants.length < defaultVariants.length && (
              <Button variant="outline" onClick={handleAddVariant} className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> Add another option
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 🧩 Variant Combination List */}
      {isGenerating && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Generating variants…</div>}
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

      <Separator />

      {/* 🧩 Save Product */}
      <div className="pt-4">
        <Button onClick={handleSaveProduct} className="flex items-center gap-2">
          <Save className="w-4 h-4" /> Save Product
        </Button>
      </div>
    </Card>
  );
}
