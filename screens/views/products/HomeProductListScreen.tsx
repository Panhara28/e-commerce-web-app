"use client";

import { useEffect, useState } from "react";
import { ProductCard, ProductCardProps } from "@/components/product-card";

export default function HomeProductListScreen() {
  const [products, setProducts] = useState<ProductCardProps[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        const res = await fetch("/api/views/products/lists");
        const json = await res.json();

        if (isMounted) {
          setProducts(json.data);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }
    }

    fetchProducts();

    return () => {
      isMounted = false; // cleanup if component unmounts
    };
  }, []);

  return (
    <section className="max-w-[1800px] mx-auto px-4">
      <h2 className="text-2xl font-bold mb-6">Featured Jerseys</h2>
      <div className="grid lg:grid-cols-5 gap-6">
        {products.map((p: any) => (
          <ProductCard
            key={p.slug}
            title={p.title}
            price={p.price}
            productCode={p.productCode}
            image={p.media?.[0]?.url}
            variants={p.variants}
          />
        ))}
      </div>
    </section>
  );
}
