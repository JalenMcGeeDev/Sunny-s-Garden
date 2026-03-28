"use client";

import { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import { CustomBuildConfig, PaintOption, SOLID_COLORS } from "@/types";
import {
  getCustomBuildDescription,
  CUSTOM_BUILD_LIMITS,
  DEFAULT_CUSTOM_CONFIG,
} from "@/lib/custom-pricing";

/* ── Lazy-load the 3D preview so import failures don't crash the page ── */
const PlanterPreview = dynamic(() => import("./PlanterPreview"), {
  ssr: false,
  loading: () => (
    <div className="w-full aspect-[4/3] rounded-2xl bg-stone-100 flex items-center justify-center">
      <p className="text-stone-400">Loading 3D preview…</p>
    </div>
  ),
});

/* ── On-screen debug log (independent of Three.js) ── */
const mobileLog: string[] = [];
function mLog(msg: string) {
  const ts = new Date().toLocaleTimeString();
  mobileLog.push(`[${ts}] ${msg}`);
  if (mobileLog.length > 30) mobileLog.shift();
}

function MobileDebugOverlay() {
  const [visible, setVisible] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 800);
    return () => clearInterval(id);
  }, []);
  return (
    <>
      <button
        onClick={() => setVisible((v) => !v)}
        className="fixed bottom-4 right-4 z-[9999] bg-black/70 text-white text-xs px-3 py-2 rounded-full shadow-lg"
      >
        {visible ? "Hide Log" : "\uD83D\uDC1B Debug"}
      </button>
      {visible && (
        <div className="fixed inset-x-2 bottom-14 z-[9999] bg-black/90 text-green-400 text-[11px] p-3 rounded-xl max-h-64 overflow-y-auto font-mono shadow-2xl">
          {mobileLog.length === 0 && <p className="text-stone-400">No logs yet.</p>}
          {mobileLog.map((line, i) => <p key={i}>{line}</p>)}
        </div>
      )}
    </>
  );
}

/* ── Wrapper to catch 3D preview crashes ── */
function SafePreview({ config }: { config: CustomBuildConfig }) {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mLog(`UA: ${navigator.userAgent}`);
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2") || c.getContext("webgl");
    if (gl) {
      const dbg = (gl as WebGLRenderingContext).getExtension("WEBGL_debug_renderer_info");
      const renderer = dbg ? (gl as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL) : "(no debug ext)";
      mLog(`WebGL OK \u2014 ${renderer}`);
    } else {
      mLog("WebGL NOT available!");
      setError("WebGL is not supported on this device/browser.");
    }
    mLog(`Screen: ${screen.width}x${screen.height} DPR: ${devicePixelRatio}`);
  }, []);

  if (error) {
    return (
      <div className="w-full aspect-[4/3] rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-stone-700 font-semibold mb-1">3D preview unavailable</p>
          <p className="text-red-500 text-xs font-mono">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorCatcher>
      <PlanterPreview config={config} />
    </ErrorCatcher>
  );
}

/* ── Simple class error boundary ── */
import React, { Component } from "react";
class ErrorCatcher extends Component<
  { children: React.ReactNode },
  { err: string | null }
