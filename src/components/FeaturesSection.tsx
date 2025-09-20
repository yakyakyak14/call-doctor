import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Stethoscope, 
  MapPin, 
  CreditCard, 
  Phone, 
  Ambulance, 
  FileText,
  Shield,
  Clock,
  Users,
  Heart,
  Zap,
  CheckCircle,
  Star
} from "lucide-react";
import doctorFemale1 from "@/assets/doctor-young-female-1.jpg";
import doctorMale1 from "@/assets/doctor-young-male-1.jpg";
import doctorsTeam from "@/assets/doctors-team-african.jpg";

const features = [
  {
    icon: Stethoscope,
    title: "Expert Medical Professionals",
    description: "Connect with verified doctors, specialists, and lab technicians across all medical fields",
    category: "Quality Care"
  },
  {
    icon: MapPin,
    title: "Location-Based Search",
    description: "Find medical professionals within 75km radius with precise location matching",
    category: "Convenience"
  },
  {
    icon: CreditCard,
    title: "Secure Payment Integration",
    description: "Safe and secure payments through Paystack with instant profile access after payment",
    category: "Security"
  },
  {
    icon: Phone,
    title: "Multiple Consultation Options",
    description: "Choose from phone consultations, home visits, or clinic appointments based on your needs",
    category: "Flexibility"
  },
  {
    icon: Ambulance,
    title: "Emergency Ambulance Service",
    description: "High-grade medical ambulances with electric fleet and world-standard equipment",
    category: "Emergency"
  },
  {
    icon: FileText,
    title: "Medical History Tracking",
    description: "Complete consultation history and medical records accessible to both patients and doctors",
    category: "Records"
  },
  {
    icon: Shield,
    title: "Privacy Protection",
    description: "Contact details revealed only after consultation payment for security and privacy",
    category: "Security"
  },
  {
    icon: Clock,
    title: "24/7 Emergency Support",
    description: "Round-the-clock emergency services and AI-powered call assistance",
    category: "Emergency"
  }
];

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Platform Features</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Everything You Need for 
            <span className="text-primary"> Quality Healthcare</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our comprehensive platform connects patients with medical professionals through 
            innovative technology and user-friendly features.
          </p>
        </div>

        {/* Featured Doctor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="relative overflow-hidden border-l-4 border-l-primary">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
                  <img src={doctorFemale1} alt="Dr. Kemi Adebayo - Cardiologist" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dr. Kemi Adebayo</h3>
                  <p className="text-muted-foreground">Cardiologist • Lagos</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm text-muted-foreground">4.9 (127 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="relative overflow-hidden border-l-4 border-l-accent">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-accent/20">
                  <img src={doctorMale1} alt="Dr. Chidi Okwu - Pediatrician" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Dr. Chidi Okwu</h3>
                  <p className="text-muted-foreground">Pediatrician • Abuja</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-accent text-accent" />
                    <span className="text-sm text-muted-foreground">4.8 (89 reviews)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Image */}
        <Card className="relative overflow-hidden mb-8">
          <div className="relative">
            <img src={doctorsTeam} alt="Our medical team" className="w-full h-64 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold">Meet Our Expert Team</h3>
              <p className="text-white/80">500+ verified medical professionals across Nigeria</p>
            </div>
          </div>
        </Card>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <Badge variant="outline" className="text-xs mb-2">
                      {feature.category}
                    </Badge>
                    <h3 className="font-semibold text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 pt-16 border-t border-border">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="flex items-center justify-center space-x-3">
              <CheckCircle className="h-6 w-6 text-success" />
              <span className="text-sm text-muted-foreground">Verified Professionals</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">HIPAA Compliant</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Heart className="h-6 w-6 text-emergency" />
              <span className="text-sm text-muted-foreground">Patient-Centered Care</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <Zap className="h-6 w-6 text-accent" />
              <span className="text-sm text-muted-foreground">Instant Connect</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;