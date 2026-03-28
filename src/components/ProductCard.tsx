import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const startingPrice = Math.min(product.priceNoLegs, product.priceWithLegs);

  return (
    <Link
      href={`/shop#${product.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-stone-200 hover:border-stone-300 hover:shadow-lg transition-all duration-300"
    >
      <div className="aspect-[4/3] relative overflow-hidden bg-stone-100">
        <Image
          src={product.photos[0]?.url || "/images/products/placeholder.svg"}
          alt={product.photos[0]?.alt || product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-semibold text-stone-900 group-hover:text-amber-700 transition-colors">
          {product.name}
        </h3>
        <p className="text-sm text-stone-500 mt-1 line-clamp-2">
          {product.tagline}
        </p>
        <p className="text-base font-medium text-stone-800 mt-3">
          From {formatPrice(startingPrice)}
        </p>
      </div>
    </Link>
  );
}
