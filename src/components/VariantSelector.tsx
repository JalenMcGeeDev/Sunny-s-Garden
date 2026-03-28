"use client";

import { VariantType } from "@/types";

interface VariantSelectorProps {
  selected: VariantType;
  onChange: (variant: VariantType) => void;
}

export default function VariantSelector({ selected, onChange }: VariantSelectorProps) {
  return (
    <div className="inline-flex rounded-full bg-stone-100 p-1">
      <button
        onClick={() => onChange("no-legs")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === "no-legs"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        No Legs
      </button>
      <button
        onClick={() => onChange("with-legs")}
        className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
          selected === "with-legs"
            ? "bg-white text-stone-900 shadow-sm"
            : "text-stone-500 hover:text-stone-700"
        }`}
      >
        With Legs
      </button>
    </div>
  );
}
