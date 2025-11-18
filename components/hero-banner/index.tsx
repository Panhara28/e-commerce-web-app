import { Button } from "../ui/button";

export default function HeroBanner() {
  return (
    <div className="p-4 md:p-6">
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 md:p-12 text-white overflow-hidden relative">
        {/* Decorative Circle */}
        <div className="absolute -right-20 -top-20 w-40 h-40 md:w-80 md:h-80 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10">
          <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs md:text-sm font-medium mb-4">
            Premium
          </span>
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-pretty">
            Welcome to Tsportcambodia Suite
          </h1>
          <p className="text-sm md:text-lg text-white/90 mb-8 max-w-2xl text-pretty">
            Unleash your creativity with our comprehensive suite of professional
            design tools and resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="bg-white text-purple-600 hover:bg-white/90 font-semibold">
              Explore Plans
            </Button>
            <Button
              variant="outline"
              className="border-white text-white hover:bg-white/10 bg-transparent"
            >
              Take a Tour
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
