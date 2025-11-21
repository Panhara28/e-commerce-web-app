import { Button } from "@/components/ui/button";

export default function ViewHero() {
  return (
    <>
      <section className="max-w-[1800px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Banner - Breakfast */}
          <div className="relative rounded-lg overflow-hidden h-96 flex items-end">
            <img
              src="/first-banner.png"
              alt="Breakfast items"
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient Shadow From Bottom to Middle */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/60 to-transparent" />

            <div className="relative z-10 p-8">
              <p className="text-xs font-semibold text-white tracking-wide">
                BREAKFAST ITEMS
              </p>
              <h2 className="text-3xl font-bold mt-2 mb-4 text-balance text-white">
                Try Fresh Healthy Breakfast on Morning
              </h2>
              <p className="text-sm text-white/80 mb-6 max-w-xs">
                Don't miss this opportunity at a special discount just for this
                week.
              </p>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
                Explore More
              </Button>
            </div>
          </div>

          {/* Right Banner - Pizza Deal */}
          <div className="relative rounded-lg overflow-hidden h-96 bg-gray-900 flex items-center justify-center">
            <img
              src="/second-banner.png"
              alt="Pizza deal"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>
        </div>
      </section>
    </>
  );
}
