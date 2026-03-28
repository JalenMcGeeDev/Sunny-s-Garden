import type { Metadata } from "next";
import { getProducts } from "@/lib/data";
import ProductSection from "@/components/ProductSection";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse the Sunny Collection — handcrafted cedar planter boxes in three sizes. Single Sunny, Tiny Sunny, and Double Sunny.",
};

export default async function ShopPage() {
  const products = await getProducts();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900">
          The Sunny Collection
        </h1>
        <p className="text-lg text-stone-500 mt-3 max-w-2xl mx-auto">
          Cedar planter boxes built with traditional frame-and-panel joinery.
          Each one handcrafted, each one made to order.
        </p>
      </div>

      <div className="space-y-20 sm:space-y-28">
        {products.map((product) => (
          <ProductSection key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
