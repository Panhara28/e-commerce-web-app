import { ArrowRight } from "lucide-react";

export default function ViewFeature() {
  return (
    <>
      <section className="max-w-[1800px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Digital Coupons */}
          <div className="bg-white rounded-lg p-6 border border-border hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Digital Coupons
                </h4>
                <p className="text-sm text-muted-foreground">
                  Save time & money, load before you go
                </p>
              </div>
              <div className="text-yellow-500 text-3xl">%</div>
            </div>
          </div>

          {/* Weekly Newsfeed */}
          <div className="bg-white rounded-lg p-6 border border-border hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Weekly Newsfeed
                </h4>
                <p className="text-sm text-muted-foreground">
                  Browse our weekly newsfeed and add items to your cart
                </p>
              </div>
              <div className="text-yellow-500 text-3xl">📅</div>
            </div>
          </div>

          {/* Digital Spotlight */}
          <div className="bg-white rounded-lg p-6 border border-border hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Digital Spotlight
                </h4>
                <p className="text-sm text-muted-foreground">
                  Find products easily & navigate store with the app
                </p>
              </div>
              <div className="text-yellow-500 text-3xl">⭐</div>
            </div>
          </div>

          {/* Online Promotion */}
          <div className="bg-white rounded-lg p-6 border border-border hover:shadow-lg transition">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground mb-2">
                  Online Promotion
                </h4>
                <p className="text-sm text-muted-foreground">
                  Select an online shopping store to see current offers.
                </p>
              </div>
              <ArrowRight className="w-5 h-5 text-yellow-500" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
