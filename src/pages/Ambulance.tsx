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
import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { startVapiCall } from "@/integrations/vapi";

const Ambulance = () => {
  const { toast } = useToast();
  const [vapiOpen, setVapiOpen] = useState(false);
  const [vapiNumber, setVapiNumber] = useState("+234");
  const [vapiLoading, setVapiLoading] = useState(false);
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
            <Button size="lg" variant="secondary" onClick={() => setVapiOpen(true)}>
              AI Call
            </Button>
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
            <NearestMap />
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
      {/* Vapi AI Call Dialog */}
      <Dialog open={vapiOpen} onOpenChange={setVapiOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Start AI Call</DialogTitle>
            <DialogDescription>
              Enter the recipient's phone number in E.164 format (e.g., +2348012345678).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label htmlFor="vapi-number">Phone number</Label>
              <Input id="vapi-number" value={vapiNumber} onChange={(e) => setVapiNumber(e.target.value)} placeholder="+2348012345678" />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={vapiLoading}
              onClick={async () => {
                if (!vapiNumber.startsWith("+") || vapiNumber.length < 8) {
                  toast({ title: "Invalid number", description: "Provide an E.164 number, e.g., +234..." });
                  return;
                }
                try {
                  setVapiLoading(true);
                  const res = await startVapiCall({ customerNumber: vapiNumber, metadata: { source: "AmbulancePage" } });
                  const callId = (res as any)?.data?.id;
                  toast({ title: "Call started", description: callId ? `Call ID: ${callId}` : "The AI assistant is placing your call." });
                  setVapiOpen(false);
                } catch (e: any) {
                  toast({ title: "Failed to start call", description: e.message || "Please try again." });
                } finally {
                  setVapiLoading(false);
                }
              }}
            >
              {vapiLoading ? "Starting..." : "Start AI Call"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default Ambulance;

// Inline component for map (OpenStreetMap embed + Geolocation)
const NearestMap = () => {
  const defaultCenter = { lat: 6.524379, lon: 3.379206 }; // Lagos
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      toast({ title: "Geolocation not supported", description: "We will show Lagos by default." });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => toast({ title: "Location blocked", description: "Showing a default area. You can allow location to refine." })
    );
  }, [toast]);

  const { lat, lon } = coords ?? defaultCenter;
  const bbox = useMemo(() => {
    const d = 0.03; // ~3km box
    const minLon = lon - d;
    const minLat = lat - d;
    const maxLon = lon + d;
    const maxLat = lat + d;
    return `${encodeURIComponent(minLon)},${encodeURIComponent(minLat)},${encodeURIComponent(maxLon)},${encodeURIComponent(maxLat)}`;
  }, [lat, lon]);

  const embedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;
  const openUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=14/${lat}/${lon}`;

  return (
    <Card>
      <CardContent className="p-0">
        <div className="relative">
          <iframe
            title="Nearest Ambulances"
            src={embedUrl}
            className="w-full h-80 rounded-md"
          />
          <div className="absolute left-2 bottom-2 flex gap-2">
            {!coords && (
              <Button size="sm" variant="outline" onClick={() => navigator.geolocation.getCurrentPosition(
                (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
                () => toast({ title: "Location blocked", description: "Please allow location to center the map." })
              )}>
                <MapPin className="h-4 w-4 mr-1" /> Use my location
              </Button>
            )}
            <a href={openUrl} target="_blank" rel="noreferrer">
              <Button size="sm" className="bg-primary">Open in OSM</Button>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
