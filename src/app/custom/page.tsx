import { Metadata } from "next";
import PlanterConfigurator from "@/components/PlanterConfigurator";

export const metadata: Metadata = {
  title: "Custom Build | Sunny's Garden",
  description:
    "Design your own cedar planter box. Choose dimensions, legs, and bottom panel — see it come to life in real time.",
};

export default function CustomBuildPage() {
  return (
    <main className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-stone-900 mb-3">
          Build Your Own
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Every garden is different. Design a planter that fits yours — pick the
          size and features, and we&apos;ll handcraft it from premium cedar.
        </p>
      </div>
      <PlanterConfigurator />
    </main>
  );
}
