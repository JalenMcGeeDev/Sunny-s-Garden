import { CustomBuildConfig } from "@/types";

// ── Material costs (cents) ──────────────────────────────────
const CEDAR_PRICE_PER_FT = 320;        // $3.20/linear ft — sides & bottom
const LEG_PRICE_PER_FT = 128.5;        // $1.285/linear ft — leg lumber
const LEG_FT_PER_PLANTER = 12;         // 12 ft of leg lumber per planter (fixed)
const BOARD_WIDTH_INCHES = 5.5;        // dog-ear fence picket width

// ── Labor & overhead (cents) ────────────────────────────────
const LABOR_RATE_PER_HR = 2500;        // $25/hr
const BASE_BUILD_HOURS = 1;            // 1 hr base build time
const BUILD_HOURS_PER_SQFT = 0.05;     // +0.05 hr per sq ft of footprint

const OVERHEAD_CENTS = 800;            // $8 flat — fasteners, finish, sandpaper

// ── Margin ──────────────────────────────────────────────────
const MARGIN_PCT = 0.25;               // 25% profit margin

// ── Limits & defaults ───────────────────────────────────────
export const CUSTOM_BUILD_LIMITS = {
  width:  { min: 1, max: 8, step: 0.5 },
  length: { min: 1, max: 8, step: 0.5 },
  height: { min: 1, max: 3, step: 0.5 },
};

export const DEFAULT_CUSTOM_CONFIG: CustomBuildConfig = {
  width: 4,
  length: 2,
  height: 2,
  hasLegs: false,
  hasBottom: false,
  paintOption: "none",
};

// ── Breakdown types ─────────────────────────────────────────
export interface PriceBreakdown {
  sideRows: number;
  sideLinearFt: number;
  sidesCost: number;          // cents
  legsCost: number;           // cents
  bottomBoards: number;
  bottomLinearFt: number;
  bottomCost: number;         // cents
  totalMaterial: number;      // cents
  buildHours: number;
  laborCost: number;          // cents
  overhead: number;           // cents
  subtotal: number;           // cents (material + labor + overhead)
  marginPct: number;
  totalPrice: number;         // cents (final, rounded to nearest dollar)
}

// ── Core calculations ───────────────────────────────────────

export function getCustomPriceBreakdown(config: CustomBuildConfig): PriceBreakdown {
  const wIn = config.width * 12;
  const lIn = config.length * 12;
  const hIn = config.height * 12;

  // Sides: rows of boards needed, then total linear feet
  const sideRows = Math.ceil(hIn / BOARD_WIDTH_INCHES);
  const sideLinearFt = ((2 * wIn) + (2 * lIn)) * sideRows / 12;
  const sidesCost = Math.round(sideLinearFt * CEDAR_PRICE_PER_FT);

  // Legs (optional): fixed 12 ft of leg lumber
  const legsCost = config.hasLegs
    ? Math.round(LEG_FT_PER_PLANTER * LEG_PRICE_PER_FT)
    : 0;

  // Bottom (optional): boards running the length of the planter
  let bottomBoards = 0;
  let bottomLinearFt = 0;
  let bottomCost = 0;
  if (config.hasBottom) {
    bottomBoards = Math.ceil(wIn / BOARD_WIDTH_INCHES);
    bottomLinearFt = (bottomBoards * lIn) / 12;
    bottomCost = Math.round(bottomLinearFt * CEDAR_PRICE_PER_FT);
  }

  const totalMaterial = sidesCost + legsCost + bottomCost;

  // Labor: base hours + 0.5 hr per sq ft of footprint
  const buildHours = BASE_BUILD_HOURS + BUILD_HOURS_PER_SQFT * (config.width * config.length);
  const laborCost = Math.round(buildHours * LABOR_RATE_PER_HR);

  const overhead = OVERHEAD_CENTS;

  const subtotal = totalMaterial + laborCost + overhead;

  // Final price with margin: subtotal / (1 - margin), rounded to nearest dollar
  const rawPrice = subtotal / (1 - MARGIN_PCT);
  const totalPrice = Math.round(rawPrice / 100) * 100;

  return {
    sideRows,
    sideLinearFt,
    sidesCost,
    legsCost,
    bottomBoards,
    bottomLinearFt,
    bottomCost,
    totalMaterial,
    buildHours,
    laborCost,
    overhead,
    subtotal,
    marginPct: MARGIN_PCT,
    totalPrice,
  };
}

export function calculateCustomPrice(config: CustomBuildConfig): number {
  return getCustomPriceBreakdown(config).totalPrice;
}

export function getCustomBuildDescription(config: CustomBuildConfig): string {
  const colorLabels: Record<string, string> = {
    white: "White", black: "Black", green: "Hunter Green",
    gray: "Slate Gray", navy: "Navy Blue",
  };
  const paintLabels: Record<string, string> = {
    none: "Natural Cedar",
    solid: `Solid Color — ${colorLabels[config.paintColor || ""] || "TBD"}`,
    "sunnys-choice": "Sunny's Choice Art",
  };
  const parts = [
    `${config.width}ft × ${config.length}ft × ${config.height}ft`,
    config.hasLegs ? "With Legs" : "No Legs",
    config.hasBottom ? "With Bottom" : "No Bottom",
    paintLabels[config.paintOption] || "Natural Cedar",
  ];
  return `Custom Build — ${parts.join(", ")}`;
}
