import { useEffect, useState } from "react";

export function useCategories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/categories/tree");
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    }
    load();
  }, []);

  return { categories, loading, setCategories };
}
