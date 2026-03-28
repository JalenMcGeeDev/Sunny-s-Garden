import type { Metadata } from "next";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";
import QuoteCheckout from "@/components/QuoteCheckout";

export const metadata: Metadata = {
  title: "Your Quote | Sunny's Garden",
  description: "Review and pay for your custom cedar planter quote.",
};

interface QuotePageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function QuotePage({ searchParams }: QuotePageProps) {
  const params = await searchParams;
  const quoteId = params.id;

  if (!quoteId) {
    redirect("/custom");
  }

  if (!stripe) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Payment system not configured
        </h1>
        <p className="text-stone-500">Please contact us directly.</p>
      </main>
    );
  }

  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.retrieve(quoteId);
  } catch {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Quote not found
        </h1>
        <p className="text-stone-500 mb-6">
          This quote link may have expired or is invalid.
        </p>
        <Link
          href="/custom"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
        >
          Design a New Planter
        </Link>
      </main>
    );
  }

  const meta = paymentIntent.metadata;
  const status = paymentIntent.status;

  // Already paid
  if (status === "succeeded") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Quote Already Paid
        </h1>
        <p className="text-stone-500 mb-6">
          This quote has already been paid. Thank you for your order!
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  // Cancelled or processing
  if (status === "canceled") {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900 mb-3">
          Quote Expired
        </h1>
        <p className="text-stone-500 mb-6">
          This quote is no longer available. Please request a new one.
        </p>
        <Link
          href="/custom"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
        >
          Design a New Planter
        </Link>
      </main>
    );
  }

  const colorNames: Record<string, string> = {
    white: "White", black: "Black", green: "Hunter Green",
    gray: "Slate Gray", navy: "Navy Blue",
  };

  const paintLabel =
    meta.paint_option === "none"
      ? "Natural Cedar"
      : meta.paint_option === "solid"
        ? `Solid Color — ${colorNames[meta.paint_color || ""] || "TBD"}`
        : meta.paint_option === "sunnys-choice"
          ? "Sunny's Choice Art"
          : "Natural Cedar";

  const quoteDetails = {
    customerName: meta.customer_name || "Customer",
    description: meta.description || "Custom Cedar Planter",
    width: meta.width || "?",
    length: meta.length || "?",
    height: meta.height || "?",
    hasLegs: meta.has_legs === "true",
    hasBottom: meta.has_bottom === "true",
    paintLabel,
    amount: paymentIntent.amount,
    clientSecret: paymentIntent.client_secret!,
  };

  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-2">
            Your Custom Quote
          </h1>
          <p className="text-stone-500">
            Hi {quoteDetails.customerName}! Review your planter details below and complete your purchase.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Quote details */}
          <div className="lg:col-span-2">
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">
                Planter Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-stone-500">Dimensions</span>
                  <span className="font-medium text-stone-900">
                    {quoteDetails.width}ft × {quoteDetails.length}ft × {quoteDetails.height}ft
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Legs</span>
                  <span className="font-medium text-stone-900">
                    {quoteDetails.hasLegs ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Bottom Panel</span>
                  <span className="font-medium text-stone-900">
                    {quoteDetails.hasBottom ? "Yes" : "No"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Finish</span>
                  <span className="font-medium text-stone-900">
                    {quoteDetails.paintLabel}
                  </span>
                </div>
                <hr className="border-stone-200" />
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-stone-900">Total</span>
                  <span className="font-bold text-stone-900">
                    {formatPrice(quoteDetails.amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment form */}
          <div className="lg:col-span-3">
            <QuoteCheckout
              clientSecret={quoteDetails.clientSecret}
              productName="Custom Cedar Planter"
              description={quoteDetails.description}
              amount={quoteDetails.amount}
            />
          </div>
        </div>

        <p className="text-xs text-stone-400 text-center mt-8">
          Handcrafted to order. Ships in 2–3 weeks.
        </p>
      </div>
    </main>
  );
}
