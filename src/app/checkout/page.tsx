"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import StripeProvider from "@/components/StripeProvider";
import CheckoutForm from "@/components/CheckoutForm";

interface OrderSummary {
  productName: string;
  variant: string;
  amount: number;
  photoUrl?: string;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isCustom = searchParams.get("custom") === "true";
  const productSlug = searchParams.get("product");
  const variant = searchParams.get("variant") || "no-legs";

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isCustom && !productSlug) {
      setError("No product selected");
      setLoading(false);
      return;
    }

    const payload = isCustom
      ? {
          custom: true,
          width: parseFloat(searchParams.get("width") || "4"),
          length: parseFloat(searchParams.get("length") || "2"),
          height: parseFloat(searchParams.get("height") || "2"),
          hasLegs: searchParams.get("hasLegs") === "true",
          hasBottom: searchParams.get("hasBottom") === "true",
        }
      : { productSlug, variant };

    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to initialize checkout");
        }
        return res.json();
      })
      .then((data) => {
        setClientSecret(data.clientSecret);
        setOrderSummary(data.orderSummary);
      })
      .catch((err) => {
        setError(err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isCustom, productSlug, variant, searchParams]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-stone-500">Preparing checkout…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!isCustom && !productSlug)) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center py-24">
          <h1 className="text-2xl font-bold text-stone-900 mb-3">
            {error || "No product selected"}
          </h1>
          <p className="text-stone-500 mb-6">
            Please go back and configure your planter.
          </p>
          <Link
            href="/custom"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
          >
            Build Your Own
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <Link
        href="/custom"
        className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-700 mb-8 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Builder
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        {/* Payment Form */}
        <div className="lg:col-span-3 order-2 lg:order-1">
          {clientSecret ? (
            <StripeProvider clientSecret={clientSecret}>
              <CheckoutForm
                productName={orderSummary?.productName || ""}
                variant={variant}
              />
            </StripeProvider>
          ) : (
            <div className="p-6 bg-stone-50 border border-stone-200 rounded-xl text-center">
              <p className="text-stone-600">
                Payment system is not configured. Set your Stripe keys in the
                environment to enable checkout.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          <div className="bg-stone-50 rounded-2xl p-6 sticky top-24">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">
              Order Summary
            </h2>
            {orderSummary && (
              <>
                {orderSummary.photoUrl && (
                  <div className="aspect-[4/3] relative rounded-xl overflow-hidden bg-stone-200 mb-4">
                    <Image
                      src={orderSummary.photoUrl}
                      alt={orderSummary.productName}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 300px"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-stone-600">Product</span>
                    <span className="font-medium text-stone-900">
                      {orderSummary.productName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-600">Style</span>
                    <span className="font-medium text-stone-900">
                      {orderSummary.variant}
                    </span>
                  </div>
                  <hr className="border-stone-200 my-3" />
                  <div className="flex justify-between text-lg">
                    <span className="font-semibold text-stone-900">Total</span>
                    <span className="font-bold text-stone-900">
                      {formatPrice(orderSummary.amount)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex items-center justify-center py-24">
            <div className="flex flex-col items-center gap-4">
              <svg className="animate-spin h-8 w-8 text-amber-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <p className="text-stone-500">Loading checkout…</p>
            </div>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
