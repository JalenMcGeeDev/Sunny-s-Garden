import type { Metadata } from "next";
import Image from "next/image";
import { getAboutContent } from "@/lib/data";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Sunny's Garden — handcrafted cedar planter boxes built with western red cedar using traditional frame-and-panel joinery.",
};

export default async function AboutPage() {
  const content = await getAboutContent();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      <div className="max-w-4xl mx-auto">
        {/* Headline */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-8 sm:mb-12">
          {content.headline}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Body Content */}
          <div className="lg:col-span-3">
            <div
              className="prose prose-stone prose-lg max-w-none
                [&_p]:text-stone-700 [&_p]:leading-relaxed [&_p]:mb-5
                [&_strong]:text-stone-900
                [&_ul]:text-stone-700 [&_ol]:text-stone-700"
              dangerouslySetInnerHTML={{ __html: content.body }}
            />
          </div>

          {/* Photos */}
          <div className="lg:col-span-2 space-y-4">
            {content.primaryPhotoUrl && (
              <div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-stone-100">
                <Image
                  src={content.primaryPhotoUrl}
                  alt="Sunny's Garden workshop"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            )}
            {content.secondaryPhotoUrl && (
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden bg-stone-100">
                <Image
                  src={content.secondaryPhotoUrl}
                  alt="Cedar wood detail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 400px"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
