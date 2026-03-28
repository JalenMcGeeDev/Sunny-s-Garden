import { Product, AboutContent } from "@/types";
import { demoProducts } from "@/data/products";
import { demoAboutContent } from "@/data/about";

// Data access layer — reads from hardcoded demo data for now.
// When Supabase is connected, swap these implementations to query the database.

export async function getProducts(): Promise<Product[]> {
  return demoProducts.filter((p) => p.visible).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return demoProducts.find((p) => p.slug === slug && p.visible) ?? null;
}

export async function getAboutContent(): Promise<AboutContent> {
  return demoAboutContent;
}
