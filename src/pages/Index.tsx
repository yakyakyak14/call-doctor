import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import NewsSlider from "@/components/NewsSlider";
import FeaturesSection from "@/components/FeaturesSection";
import AmbulanceService from "@/components/AmbulanceService";
import RegistrationPreview from "@/components/RegistrationPreview";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <div className="container mx-auto px-4 py-8">
          <NewsSlider />
        </div>
        <FeaturesSection />
        <RegistrationPreview />
        <AmbulanceService />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
