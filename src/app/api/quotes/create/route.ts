import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { stripe } from "@/lib/stripe";
import { CustomBuildConfig, PaintOption, SolidColor } from "@/types";
import {
  getCustomBuildDescription,
  CUSTOM_BUILD_LIMITS,
} from "@/lib/custom-pricing";

const VALID_PAINT: PaintOption[] = ["none", "solid", "sunnys-choice"];
const VALID_COLORS: SolidColor[] = ["white", "black", "green", "gray", "navy"];

function validateConfig(config: CustomBuildConfig): string | null {
  const { width, length, height } = config;
  const { width: w, length: l, height: h } = CUSTOM_BUILD_LIMITS;
  if (width < w.min || width > w.max) return "Invalid width";
  if (length < l.min || length > l.max) return "Invalid length";
  if (height < h.min || height > h.max) return "Invalid height";
  return null;
}

/**
 * POST /api/quotes/create
 *
 * Admin endpoint — creates a quote (Stripe PaymentIntent) and emails
 * the customer a link to pay.
 *
 * Protected by ADMIN_SECRET env var.
 */
export async function POST(request: NextRequest) {
  try {
    // ── Auth ──
    const adminSecret = process.env.ADMIN_SECRET;
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace("Bearer ", "");

    if (!adminSecret || providedSecret !== adminSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    // ── Parse body ──
    const body = await request.json();
    const { customerName, customerEmail, priceCents, notes } = body;

    if (!customerName || typeof customerName !== "string") {
      return NextResponse.json({ error: "customerName is required" }, { status: 400 });
    }
    if (!customerEmail || typeof customerEmail !== "string" || !customerEmail.includes("@")) {
      return NextResponse.json({ error: "Valid customerEmail is required" }, { status: 400 });
    }
    if (!priceCents || typeof priceCents !== "number" || priceCents < 100) {
      return NextResponse.json({ error: "priceCents must be at least 100 ($1)" }, { status: 400 });
    }

    const paintOption: PaintOption = VALID_PAINT.includes(body.config?.paintOption)
      ? body.config.paintOption
      : "none";

    const config: CustomBuildConfig = {
      width: parseFloat(body.config?.width),
      length: parseFloat(body.config?.length),
      height: parseFloat(body.config?.height),
      hasLegs: body.config?.hasLegs === true,
      hasBottom: body.config?.hasBottom === true,
      paintOption,
      paintColor:
        paintOption === "solid" && VALID_COLORS.includes(body.config?.paintColor)
          ? body.config.paintColor
          : undefined,
    };

    if (isNaN(config.width) || isNaN(config.length) || isNaN(config.height)) {
      return NextResponse.json({ error: "Invalid dimensions" }, { status: 400 });
    }

    const validationError = validateConfig(config);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const description = getCustomBuildDescription(config);

    // ── Create Stripe PaymentIntent ──
    const paymentIntent = await stripe.paymentIntents.create({
      amount: priceCents,
      currency: "usd",
      metadata: {
        quote: "true",
        customer_name: customerName.trim(),
        customer_email: customerEmail.trim(),
        product_type: "custom",
        product_name: "Custom Cedar Planter",
        width: config.width.toString(),
        length: config.length.toString(),
        height: config.height.toString(),
        has_legs: config.hasLegs.toString(),
        has_bottom: config.hasBottom.toString(),
        paint_option: config.paintOption,
        paint_color: config.paintColor || "",
        description,
        notes: (notes || "").slice(0, 500),
      },
      automatic_payment_methods: { enabled: true },
    });

    const quoteId = paymentIntent.id;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const quoteUrl = `${siteUrl}/quote?id=${quoteId}`;

    // ── Email customer the payment link ──
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || "Sunny's Garden <onboarding@resend.dev>";

    const colorNames: Record<string, string> = {
      white: "White", black: "Black", green: "Hunter Green",
      gray: "Slate Gray", navy: "Navy Blue",
    };
    const paintLabel =
      config.paintOption === "none"
        ? "Natural Cedar"
        : config.paintOption === "solid"
          ? `Solid Color — ${colorNames[config.paintColor || ""] || "TBD"}`
          : "Sunny's Choice Art";

    const priceStr = `$${(priceCents / 100).toFixed(2)}`;

    let emailBody = `Hi ${customerName.trim()},\n\n`;
    emailBody += `Your custom cedar planter quote is ready!\n\n`;
    emailBody += `  • Dimensions: ${config.width}ft × ${config.length}ft × ${config.height}ft\n`;
    emailBody += `  • Legs: ${config.hasLegs ? "Yes" : "No"}\n`;
    emailBody += `  • Bottom: ${config.hasBottom ? "Yes" : "No"}\n`;
    emailBody += `  • Finish: ${paintLabel}\n`;
    emailBody += `  • Price: ${priceStr}\n\n`;
    emailBody += `Pay now and lock in your order:\n`;
    emailBody += `${quoteUrl}\n\n`;
    emailBody += `This link is unique to your quote. When you're ready, just click it to complete your purchase securely via Stripe.\n\n`;
    emailBody += `Questions? Just reply to this email.\n\n`;
    emailBody += `— The Sunny's Garden Team\n`;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: fromAddress,
        to: customerEmail.trim(),
        subject: `Your Custom Planter Quote — ${priceStr}`,
        text: emailBody,
      });
    } else {
      console.log("RESEND_API_KEY not configured — logging quote email:");
      console.log(emailBody);
    }

    return NextResponse.json({
      success: true,
      quoteId,
      quoteUrl,
    });
  } catch (error) {
    console.error("Quote creation error:", error);
    return NextResponse.json(
      { error: "Failed to create quote" },
      { status: 500 }
    );
  }
}
