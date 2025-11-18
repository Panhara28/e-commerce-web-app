"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductVariant {
  id: string;
  color: string;
  image: string;
  thumbnail: string;
}

const productVariants: ProductVariant[] = [
  {
    id: "1",
    color: "Lime Green",
    image: "/lime-green-sports-jersey-on-display.jpg",
    thumbnail: "/lime-green-jersey-thumbnail.jpg",
  },
  {
    id: "2",
    color: "Teal Blue",
    image: "/teal-blue-sports-jersey-on-display.jpg",
    thumbnail: "/teal-blue-jersey-thumbnail.jpg",
  },
  {
    id: "3",
    color: "Electric Green",
    image: "/electric-green-sports-jersey-on-display.jpg",
    thumbnail: "/electric-green-jersey-thumbnail.jpg",
  },
  {
    id: "4",
    color: "Dark Navy",
    image: "/dark-navy-sports-jersey-on-display.jpg",
    thumbnail: "/dark-navy-jersey-thumbnail.jpg",
  },
  {
    id: "5",
    color: "Purple",
    image: "/purple-sports-jersey-on-display.jpg",
    thumbnail: "/purple-jersey-thumbnail.jpg",
  },
];

export function ProductCard() {
  const [currentVariantId, setCurrentVariantId] = useState("1");
  const [carouselStart, setCarouselStart] = useState(0);

  const currentVariant = productVariants.find((v) => v.id === currentVariantId);
  const visibleVariants = productVariants.slice(
    carouselStart,
    carouselStart + 4
  );

  const handleNext = () => {
    if (carouselStart + 4 < productVariants.length) {
      setCarouselStart(carouselStart + 1);
    }
  };

  const handlePrev = () => {
    if (carouselStart > 0) {
      setCarouselStart(carouselStart - 1);
    }
  };

  return (
    <div className="w-full bg-neutral-900 rounded-lg overflow-hidden shadow-lg">
      {/* Header */}
      <div className="bg-neutral-800 px-4 py-3 text-center border-b border-neutral-700">
        <p className="text-xs font-bold text-yellow-400 tracking-wider">
          KEEPFLY EXCLUSIVE
        </p>
        <h2 className="text-lg font-bold text-white mt-1 leading-tight">
          PANSA JERSEY
          <br />
          COLLECTION
        </h2>
      </div>

      {/* Main Product Image */}
      <div className="bg-neutral-950 p-4 flex items-center justify-center h-64 cursor-pointer group">
        <div className="relative w-full h-full">
          <Image
            src={currentVariant?.image || "/placeholder.png"}
            alt={`${currentVariant?.color} jersey`}
            fill
            className="object-contain transition-transform duration-300 group-hover:scale-105"
            priority
          />
        </div>
      </div>

      {/* Color Indicators */}

      {/* Product Info */}
      <div className="px-6 py-5 bg-neutral-900">
        <h3 className="text-lg font-bold text-white mb-4 leading-tight">
          KEEPFLY PANSA
        </h3>
        <Button
          className="w-full bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-lg py-3 font-semibold transition-colors"
          onClick={() => alert("Login functionality here")}
        >
          ➜ Login
        </Button>
      </div>

      {/* Thumbnail Carousel */}
      <div className="bg-neutral-950 px-4 py-4 border-t border-neutral-700">
        <div className="flex items-center justify-between gap-2">
          {/* Prev Button */}
          <button
            onClick={handlePrev}
            disabled={carouselStart === 0}
            className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5 text-neutral-400" />
          </button>

          {/* Thumbnails */}
          <div className="flex gap-2 flex-1 overflow-hidden">
            {visibleVariants.map((variant) => (
              <button
                key={variant.id}
                onClick={() => setCurrentVariantId(variant.id)}
                className={`flex-shrink-0 w-14 h-14 rounded border-2 transition-all overflow-hidden ${
                  currentVariantId === variant.id
                    ? "border-yellow-400 ring-2 ring-yellow-400 ring-offset-2 ring-offset-neutral-950"
                    : "border-neutral-700 hover:border-neutral-600"
                }`}
              >
                <Image
                  src={variant.thumbnail || "/placeholder.png"}
                  alt={`${variant.color} thumbnail`}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={carouselStart + 4 >= productVariants.length}
            className="p-1.5 hover:bg-neutral-800 rounded disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5 text-neutral-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
