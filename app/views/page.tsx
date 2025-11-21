import ViewFeature from "@/components/views/features";
import ViewHeader from "@/components/views/header";
import ViewHero from "@/components/views/hero";
import HomeProductListScreen from "@/screens/views/products/HomeProductListScreen";

export default function ViewPage() {
  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <ViewHeader />

        {/* Hero Banners */}
        <ViewHero />
        {/* Feature Cards */}
        <ViewFeature />

        <HomeProductListScreen />
      </div>
    </>
  );
}
