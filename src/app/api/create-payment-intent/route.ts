import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { getProductBySlug } from "@/lib/data";
import { VariantType, CustomBuildConfig } from "@/types";
import {
  calculateCustomPrice,
  getCustomBuildDescription,
  CUSTOM_BUILD_LIMITS,
} from "@/lib/custom-pricing";

function validateCustomConfig(config: CustomBuildConfig): string | null {
  const { width, length, height } = config;
  const { width: wLimits, length: lLimits, height: hLimits } = CUSTOM_BUILD_LIMITS;
  if (width < wLimits.min || width > wLimits.max) return "Invalid width";
  if (length < lLimits.min || length > lLimits.max) return "Invalid length";
  if (height < hLimits.min || height > hLimits.max) return "Invalid height";
  if ((width * 10) % (wLimits.step * 10) !== 0) return "Invalid width step";
  if ((length * 10) % (lLimits.step * 10) !== 0) return "Invalid length step";
  if ((height * 10) % (hLimits.step * 10) !== 0) return "Invalid height step";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isCustom = body.custom === true;

    if (!stripe) {
      return NextResponse.json(
        { error: "Payment system not configured. Set STRIPE_SECRET_KEY in your environment." },
        { status: 503 }
      );
    }

    if (isCustom) {
      const customConfig: CustomBuildConfig = {
        width: parseFloat(body.width),
        length: parseFloat(body.length),
        height: parseFloat(body.height) || 2,
        hasLegs: body.hasLegs === true,
        hasBottom: body.hasBottom === true,
        paintOption: body.paintOption || "none",
        paintColor: body.paintColor || undefined,
      };

      const validationError = validateCustomConfig(customConfig);
      if (validationError) {
        return NextResponse.json(
          { error: validationError },
          { status: 400 }
        );
      }

      const amount = calculateCustomPrice(customConfig);
      const description = getCustomBuildDescription(customConfig);

      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "usd",
        metadata: {
          product_type: "custom",
          width: customConfig.width.toString(),
          length: customConfig.length.toString(),
          height: customConfig.height.toString(),
          has_legs: customConfig.hasLegs.toString(),
          has_bottom: customConfig.hasBottom.toString(),
          description,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
        orderSummary: {
          productName: "Custom Cedar Planter",
          variant: description,
          amount,
        },
      });
    }

    // Standard product checkout
    const { productSlug, variant } = body as {
      productSlug: string;
      variant: VariantType;
    };

    if (!productSlug || !variant) {
      return NextResponse.json(
        { error: "Missing product or variant" },
        { status: 400 }
      );
    }

    if (variant !== "no-legs" && variant !== "with-legs") {
      return NextResponse.json(
        { error: "Invalid variant" },
        { status: 400 }
      );
    }

    const product = await getProductBySlug(productSlug);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const amount =
      variant === "no-legs" ? product.priceNoLegs : product.priceWithLegs;
    const variantLabel = variant === "no-legs" ? "No Legs" : "With Legs";

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      metadata: {
        product_slug: product.slug,
        product_name: product.name,
        variant: variantLabel,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderSummary: {
        productName: product.name,
        variant: variantLabel,
        amount,
        photoUrl: product.photos[0]?.url,
      },
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent" },
      { status: 500 }
    );
  }
}
