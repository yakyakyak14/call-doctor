import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Clock, Shield, Phone } from "lucide-react";
import heroImage from "@/assets/hero-nigerian-doctor.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[600px] bg-gradient-to-br from-primary-light via-background to-accent-light">
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                Connect with 
                <span className="text-primary"> Medical Experts</span> 
                <br />Near You
              </h1>
              <p className="text-lg text-muted-foreground max-w-lg">
                Find trusted doctors, specialists, and lab technicians. Book consultations, 
                get emergency care, and access world-class medical services instantly.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary-dark text-white px-8">
                <Search className="mr-2 h-5 w-5" />
                Find a Doctor
              </Button>
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white">
                Join as Medical Pro
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">500+</div>
                <div className="text-sm text-muted-foreground">Medical Experts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">50k+</div>
                <div className="text-sm text-muted-foreground">Patients Served</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">24/7</div>
                <div className="text-sm text-muted-foreground">Emergency Care</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image and Feature Cards */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src={heroImage} 
                alt="Nigerian medical professionals" 
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Floating Feature Cards */}
            <Card className="absolute -bottom-6 -left-6 p-4 bg-white shadow-lg border-l-4 border-l-accent">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <div className="font-semibold text-sm">75km Radius</div>
                  <div className="text-xs text-muted-foreground">Find nearby doctors</div>
                </div>
              </div>
            </Card>

            <Card className="absolute -top-6 -right-6 p-4 bg-white shadow-lg border-l-4 border-l-emergency">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emergency/20 rounded-lg flex items-center justify-center">
                  <Phone className="h-6 w-6 text-emergency" />
                </div>
                <div>
                  <div className="font-semibold text-sm">Emergency Ready</div>
                  <div className="text-xs text-muted-foreground">24/7 availability</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;