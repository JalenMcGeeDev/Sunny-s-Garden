"use client";

import Image from "next/image";
import { useState } from "react";
import { Product, VariantType } from "@/types";
import { formatPrice } from "@/lib/utils";
import VariantSelector from "./VariantSelector";

interface ProductSectionProps {
  product: Product;
}

export default function ProductSection({ product }: ProductSectionProps) {
  const [selectedVariant, setSelectedVariant] = useState<VariantType>("no-legs");
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  const currentPrice =
    selectedVariant === "no-legs" ? product.priceNoLegs : product.priceWithLegs;

  const handleBuyNow = () => {
    window.location.href = `/checkout?product=${product.slug}&variant=${selectedVariant}`;
  };

  return (
    <section id={product.slug} className="scroll-mt-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Photo Gallery */}
        <div className="space-y-3">
          <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-stone-100">
            <Image
              src={product.photos[selectedPhoto]?.url || "/images/products/placeholder.svg"}
              alt={product.photos[selectedPhoto]?.alt || product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          {product.photos.length > 1 && (
            <div className="flex gap-2">
              {product.photos.map((photo, index) => (
                <button
                  key={photo.id}
                  onClick={() => setSelectedPhoto(index)}
                  className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPhoto === index
                      ? "border-amber-500 ring-1 ring-amber-500"
                      : "border-stone-200 hover:border-stone-300"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            {product.name}
          </h2>
          <p className="text-stone-500 mt-2 text-lg">{product.tagline}</p>

          <p className="text-stone-700 mt-6 leading-relaxed">
            {product.description}
          </p>

          {/* Specifications */}
          <div className="mt-8 border border-stone-200 rounded-xl overflow-hidden">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wider px-4 py-3 bg-stone-50 border-b border-stone-200">
              Specifications
            </h3>
            <div className="divide-y divide-stone-100">
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-stone-500">Footprint</span>
                <span className="text-sm font-medium text-stone-800">
                  {product.width} wide × {product.height} tall
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-stone-500">Planting Depth</span>
                <span className="text-sm font-medium text-stone-800">
                  {product.plantingDepth}
                </span>
              </div>
              <div className="flex justify-between px-4 py-3">
                <span className="text-sm text-stone-500">Configuration</span>
                <span className="text-sm font-medium text-stone-800">
                  {product.configuration}
                </span>
              </div>
            </div>
          </div>

          {/* Variant + Price + Buy */}
          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-2">
                Select Style
              </label>
              <VariantSelector
                selected={selectedVariant}
                onChange={setSelectedVariant}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-bold text-stone-900">
                  {formatPrice(currentPrice)}
                </span>
                <span className="text-sm text-stone-500 ml-2">
                  {selectedVariant === "no-legs" ? "No Legs" : "With Legs"}
                </span>
              </div>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full py-4 px-8 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors text-lg"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
