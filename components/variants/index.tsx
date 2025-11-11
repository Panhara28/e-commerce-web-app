"use client";
import { PlusCircle, X } from "lucide-react";
import { useState, useEffect, useMemo, startTransition } from "react";
import VariantList from "./variant-list";

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

const STRUCTURE_KEY = "variant_data_v1";
const PRODUCT_KEY = "variant_saved_items";

export default function Variants() {
  const [productName, setProductName] = useState("");
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

  /* Helper to persist structure */
  const persistStructure = (data: { variants: Variant[] }) => {
    localStorage.setItem(STRUCTURE_KEY, JSON.stringify(data));
  };

  const defaultVariants = ["Size", "Color", "Material"];

  const getPlaceholder = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("size")) return "Medium";
    if (n.includes("color")) return "Black";
    if (n.includes("material")) return "Rubber";
    return "Enter option value";
  };

  /* ------------------------------------------------------------- */
  /* Manage Variant Options                                        */
  /* ------------------------------------------------------------- */
  const handleAddVariant = () => {
    if (variants.length < defaultVariants.length) {
      setVariants((prev) => [...prev, { name: "", values: [""] }]);
    }
  };

  const handleDeleteVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteValue = (vIndex: number, valIndex: number) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIndex) return v;
        const newValues = v.values.filter((_, idx) => idx !== valIndex);
        if (newValues.length === 0) newValues.push("");
        return { ...v, values: newValues };
      })
    );
  };

  const handleNameChange = (index: number, newName: string) => {
    setVariants((prev) =>
      prev.map((v, i) => (i === index ? { ...v, name: newName } : v))
    );
  };

  const handleValueChange = (vIndex: number, valIndex: number, newValue: string) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIndex) return v;
        const newValues = [...v.values];
        newValues[valIndex] = newValue;

        // Auto-add a blank field if the last one is filled
        const isLast = valIndex === newValues.length - 1;
        if (isLast && newValue.trim() !== "") newValues.push("");
        return { ...v, values: newValues };
      })
    );
  };

  /* ------------------------------------------------------------- */
  /* Generate Dynamic Combinations                                 */
  /* ------------------------------------------------------------- */
  const generatedOutput = useMemo(() => {
    const active = variants
      .filter((v) => v.name.trim() && v.values.some((val) => val.trim()))
      .map((v) => ({
        name: v.name.toLowerCase(),
        values: v.values.filter(Boolean).map((x) => x.trim()),
      }));

    if (active.length === 0) return { variants: [] };

    const combine = (arrs: string[][]) =>
      arrs.reduce(
        (a, b) => a.flatMap((x) => b.map((y) => [...x, y])),
        [[]] as string[][]
      );

    const combos = combine(active.map((x) => x.values));

    type Row = {
      size?: string;
      color?: string;
      material?: string;
      price: number;
      stock: number;
      sub_variants: SubVariant[];
    };

    const result: Row[] = combos.map((combo) => {
      const obj: Row = { sub_variants: [], price: 0, stock: 0 };
      active.forEach((opt, i) => {
        if (opt.name.includes("size")) obj.size = combo[i];
        else if (opt.name.includes("color")) obj.color = combo[i];
        else if (opt.name.includes("material")) obj.material = combo[i];
      });
      return obj;
    });

    const primaryKey =
      active.find((o) => o.name.includes("size"))?.name || active[0].name;

    const getPrimaryValue = (r: Row) =>
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

  /* ------------------------------------------------------------- */
  /* Sync to localStorage                                          */
  /* ------------------------------------------------------------- */
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
            return { ...v, price: existing.price, stock: existing.stock, sub_variants: mergedSubs };
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

  /* ------------------------------------------------------------- */
  /* Save Product                                                  */
  /* ------------------------------------------------------------- */
  const handleSaveProduct = () => {
    if (!productName.trim()) {
      alert("⚠️ Please enter a product name first!");
      return;
    }

    const productData = {
      name: productName.trim(),
      variants: output.variants,
      created_at: new Date().toISOString(),
    };

    const existingRaw = localStorage.getItem(PRODUCT_KEY);
    const existing: typeof productData[] = existingRaw ? JSON.parse(existingRaw) : [];

    // Add new product
    const updated = [...existing, productData];
    localStorage.setItem(PRODUCT_KEY, JSON.stringify(updated));

    alert(`✅ "${productName}" saved successfully!`);
    setProductName("");
  };

  /* ------------------------------------------------------------- */
  /* Render UI                                                     */
  /* ------------------------------------------------------------- */
  return (
    <div className="variant-card">
      {/* Product Name Input */}
      <div style={{ marginBottom: "16px" }}>
        <label className="variant-label">Product Name</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="variant-input"
        />
      </div>

      <h3 className="variant-title">Variants</h3>

      {variants.length === 0 ? (
        <div className="variant-add" onClick={handleAddVariant}>
          <PlusCircle className="variant-icon" />
          <span>Add options like size or color</span>
        </div>
      ) : (
        <>
          {variants.map((variant, i) => (
            <div key={i} className="variant-box">
              <label className="variant-label">Option name</label>
              <input
                type="text"
                placeholder={defaultVariants[i] || "Option name"}
                value={variant.name}
                onChange={(e) => handleNameChange(i, e.target.value)}
                className="variant-input"
              />
              <label className="variant-label">Option values</label>
              {variant.values.map((val, j) => (
                <div key={j} className="variant-value-row">
                  <input
                    type="text"
                    placeholder={getPlaceholder(variant.name || defaultVariants[i])}
                    value={val}
                    onChange={(e) => handleValueChange(i, j, e.target.value)}
                    className="variant-input"
                  />
                  {val.trim() && (
                    <button
                      className="variant-value-delete"
                      onClick={() => handleDeleteValue(i, j)}
                      type="button"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
              <div className="variant-actions">
                <button className="variant-delete" onClick={() => handleDeleteVariant(i)}>
                  Delete Option
                </button>
              </div>
            </div>
          ))}

          {variants.length < defaultVariants.length && (
            <div className="variant-add" onClick={handleAddVariant}>
              <PlusCircle className="variant-icon" />
              <span>Add another option</span>
            </div>
          )}

          {isGenerating && (
            <div style={{ marginTop: 8, fontSize: 13, color: "#6b7280", fontStyle: "italic" }}>
              Generating variants…
            </div>
          )}

          {!isGenerating && output.variants.length > 0 && (
            <>
              <VariantList
                data={output}
                onVariantsChange={(updated) => {
                  const newData = { variants: updated };
                  setOutput(newData);
                  persistStructure(newData);
                }}
              />

         
            </>
          )}
               {/* Save Product Button */}
              <div className="variant-actions" style={{ marginTop: "16px" }}>
                <button className="variant-done" onClick={handleSaveProduct}>
                  💾 Save Product
                </button>
              </div>
        </>
      )}
    </div>
  );
}
