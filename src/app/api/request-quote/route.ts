import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { CustomBuildConfig, PaintOption, SolidColor } from "@/types";
import {
  getCustomPriceBreakdown,
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

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, notes } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (
      !email ||
      typeof email !== "string" ||
      !email.includes("@") ||
      !email.includes(".")
    ) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const validPaintOptions: PaintOption[] = ["none", "solid", "sunnys-choice"];
    const paintOption: PaintOption = validPaintOptions.includes(body.config?.paintOption)
      ? body.config.paintOption
      : "none";

    const config: CustomBuildConfig = {
      width: parseFloat(body.config?.width),
      length: parseFloat(body.config?.length),
      height: parseFloat(body.config?.height),
      hasLegs: body.config?.hasLegs === true,
      hasBottom: body.config?.hasBottom === true,
      paintOption,
      paintColor: paintOption === "solid" ? ((["white","black","green","gray","navy"] as SolidColor[]).includes(body.config?.paintColor) ? body.config.paintColor : undefined) : undefined,
    };

    if (isNaN(config.width) || isNaN(config.length) || isNaN(config.height)) {
      return NextResponse.json(
        { error: "Invalid planter dimensions" },
        { status: 400 }
      );
    }

    const validationError = validateCustomConfig(config);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const breakdown = getCustomPriceBreakdown(config);
    const description = getCustomBuildDescription(config);

    // ── Build owner email (includes full cost breakdown) ──
    let ownerBody = `New Quote Request from ${name.trim()}\n\n`;
    ownerBody += `Customer Details:\n`;
    ownerBody += `  Name: ${name.trim()}\n`;
    ownerBody += `  Email: ${email.trim()}\n`;
    ownerBody += `  Phone: ${phone?.trim() || "Not provided"}\n\n`;
    ownerBody += `Planter Configuration:\n`;
    ownerBody += `  Dimensions: ${config.width}ft × ${config.length}ft × ${config.height}ft\n`;
    ownerBody += `  Legs: ${config.hasLegs ? "Yes" : "No"}\n`;
    ownerBody += `  Bottom: ${config.hasBottom ? "Yes" : "No"}\n`;
    const colorNames: Record<string, string> = { white: "White", black: "Black", green: "Hunter Green", gray: "Slate Gray", navy: "Navy Blue" };
    ownerBody += `  Paint: ${config.paintOption === "none" ? "Natural Cedar" : config.paintOption === "solid" ? `Solid Color — ${colorNames[config.paintColor || ""] || "TBD"}` : "Sunny's Choice Art"}\n\n`;
    ownerBody += `Cost Breakdown:\n`;
    ownerBody += `  Cedar sides: ${breakdown.sideRows} rows, ${breakdown.sideLinearFt.toFixed(1)} lin ft — ${formatCents(breakdown.sidesCost)}\n`;
    if (config.hasLegs) {
      ownerBody += `  Legs: 12 lin ft — ${formatCents(breakdown.legsCost)}\n`;
    }
    if (config.hasBottom) {
      ownerBody += `  Cedar bottom: ${breakdown.bottomBoards} boards, ${breakdown.bottomLinearFt.toFixed(1)} lin ft — ${formatCents(breakdown.bottomCost)}\n`;
    }
    ownerBody += `  Materials subtotal: ${formatCents(breakdown.totalMaterial)}\n`;
    ownerBody += `  Labor: ${breakdown.buildHours.toFixed(1)} hrs — ${formatCents(breakdown.laborCost)}\n`;
    ownerBody += `  Overhead: ${formatCents(breakdown.overhead)}\n`;
    ownerBody += `  Cost subtotal: ${formatCents(breakdown.subtotal)}\n`;
    ownerBody += `  Margin (${(breakdown.marginPct * 100).toFixed(0)}%): ${formatCents(breakdown.totalPrice - breakdown.subtotal)}\n`;
    ownerBody += `  SUGGESTED PRICE: ${formatCents(breakdown.totalPrice)}\n\n`;
    ownerBody += `Customer Notes:\n`;
    ownerBody += `  ${notes?.trim() || "None"}\n\n`;

    // ── Send-quote instruction for the owner ──
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    ownerBody += `─── SEND QUOTE TO CUSTOMER ───\n\n`;
    ownerBody += `To send a payment link, run this curl command (adjust priceCents if needed):\n\n`;
    ownerBody += `curl -X POST ${siteUrl}/api/quotes/create \\\n`;
    ownerBody += `  -H "Content-Type: application/json" \\\n`;
    ownerBody += `  -H "Authorization: Bearer YOUR_ADMIN_SECRET" \\\n`;
    ownerBody += `  -d '${JSON.stringify({
      customerName: name.trim(),
      customerEmail: email.trim(),
      priceCents: breakdown.totalPrice,
      notes: notes?.trim() || "",
      config: {
        width: config.width,
        length: config.length,
        height: config.height,
        hasLegs: config.hasLegs,
        hasBottom: config.hasBottom,
        paintOption: config.paintOption,
        paintColor: config.paintColor || undefined,
      },
    })}'\n`;

    // ── Build customer email (friendly, no pricing) ──
    let customerBody = `Hi ${name.trim()},\n\n`;
    customerBody += `Thanks for designing your custom cedar planter with us! We've received your request and here's what you built:\n\n`;
    customerBody += `  • Dimensions: ${config.width}ft × ${config.length}ft × ${config.height}ft\n`;
    customerBody += `  • Legs: ${config.hasLegs ? "Yes" : "No"}\n`;
    customerBody += `  • Bottom: ${config.hasBottom ? "Yes" : "No"}\n`;
    customerBody += `  • Paint: ${config.paintOption === "none" ? "Natural Cedar" : config.paintOption === "solid" ? `Solid Color — ${colorNames[config.paintColor || ""] || "TBD"}` : "Sunny's Choice Art"}\n\n`;
    customerBody += `We'll review your design and send you a personalized quote within 1 hour during business hours, or by the next business morning.\n\n`;
    customerBody += `If you have any questions in the meantime, just reply to this email.\n\n`;
    customerBody += `— The Sunny's Garden Team\n`;

    // ── Send via Resend ──
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM || "Sunny's Garden <onboarding@resend.dev>";
    const recipientEmail = process.env.CONTACT_EMAIL || process.env.QUOTE_RECIPIENT_EMAIL;

    if (resendApiKey) {
      const resend = new Resend(resendApiKey);

      // Send owner notification
      if (recipientEmail) {
        await resend.emails.send({
          from: fromAddress,
          to: recipientEmail,
          subject: `New Quote Request: ${description}`,
          text: ownerBody,
        });
      }

      // Send customer confirmation
      await resend.emails.send({
        from: fromAddress,
        to: email.trim(),
        subject: "We received your custom planter quote request!",
        text: customerBody,
      });
    } else {
      console.log("RESEND_API_KEY not configured — logging quote to console:");
      console.log("--- OWNER EMAIL ---");
      console.log(ownerBody);
      console.log("--- CUSTOMER EMAIL ---");
      console.log(customerBody);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Quote request error:", error);
    return NextResponse.json(
      { error: "Failed to process quote request. Please try again." },
      { status: 500 }
    );
  }
}
