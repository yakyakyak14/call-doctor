import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Ambulance, 
  Zap, 
  Heart, 
  Shield, 
  Clock, 
  MapPin,
  Phone,
  Activity,
  Battery,
  Stethoscope
} from "lucide-react";

const ambulanceFeatures = [
  {
    icon: Zap,
    title: "Electric Fleet",
    description: "Eco-friendly electric ambulances with silent operation for patient comfort"
  },
  {
    icon: Heart,
    title: "Life Support Systems",
    description: "Advanced cardiac monitors, defibrillators, and ventilation equipment"
  },
  {
    icon: Shield,
    title: "World-Standard Equipment",
    description: "WHO-approved medical devices and emergency response equipment"
  },
  {
    icon: Activity,
    title: "Real-time Monitoring",
    description: "Patient vital monitoring with hospital connection during transport"
  },
  {
    icon: Stethoscope,
    title: "Medical Professionals",
    description: "Trained paramedics and emergency medical technicians on board"
  },
  {
    icon: Battery,
    title: "Backup Power",
    description: "Uninterrupted power supply for all critical medical equipment"
  }
];

const AmbulanceService = () => {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-emergency/10 text-emergency border-emergency/20">
            Emergency Services
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            High-Grade 
            <span className="text-emergency"> Ambulance Service</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our fleet of electric ambulances equipped with world-standard medical equipment 
            ensures rapid response and professional emergency care.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Service Info */}
          <div className="space-y-8">
            <Card className="border-l-4 border-l-emergency bg-emergency-light/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-emergency/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-emergency" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">24/7 Emergency Response</h3>
                    <p className="text-muted-foreground text-sm">
                      Round-the-clock availability with average response time of 8-12 minutes 
                      in urban areas and 15-20 minutes in suburban locations.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-primary bg-primary-light/5">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">GPS-Enabled Fleet Tracking</h3>
                    <p className="text-muted-foreground text-sm">
                      Real-time location tracking and route optimization ensures the nearest 
                      available ambulance reaches you in the shortest time possible.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-4">
              <Button size="lg" className="bg-emergency hover:bg-emergency/90 text-white flex-1">
                <Phone className="mr-2 h-5 w-5" />
                Call Emergency
              </Button>
              <Button size="lg" variant="outline" className="border-emergency text-emergency hover:bg-emergency hover:text-white flex-1">
                Book Ambulance
              </Button>
            </div>
          </div>

          {/* Equipment Features */}
          <div className="space-y-6">
            <div className="grid gap-4">
              {ambulanceFeatures.map((feature, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                        <feature.icon className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground text-sm">{feature.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Emergency Contacts */}
        <Card className="bg-gradient-to-r from-emergency/5 to-primary/5 border-emergency/20">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-center justify-center">
              <Ambulance className="h-6 w-6 text-emergency" />
              <span>Emergency Hotline: +234-800-EMERGENCY</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-muted-foreground text-sm">
              For life-threatening emergencies, call immediately. For non-emergency transport, 
              use our booking system to schedule ambulance services.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default AmbulanceService;