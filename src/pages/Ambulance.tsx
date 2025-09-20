import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AmbulanceService from "@/components/AmbulanceService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Ambulance as AmbulanceIcon, PhoneCall, Hospital, Clock, Shield, Zap } from "lucide-react";

const Ambulance = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4 bg-emergency/10 text-emergency border-emergency/20">
            Emergency Services
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            24/7 Ambulance Service
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rapid, reliable, and well-equipped ambulances with trained professionals. Your safety is our top priority.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a href="tel:+234800EMERGENCY">
              <Button size="lg" className="bg-emergency hover:bg-emergency/90">
                <PhoneCall className="h-5 w-5 mr-2" /> Call Emergency
              </Button>
            </a>
            <a href="https://wa.me/2348000000000" target="_blank" rel="noreferrer">
              <Button size="lg" variant="outline" className="border-emergency text-emergency hover:bg-emergency hover:text-white">
                WhatsApp Support
              </Button>
            </a>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-12">
          {/* Request Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AmbulanceIcon className="h-5 w-5 text-emergency" /> Request an Ambulance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="e.g., John Doe" aria-label="Full Name" />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" placeholder="e.g., +2348012345678" aria-label="Phone Number" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="address">Location / Address</Label>
                  <Input id="address" placeholder="e.g., 24 Adeola Odeku St, Victoria Island, Lagos" aria-label="Location Address" />
                </div>
                <div>
                  <Label>Emergency Type</Label>
                  <Select>
                    <SelectTrigger aria-label="Emergency Type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trauma">Trauma / Accident</SelectItem>
                      <SelectItem value="cardiac">Cardiac arrest</SelectItem>
                      <SelectItem value="stroke">Stroke symptoms</SelectItem>
                      <SelectItem value="obstetric">Obstetric emergency</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Hospital</Label>
                  <Input placeholder="e.g., Lagos University Teaching Hospital" aria-label="Preferred Hospital" />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea id="details" placeholder="Short description of the situation..." />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-primary">Submit Request</Button>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> Average Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">8–12 min</div>
                <p className="text-sm text-muted-foreground">Urban areas (15–20 min in suburban)</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" /> Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Lagos • Abuja • Kano • Port Harcourt • Ibadan • Enugu
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-primary" /> Fleet & Equipment
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Electric ambulances with defibrillators, ventilators, cardiac monitors, and oxygen support.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Map & Info Tabs */}
        <Tabs defaultValue="map" className="mb-12">
          <TabsList>
            <TabsTrigger value="map">Nearest Ambulances</TabsTrigger>
            <TabsTrigger value="info">Emergency Info</TabsTrigger>
          </TabsList>
          <TabsContent value="map">
            <Card>
              <CardContent className="p-6">
                <div className="h-72 w-full rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                  <MapPin className="h-5 w-5 mr-2" /> Map placeholder (nearest ambulances and hospitals)
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="info">
            <Card>
              <CardContent className="p-6 space-y-2 text-sm text-muted-foreground">
                <p>For life-threatening emergencies, call the emergency hotline immediately.</p>
                <p>Keep calm, provide clear details of your location, and follow the dispatcher instructions.</p>
                <p>Have a basic medical kit and important medical records accessible.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        {/* Feature section from component */}
        <AmbulanceService />
      </main>
      <Footer />
    </div>
  );
};

export default Ambulance;
