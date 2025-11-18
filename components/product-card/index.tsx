"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface VariantData {
  id: number;
  color?: string | null;
  size?: string | null;
  imageVariant?: string | null;
}

export interface ProductCardProps {
  title: string;
  price: number;
  productCode?: string | null;
  image?: string | null;
  variants: VariantData[];
}

export function ProductCard({ title, price, productCode, image, variants }: ProductCardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const visibleVariants = variants.slice(currentIndex, currentIndex + 4);

  const handleNext = () => {
    if (currentIndex + 4 < variants.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const currentImage =
    variants[currentIndex]?.imageVariant || image || "/placeholder.png";

  return (
    <div className="w-full bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-neutral-800 px-4 py-3 text-center border-b border-neutral-700">
        <p className="text-xs font-bold text-yellow-400 tracking-wider">
          KEEPFLY EXCLUSIVE
        </p>
        <h2 className="text-lg font-bold text-white mt-1 leading-tight">
          {title}
        </h2>
      </div>

      {/* Main Image */}
      <div className="bg-neutral-950 p-4 flex items-center justify-center h-64 cursor-pointer group">
        <div className="relative w-full h-full">
          <Image
            src={currentImage}
            alt={title}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      </div>

      {/* Product Info */}
      <div className="px-6 py-5 bg-neutral-900">
        <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
        <p className="text-sm text-neutral-400 mb-4">{productCode}</p>
        <Button className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg py-3 font-semibold transition-colors">
          ➜ View Details
        </Button>
      </div>

      {/* Variant Thumbnails */}
      <div className="bg-neutral-950 px-4 py-4 border-t border-neutral-700">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </button>

          <div className="flex gap-2 flex-1 overflow-hidden">
            {visibleVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setCurrentIndex(variants.indexOf(variant))}
                className="flex-shrink-0 w-14 h-14 rounded border border-neutral-700 hover:border-neutral-500 overflow-hidden"
              >
                <Image
                  src={variant.imageVariant || image || "/placeholder.png"}
                  alt="variant"
                  width={56}
                  height={56}
                  className="object-cover w-full h-full"
                />
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex + 4 >= variants.length}
            className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
