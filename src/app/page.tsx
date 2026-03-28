import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-[#3d6b4a] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Cedar planter box with established plants in a garden"
            fill
            className="object-cover opacity-60"
            priority
          />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Grow Something
              <br />
              <span className="text-amber-300">Beautiful</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/90 mt-4 max-w-lg">
              Handcrafted cedar planter boxes, built to last and made to order.
              Design your perfect planter — for gardeners who care about craft.
            </p>
            <Link
              href="/custom"
              className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-stone-900 font-semibold rounded-full transition-colors text-lg"
            >
              Build Your Own
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
            Your Planter, Your Way
          </h2>
          <p className="text-stone-500 mt-3 text-lg">
            Every planter is custom built to your exact specifications.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">1. Design</h3>
            <p className="text-stone-500">Choose your dimensions, legs, and bottom panel with our interactive builder.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.384 3.18 1.028-5.995L2.236 7.6l6.017-.874L11.42 1.5l3.166 5.226 6.017.874-4.828 4.755 1.028 5.995z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">2. We Build</h3>
            <p className="text-stone-500">Your planter is handcrafted from premium western red cedar in our workshop.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-amber-700" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-stone-900 mb-2">3. Delivered</h3>
            <p className="text-stone-500">Ships to your door in 2–3 weeks, ready to fill with your favorite plants.</p>
          </div>
        </div>
        <div className="text-center mt-12">
          <Link
            href="/custom"
            className="inline-flex items-center gap-2 px-8 py-4 bg-amber-700 hover:bg-amber-800 text-white font-semibold rounded-full transition-colors text-lg"
          >
            Start Building
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Brand Story Excerpt */}
      <section className="bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-stone-900">
              Built by Hand, Made to Last
            </h2>
            <p className="text-lg text-stone-600 mt-6 leading-relaxed">
              Every planter in the Sunny Collection is handcrafted from western
              red cedar using traditional frame-and-panel joinery. No shortcuts,
              no composite materials — just quality wood and careful
              craftsmanship, built to weather the seasons.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 mt-8 text-amber-700 hover:text-amber-800 font-semibold transition-colors"
            >
              Our Story
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
