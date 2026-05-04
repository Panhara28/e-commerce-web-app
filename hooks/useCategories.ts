import { useEffect, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/categories/tree");
        const data = await res.json();
        const normalizedCategories = Array.isArray(data)
          ? data
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.categories)
              ? data.categories
              : [];

        setCategories(normalizedCategories);
      } catch (error) {
        console.error(error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return { categories, loading, setCategories };
}
