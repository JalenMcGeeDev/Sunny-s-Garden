export interface ProductPhoto {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  width: string;
  height: string;
  plantingDepth: string;
  numRows: number;
  configuration: string;
  priceNoLegs: number;   // cents
  priceWithLegs: number;  // cents
  visible: boolean;
  sortOrder: number;
  photos: ProductPhoto[];
}

export type VariantType = "no-legs" | "with-legs";

export type PaintOption = "none" | "solid" | "sunnys-choice";
export type SolidColor = "white" | "black" | "green" | "gray" | "navy";

export const SOLID_COLORS: { value: SolidColor; label: string; hex: string }[] = [
  { value: "white", label: "White", hex: "#FFFFFF" },
  { value: "black", label: "Black", hex: "#1a1a1a" },
  { value: "green", label: "Hunter Green", hex: "#2d5a27" },
  { value: "gray", label: "Slate Gray", hex: "#6b7280" },
  { value: "navy", label: "Navy Blue", hex: "#1e3a5f" },
];

export interface CustomBuildConfig {
  width: number;       // feet (1-8)
  length: number;      // feet (1-8)
  height: number;      // feet (1-3)
  hasLegs: boolean;
  hasBottom: boolean;
  paintOption: PaintOption;
  paintColor?: SolidColor; // selected color when paintOption === "solid"
}

export interface QuoteRequest {
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  config: CustomBuildConfig;
}

export interface AboutContent {
  headline: string;
  body: string;             // HTML string
  primaryPhotoUrl: string;
  secondaryPhotoUrl?: string;
}

export interface Order {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  productName: string;
  productVariant: string;
  amountTotal: number;      // cents
  status: "New" | "In Progress" | "Shipped" | "Delivered" | "Cancelled";
  trackingNumber?: string;
  adminNotes?: string;
  createdAt: string;
}
