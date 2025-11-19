import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import HomeProductListScreen from "@/screens/views/products/HomeProductListScreen";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingCart,
  User,
} from "lucide-react";

export default function ViewPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b border-border">
          <div className="max-w-[1800px] mx-auto px-4 py-4 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2 font-bold text-xl">
              {/* <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center">
                <span className="text-white">✓</span>
              </div> */}
              <span>Tsportcambodia</span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl relative">
              <div className="relative">
                <Input
                  placeholder="What are you looking..."
                  className="w-full pl-4 pr-12 py-2 bg-muted text-sm"
                />
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-6">
              {/* Cart */}
              <div className="relative cursor-pointer">
                <ShoppingCart className="w-6 h-6" />
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-xs rounded-full flex items-center justify-center">
                  0
                </span>
              </div>

              {/* Sign In */}
              <div className="flex items-center gap-2 cursor-pointer">
                <User className="w-5 h-5" />
                <span className="text-sm">Sign In</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border-t border-border">
            <div className="max-w-[1800px] mx-auto px-4 py-3 flex items-center gap-8">
              <nav className="flex items-center gap-6 text-sm flex-1">
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  Home 
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  Categories <ChevronDown className="w-4 h-4" />
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  Products <ChevronDown className="w-4 h-4" />
                </button>
                <button className="hover:text-emerald-600 transition">
                  Search
                </button>
                <button className="hover:text-emerald-600 transition">
                  Shops
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  About Us
                </button>
                <button className="flex items-center gap-1 hover:text-emerald-600 transition">
                  Contact Us
                </button>
              </nav>

              {/* Delivery Address */}
              <div className="flex items-center gap-2 ml-auto text-sm">
                <span className="text-muted-foreground">Delivery:</span>
                <button className="flex items-center gap-1 text-emerald-600 font-medium hover:text-emerald-700 transition">
                  Address <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Banners */}
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
                  Don't miss this opportunity at a special discount just for
                  this week.
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

        {/* Feature Cards */}
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

        <HomeProductListScreen />
      </div>
    </>
  );
}
