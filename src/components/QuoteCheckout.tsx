"use client";

import StripeProvider from "./StripeProvider";
import CheckoutForm from "./CheckoutForm";
import { formatPrice } from "@/lib/utils";

interface QuoteCheckoutProps {
  clientSecret: string;
  productName: string;
  description: string;
  amount: number;
}

export default function QuoteCheckout({
  clientSecret,
  productName,
  description,
  amount,
}: QuoteCheckoutProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-stone-900 mb-1">
          Complete Your Purchase
        </h2>
        <p className="text-sm text-stone-500">
          {productName} — {formatPrice(amount)}
        </p>
      </div>
      <StripeProvider clientSecret={clientSecret}>
        <CheckoutForm productName={productName} variant={description} />
      </StripeProvider>
    </div>
  );
}
