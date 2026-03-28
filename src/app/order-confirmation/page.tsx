import type { Metadata } from "next";
import { stripe } from "@/lib/stripe";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Order Confirmed",
};

interface OrderConfirmationPageProps {
  searchParams: Promise<{ payment_intent?: string; payment_intent_client_secret?: string; redirect_status?: string }>;
}

export default async function OrderConfirmationPage({
  searchParams,
}: OrderConfirmationPageProps) {
  const params = await searchParams;
  const paymentIntentId = params.payment_intent;
  const redirectStatus = params.redirect_status;

  if (!paymentIntentId) {
    redirect("/");
  }

  // If Stripe isn't configured, show a generic confirmation
  if (!stripe) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Order Confirmed!
        </h1>
        <p className="text-stone-500 mb-8">
          Stripe is not configured, but your demo order was placed successfully.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const productName = paymentIntent.metadata?.product_name || "Cedar Planter";
    const variant = paymentIntent.metadata?.variant || "Unknown";
    const amount = paymentIntent.amount;
    const status = paymentIntent.status;

    if (status !== "succeeded" && redirectStatus !== "succeeded") {
      return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">
            Payment Incomplete
          </h1>
          <p className="text-stone-500 mb-8">
            Your payment was not completed. No charge has been made.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-3">
            Thank You for Your Order!
          </h1>
          <p className="text-stone-500">
            A confirmation email has been sent to your email address.
          </p>
        </div>

        <div className="bg-stone-50 rounded-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">
            Order Summary
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-stone-500">Product</span>
              <span className="font-medium text-stone-900">{productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Style</span>
              <span className="font-medium text-stone-900">{variant}</span>
            </div>
            <hr className="border-stone-200" />
            <div className="flex justify-between text-lg">
              <span className="font-semibold text-stone-900">Total Paid</span>
              <span className="font-bold text-stone-900">
                {formatPrice(amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  } catch {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <h1 className="text-3xl font-bold text-stone-900 mb-3">
          Something went wrong
        </h1>
        <p className="text-stone-500 mb-8">
          We couldn&apos;t retrieve your order details. If you were charged, please
          contact us.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }
}