> {
  state = { err: null as string | null };
  static getDerivedStateFromError(e: Error) {
    return { err: e?.message || "Unknown render error" };
  }
  componentDidCatch(e: Error) {
    mLog(`CRASH: ${e.message}`);
  }
  render() {
    if (this.state.err) {
      return (
        <div className="w-full aspect-[4/3] rounded-2xl bg-stone-100 border border-red-200 flex items-center justify-center">
          <div className="text-center p-6">
            <p className="text-stone-700 font-semibold mb-1">3D preview crashed</p>
            <p className="text-red-500 text-xs font-mono break-all">{this.state.err}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function PlanterConfigurator() {
  const [config, setConfig] = useState<CustomBuildConfig>(DEFAULT_CUSTOM_CONFIG);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const description = getCustomBuildDescription(config);

  const updateConfig = (partial: Partial<CustomBuildConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/request-quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, notes, config }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        return;
      }
      setSubmitted(true);
    } catch {
      setError("Failed to send request. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const sliderClass =
    "w-full h-2 bg-stone-200 rounded-full appearance-none cursor-pointer " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 " +
    "[&::-webkit-slider-thumb]:bg-amber-600 [&::-webkit-slider-thumb]:rounded-full " +
    "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:bg-amber-600 " +
    "[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 " +
    "[&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:cursor-pointer";

  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-stone-300 focus:border-amber-600 " +
    "focus:ring-1 focus:ring-amber-600 outline-none text-stone-800 placeholder-stone-400";

  return (
    <div className="max-w-6xl mx-auto">
      <MobileDebugOverlay />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Preview */}
        <div className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            <SafePreview config={config} />
            <p className="text-center text-sm text-stone-500 mt-3">
              Interactive preview — updates as you customize
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="order-2 lg:order-1 space-y-8">
          <div>
            <h2 className="text-3xl font-bold text-stone-900 mb-2">
              Custom Build
            </h2>
            <p className="text-stone-600">
              Design your perfect cedar planter. Adjust dimensions and features
              to match your space.
            </p>
          </div>

          {/* Width Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                Width
              </label>
              <span className="text-lg font-bold text-amber-700">
                {config.width} ft
              </span>
            </div>
            <input
              type="range"
              min={CUSTOM_BUILD_LIMITS.width.min}
              max={CUSTOM_BUILD_LIMITS.width.max}
              step={CUSTOM_BUILD_LIMITS.width.step}
              value={config.width}
              onChange={(e) => updateConfig({ width: parseFloat(e.target.value) })}
              className={sliderClass}
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>{CUSTOM_BUILD_LIMITS.width.min} ft</span>
              <span>{CUSTOM_BUILD_LIMITS.width.max} ft</span>
            </div>
          </div>

          {/* Length Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                Length
              </label>
              <span className="text-lg font-bold text-amber-700">
                {config.length} ft
              </span>
            </div>
            <input
              type="range"
              min={CUSTOM_BUILD_LIMITS.length.min}
              max={CUSTOM_BUILD_LIMITS.length.max}
              step={CUSTOM_BUILD_LIMITS.length.step}
              value={config.length}
              onChange={(e) => updateConfig({ length: parseFloat(e.target.value) })}
              className={sliderClass}
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>{CUSTOM_BUILD_LIMITS.length.min} ft</span>
              <span>{CUSTOM_BUILD_LIMITS.length.max} ft</span>
            </div>
          </div>

          {/* Height Slider */}
          <div>
            <div className="flex justify-between items-baseline mb-2">
              <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
                Height
              </label>
              <span className="text-lg font-bold text-amber-700">
                {config.height} ft
              </span>
            </div>
            <input
              type="range"
              min={CUSTOM_BUILD_LIMITS.height.min}
              max={CUSTOM_BUILD_LIMITS.height.max}
              step={CUSTOM_BUILD_LIMITS.height.step}
              value={config.height}
              onChange={(e) => updateConfig({ height: parseFloat(e.target.value) })}
              className={sliderClass}
            />
            <div className="flex justify-between text-xs text-stone-400 mt-1">
              <span>{CUSTOM_BUILD_LIMITS.height.min} ft</span>
              <span>{CUSTOM_BUILD_LIMITS.height.max} ft</span>
            </div>
          </div>

          {/* Toggle Options */}
          <div className="grid grid-cols-2 gap-4">
            {/* Legs Toggle */}
            <button
              type="button"
              onClick={() => updateConfig(config.hasLegs ? { hasLegs: false } : { hasLegs: true, hasBottom: true })}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                config.hasLegs
                  ? "border-amber-600 bg-amber-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    config.hasLegs
                      ? "border-amber-600 bg-amber-600"
                      : "border-stone-300"
                  }`}
                >
                  {config.hasLegs && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-stone-800">Legs</span>
              </div>
              <p className="text-xs text-stone-500 ml-8">
                Adds cedar legs for elevation
              </p>
            </button>

            {/* Bottom Toggle */}
            <button
              type="button"
              onClick={() => updateConfig(config.hasBottom ? { hasBottom: false, hasLegs: false } : { hasBottom: true })}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                config.hasBottom
                  ? "border-amber-600 bg-amber-50 shadow-sm"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    config.hasBottom
                      ? "border-amber-600 bg-amber-600"
                      : "border-stone-300"
                  }`}
                >
                  {config.hasBottom && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <span className="font-semibold text-stone-800">Bottom</span>
              </div>
              <p className="text-xs text-stone-500 ml-8">
                Solid cedar bottom panel
              </p>
            </button>
          </div>

          {/* Paint / Finish Options */}
          <div>
            <label className="text-sm font-semibold text-stone-700 uppercase tracking-wide block mb-3">
              Paint &amp; Finish
            </label>
            <div className="space-y-3">
              {([
                { value: "none" as PaintOption, label: "Natural Cedar", desc: "Unfinished natural wood grain" },
                { value: "solid" as PaintOption, label: "Solid Color", desc: "Painted a single color of your choice" },
                { value: "sunnys-choice" as PaintOption, label: "Sunny\u2019s Choice", desc: "One-of-a-kind hand-painted artwork" },
              ]).map((opt) => (
                <div key={opt.value}>
                  <button
                    type="button"
                    onClick={() => updateConfig({ paintOption: opt.value, ...(opt.value !== "solid" ? { paintColor: undefined } : {}) })}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${
                      config.paintOption === opt.value
                        ? "border-amber-600 bg-amber-50 shadow-sm"
                        : "border-stone-200 bg-white hover:border-stone-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          config.paintOption === opt.value
                            ? "border-amber-600 bg-amber-600"
                            : "border-stone-300"
                        }`}
                      >
                        {config.paintOption === opt.value && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="font-semibold text-stone-800">{opt.label}</span>
                    </div>
                    <p className="text-xs text-stone-500 ml-8">{opt.desc}</p>
                  </button>

                  {/* Color swatches directly under Solid Color */}
                  {opt.value === "solid" && config.paintOption === "solid" && (
                    <div className="flex flex-wrap items-center gap-3 pl-8 pt-3">
                      {SOLID_COLORS.map((c) => (
                        <button
                          key={c.value}
                          type="button"
                          onClick={() => updateConfig({ paintColor: c.value })}
                          className={`flex flex-col items-center gap-1 group`}
                          title={c.label}
                        >
                          <div
                            className={`w-10 h-10 rounded-full border-2 transition-all ${
                              config.paintColor === c.value
                                ? "border-amber-600 ring-2 ring-amber-300 scale-110"
                                : "border-stone-300 hover:border-stone-400"
                            }`}
                            style={{ backgroundColor: c.hex }}
                          />
                          <span className={`text-xs ${
                            config.paintColor === c.value ? "text-amber-700 font-semibold" : "text-stone-500"
                          }`}>{c.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quote Request */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-200">
            {submitted ? (
              <div className="text-center py-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stone-900 mb-2">Quote Request Sent!</h3>
                <p className="text-stone-600">
                  Check your email &mdash; we&apos;ll follow up within 1 hour during business hours, or by the next business morning.
                </p>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-stone-900 mb-1">
                  Get Your Custom Quote
                </h3>
                <p className="text-sm text-stone-500 mb-5">
                  Tell us about your project and we&apos;ll send you a personalized quote.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(optional)"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold text-stone-700 block mb-1">
                      Notes
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requests or questions?"
                      rows={3}
                      className={inputClass}
                    />
                  </div>

                  <p className="text-sm text-stone-500">{description}</p>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber-700 text-white py-4 rounded-xl font-bold text-lg
                      hover:bg-amber-800 active:bg-amber-900 transition-colors shadow-lg
                      shadow-amber-700/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Sending..." : "Request Quote"}
                  </button>
                </form>
              </>
            )}
          </div>

          <p className="text-xs text-stone-400 text-center">
            Handcrafted to order. Ships in 2–3 weeks.
          </p>
        </div>
      </div>
    </div>
  );
}
