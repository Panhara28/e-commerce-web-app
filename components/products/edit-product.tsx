"use client";
import { useEffect, useMemo, useState, startTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  PlusCircle,
  X,
  XCircle,
  Package,
  ChevronDown,
  ChevronUp,
  Save,
} from "lucide-react";

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

const STORAGE_KEY = "variant_saved_items";
const defaultVariants = ["Size", "Color", "Material"];

function unslugify(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const productName = unslugify(slug);

  const [productNameInput, setProductNameInput] = useState("");
  const [variants, setVariants] = useState<
    { name: string; values: string[] }[]
  >([]);
  const [output, setOutput] = useState<{ variants: Variant[] }>({
    variants: [],
  });
  const [expanded, setExpanded] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  /* ---------------------------------------------------------- */
  /* Load existing product from localStorage                    */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const list = JSON.parse(raw);
      const found = list.find(
        (p: any) =>
          p.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
      );
      if (!found) return;

      setProductNameInput(found.name);
      setOutput(found);

      // Extract existing variant options
      const existingOptions: { [key: string]: Set<string> } = {};
      found.variants.forEach((v: Variant) => {
        if (v.size) (existingOptions["Size"] ||= new Set()).add(v.size);
        if (v.color) (existingOptions["Color"] ||= new Set()).add(v.color);
        if (v.material)
          (existingOptions["Material"] ||= new Set()).add(v.material);
        v.sub_variants.forEach((sv) => {
          if (sv.color) (existingOptions["Color"] ||= new Set()).add(sv.color);
          if (sv.material)
            (existingOptions["Material"] ||= new Set()).add(sv.material);
        });
      });

      const reconstructed = Object.entries(existingOptions).map(
        ([name, vals]) => {
          const arr = Array.from(vals);
          // ✅ Always include one blank input for adding new values
          if (arr.length === 0 || arr[arr.length - 1].trim() !== "") {
            arr.push("");
          }
          return { name, values: arr };
        }
      );
      setVariants(reconstructed);
    } catch (e) {
      console.error("Failed to load product", e);
    }
  }, [slug]);

  /* ---------------------------------------------------------- */
  /* Helpers                                                    */
  /* ---------------------------------------------------------- */
  const getPlaceholder = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("size")) return "Medium";
    if (n.includes("color")) return "Black";
    if (n.includes("material")) return "Rubber";
    return "Enter value";
  };

  const extractExistingTypes = (data: { variants: Variant[] }) => {
    const names = new Set<string>();
    data.variants.forEach((v) => {
      if (v.size) names.add("size");
      if (v.color) names.add("color");
      if (v.material) names.add("material");
      v.sub_variants.forEach((s) => {
        if (s.color) names.add("color");
        if (s.material) names.add("material");
      });
    });
    return names;
  };

  /* ---------------------------------------------------------- */
  /* Add / delete / edit options                                */
  /* ---------------------------------------------------------- */
  const handleAddVariant = () => {
    const existing = new Set([
      ...variants.map((v) => v.name.toLowerCase()),
      ...extractExistingTypes(output),
    ]);

    const nextAvailable = defaultVariants.find(
      (d) => !existing.has(d.toLowerCase())
    );
    if (!nextAvailable) return alert("All variant types already added.");
    setVariants((prev) => [...prev, { name: nextAvailable, values: [""] }]);
  };

  const handleValueChange = (vIndex: number, valIndex: number, val: string) => {
    setVariants((prev) =>
      prev.map((v, i) => {
        if (i !== vIndex) return v;

        let values = [...v.values];
        values[valIndex] = val;

        // ✅ ensure there's always one blank input at the end
        const trimmed = values.filter((x) => x.trim() !== "");
        if (trimmed.length === 0) values = [""];
        else if (values[values.length - 1].trim() !== "") values.push("");

        return { ...v, values };
      })
    );
  };

  /* ---------------------------------------------------------- */
  /* Generate combinations (like create)                        */
  /* ---------------------------------------------------------- */
  const generatedOutput = useMemo(() => {
    const active = variants
      .filter((v) => v.name.trim() && v.values.some((val) => val.trim()))
      .map((v) => ({
        name: v.name.toLowerCase(),
        values: v.values.filter(Boolean),
      }));

    if (active.length === 0) return { variants: [] };

    const combine = (arrs: string[][]) =>
      arrs.reduce((a, b) => a.flatMap((x) => b.map((y) => [...x, y])), [
        [],
      ] as string[][]);

    const combos = combine(active.map((x) => x.values));

    const result = combos.map((combo) => {
      const obj: Variant = { price: 0, stock: 0, sub_variants: [] };
      active.forEach((opt, i) => {
        if (opt.name.includes("size")) obj.size = combo[i];
        else if (opt.name.includes("color")) obj.color = combo[i];
        else if (opt.name.includes("material")) obj.material = combo[i];
      });
      return obj;
    });

    const primary =
      active.find((a) => a.name.includes("size"))?.name || active[0].name;

    const unique = [
      ...new Set(
        result.map((r) =>
          primary.includes("size")
            ? r.size
            : primary.includes("color")
            ? r.color
            : r.material
        )
      ),
    ].filter(Boolean);

    const grouped = unique.map((val) => {
      const children = result.filter((r) => {
        const keyVal = primary.includes("size")
          ? r.size
          : primary.includes("color")
          ? r.color
          : r.material;
        return keyVal === val;
      });
      return {
        size: primary.includes("size") ? val : "",
        color: primary.includes("color") ? val : "",
        material: primary.includes("material") ? val : "",
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

  /* ---------------------------------------------------------- */
  /* Merge + keep prices                                        */
  /* ---------------------------------------------------------- */
  useEffect(() => {
    if (generatedOutput.variants.length === 0) return;
    startTransition(() => {
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
        return { variants: merged };
      });
    });
  }, [generatedOutput]);

  /* ---------------------------------------------------------- */
  /* Save                                                       */
  /* ---------------------------------------------------------- */
  const handleSave = () => {
    if (!productNameInput.trim()) return alert("Enter product name");
    const raw = localStorage.getItem(STORAGE_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(
      (p: any) =>
        p.name.toLowerCase().replace(/\s+/g, "-") === slug.toLowerCase()
    );
    const updated = {
      name: productNameInput.trim(),
      variants: output.variants,
      updated_at: new Date().toISOString(),
    };
    if (idx >= 0) list[idx] = updated;
    else list.push(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    alert("✅ Product updated!");
    router.push("/products");
  };

  /* ---------------------------------------------------------- */
  /* Render                                                     */
  /* ---------------------------------------------------------- */
  const existingNames = extractExistingTypes(output);
  variants.forEach((v) => existingNames.add(v.name.toLowerCase()));
  const nextOption = defaultVariants.find(
    (d) => !existingNames.has(d.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "800px", margin: "40px auto" }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          ✏️ Edit Product —{" "}
          <span style={{ color: "#2563eb" }}>{productName}</span>
        </h2>
        <button
          onClick={() => router.push("/products")}
          className="flex items-center"
        >
          <XCircle size={18} /> Back
        </button>
      </div>

      <div className="variant-card">
        <label className="variant-label">Product Name</label>
        <input
          className="variant-input"
          value={productNameInput}
          onChange={(e) => setProductNameInput(e.target.value)}
          placeholder="Enter product name"
        />

        <h3 className="variant-title">Variants</h3>

        {variants.map((variant, vIndex) => (
          <div key={vIndex} className="variant-box">
            <label className="variant-label">Option name</label>
            <input
              className="variant-input"
              value={variant.name}
              onChange={(e) => {
                const name = e.target.value;
                setVariants((prev) =>
                  prev.map((v, i) => (i === vIndex ? { ...v, name } : v))
                );
              }}
            />

            <label className="variant-label">Option values</label>
            {variant.values.map((val, valIndex) => (
              <div key={valIndex} className="variant-value-row">
                <input
                  className="variant-input"
                  placeholder={getPlaceholder(variant.name)}
                  value={val}
                  onChange={(e) =>
                    handleValueChange(vIndex, valIndex, e.target.value)
                  }
                />
                {val && (
                  <button
                    className="variant-value-delete"
                    onClick={() => {
                      const vals = variant.values.filter(
                        (_, i) => i !== valIndex
                      );
                      setVariants((prev) =>
                        prev.map((v, i) =>
                          i === vIndex ? { ...v, values: vals } : v
                        )
                      );
                    }}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
            <div className="variant-actions">
              <button
                className="variant-delete"
                onClick={() =>
                  setVariants((prev) => prev.filter((_, i) => i !== vIndex))
                }
              >
                Delete Option
              </button>
            </div>
          </div>
        ))}

        {nextOption && (
          <div className="variant-add" onClick={handleAddVariant}>
            <PlusCircle className="variant-icon" />
            <span>Add {nextOption}</span>
          </div>
        )}
      </div>

      {/* --- Variant List --- */}
      <div className="variant-list" style={{ marginTop: "20px" }}>
        {output.variants.map((variant, vIndex) => {
          const subs = variant.sub_variants || [];
          const min = Math.min(...subs.map((s) => s.price || 0));
          const max = Math.max(...subs.map((s) => s.price || 0));
          const showRange = min !== max;
          const hasExpandable = subs.some(
            (s) =>
              (s.color && s.color.trim().length > 0) ||
              (s.material && s.material.trim().length > 0)
          );
          return (
            <div key={vIndex} className="variant-group">
              <div
                className={`variant-header ${
                  hasExpandable ? "cursor-pointer" : ""
                }`}
                onClick={() =>
                  hasExpandable &&
                  setExpanded((prev) =>
                    prev.includes(vIndex)
                      ? prev.filter((i) => i !== vIndex)
                      : [...prev, vIndex]
                  )
                }
              >
                <div className="variant-main">
                  <Package className="variant-icon" />
                  <span className="variant-title">
                    {variant.size || variant.color || variant.material}
                  </span>
                  {hasExpandable && (
                    <span className="variant-count">
                      {variant.sub_variants.length} variants
                    </span>
                  )}
                </div>
                <div className="variant-inputs">
                  <input
                    type="text"
                    className="price-input"
                    placeholder={
                      showRange
                        ? `៛ ${min.toFixed(2)} – ${max.toFixed(2)}`
                        : "៛ 0.00"
                    }
                    value={showRange ? "" : variant.price}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setOutput((prev) => {
                        const updated = [...prev.variants];
                        updated[vIndex].price = val;
                        updated[vIndex].sub_variants = updated[
                          vIndex
                        ].sub_variants.map((s) => ({
                          ...s,
                          price: val,
                        }));
                        return { variants: updated };
                      });
                    }}
                  />

                  {/* ✅ only show dropdown if at least one subvariant */}
                  {hasExpandable &&
                    (expanded.includes(vIndex) ? (
                      <ChevronUp className="toggle-icon" />
                    ) : (
                      <ChevronDown className="toggle-icon" />
                    ))}
                </div>
              </div>

              {hasExpandable && expanded.includes(vIndex) && (
                <div className="sub-variant-list">
                  {variant.sub_variants.map((s, sIndex) => (
                    <div key={sIndex} className="sub-variant-row">
                      <div className="sub-variant-title">
                        {s.color} / {s.material}
                      </div>
                      <input
                        type="number"
                        className="price-input"
                        value={s.price}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 0;
                          setOutput((prev) => {
                            const updated = [...prev.variants];
                            updated[vIndex].sub_variants[sIndex].price = val;
                            return { variants: updated };
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* --- Save Button --- */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <button onClick={handleSave} className="variant-done">
          <Save size={16} style={{ marginRight: "6px" }} />
          Save Changes
        </button>
      </div>
    </div>
  );
}
