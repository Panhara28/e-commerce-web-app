"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";

type Product = {
  name: string;
  created_at: string;
  variants: any[];
};

const STORAGE_KEY = "variant_saved_items";

// 🔹 Utility: convert name → slug
function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // remove special chars
    .replace(/\s+/g, "-"); // replace spaces with -
}
export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  // Load products on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed: Product[] = raw ? JSON.parse(raw) : [];
      setProducts(parsed);
    } catch {
      setProducts([]);
    }
  }, []);

  const handleDelete = (name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    const updated = products.filter((p) => p.name !== name);
    setProducts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">🛍️ Product List</h2>

      {products.length === 0 ? (
        <p className="text-gray-500">No products found. Create one to get started!</p>
      ) : (
        <div className="overflow-x-auto border rounded-lg shadow-sm">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700">Product Name</th>
                <th className="px-4 py-3 font-medium text-gray-700">Created At</th>
                <th className="px-4 py-3 font-medium text-gray-700 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, idx) => (
                <tr key={idx} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right flex justify-end gap-3">
                    <Link
                      href={`/products/edit/${slugify(p.name)}`}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <Pencil size={16} />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(p.name)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
