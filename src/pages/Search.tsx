import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { MapPin, Stethoscope, Star, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "@/components/AuthModal";
import { Link } from "react-router-dom";
import { startVapiCall } from "@/integrations/vapi";

import docFemale1 from "@/assets/doctor-female-nigerian.jpg";
import docMale1 from "@/assets/doctor-male-nigerian.jpg";
import docSpecFemale from "@/assets/doctor-specialist-female.jpg";
import docYoungFemale1 from "@/assets/doctor-young-female-1.jpg";
import docYoungMale1 from "@/assets/doctor-young-male-1.jpg";

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  rating: number; // 0 - 5
  years: number;
  fee: number; // NGN
  available: boolean;
  telemedicine: boolean;
  languages: string[];
  image: string;
  hospital: string;
}

const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Adaobi Okafor",
    specialty: "Cardiology",
    location: "Lagos",
    rating: 4.9,
    years: 12,
    fee: 15000,
    available: true,
    telemedicine: true,
    languages: ["English", "Igbo"],
    image: docFemale1,
    hospital: "Lagos Heart Institute",
  },
  {
    id: "d2",
    name: "Dr. Tunde Alabi",
    specialty: "General Medicine",
    location: "Abuja",
    rating: 4.7,
    years: 9,
    fee: 8000,
    available: true,
    telemedicine: true,
    languages: ["English", "Yoruba"],
    image: docMale1,
    hospital: "Abuja Central Hospital",
  },
  {
    id: "d3",
    name: "Dr. Kemi Balogun",
    specialty: "Dermatology",
    location: "Lagos",
    rating: 4.6,
    years: 7,
    fee: 12000,
    available: false,
    telemedicine: true,
    languages: ["English"],
    image: docSpecFemale,
    hospital: "SkinCare Clinic, Lagos",
  },
  {
    id: "d4",
    name: "Dr. Ibrahim Musa",
    specialty: "Pediatrics",
    location: "Kano",
    rating: 4.8,
    years: 11,
    fee: 10000,
    available: true,
    telemedicine: false,
    languages: ["English", "Hausa"],
    image: docYoungMale1,
    hospital: "Kano Children Hospital",
  },
  {
    id: "d5",
    name: "Dr. Zainab Bello",
    specialty: "Gynecology",
    location: "Port Harcourt",
    rating: 4.5,
    years: 10,
    fee: 14000,
    available: false,
    telemedicine: true,
    languages: ["English"],
    image: docYoungFemale1,
    hospital: "River State Women Care",
  },
];

const SPECIALTIES = [
  "All",
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Orthopedics",
  "Psychiatry",
];

const LOCATIONS = ["All", "Lagos", "Abuja", "Kano", "Port Harcourt"];

const Search = () => {
  const [query, setQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [location, setLocation] = useState("All");
  const [minRating, setMinRating] = useState("0");
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [telemedicine, setTelemedicine] = useState(false);
  const [sort, setSort] = useState("best");
  const [openProfile, setOpenProfile] = useState<Doctor | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingWhen, setBookingWhen] = useState("");
  const [bookingMethod, setBookingMethod] = useState("in-person");
  const [bookingNote, setBookingNote] = useState("");
  const { toast } = useToast();
  const [authOpen, setAuthOpen] = useState(false);
  const [vapiOpen, setVapiOpen] = useState(false);
  const [vapiNumber, setVapiNumber] = useState("+234");
  const [vapiLoading, setVapiLoading] = useState(false);
  const [vapiDoctor, setVapiDoctor] = useState<Doctor | null>(null);

  // Load doctors from Supabase (optional). Fallback to local mock data.
  const { data: doctorRows, isLoading, isError, refetch } = useQuery({
    queryKey: ["doctors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select(
          `id, consultation_fee, is_available, phone_consultation, years_of_experience, hospital_clinic_name, languages, address,
           profiles:profiles(first_name,last_name,profile_picture_url),
           medical_specialties:medical_specialties(name),
           locations:locations(city)`
        )
        .limit(50);
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const sourceDoctors: Doctor[] = useMemo(() => {
    if (!doctorRows || doctorRows.length === 0) return DOCTORS;
    return doctorRows.map((row: any) => {
      const first = row.profiles?.first_name ?? "Doctor";
      const last = row.profiles?.last_name ?? "";
      const img = row.profiles?.profile_picture_url ?? docFemale1;
      const specialty = row.medical_specialties?.name ?? "General Medicine";
      const city = row.locations?.city ?? "Lagos";
      return {
        id: row.id,
        name: `${first} ${last}`.trim(),
        specialty,
        location: city,
        rating: 4.6, // Placeholder; consider computing from reviews
        years: row.years_of_experience ?? 5,
        fee: row.consultation_fee ?? 10000,
        available: Boolean(row.is_available),
        telemedicine: Boolean(row.phone_consultation),
        languages: Array.isArray(row.languages) ? row.languages : ["English"],
        image: img,
        hospital: row.hospital_clinic_name ?? "",
      } as Doctor;
    });
  }, [doctorRows]);

  const filtered = useMemo(() => {
    let list = [...sourceDoctors];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialty.toLowerCase().includes(q) ||
          d.hospital.toLowerCase().includes(q)
      );
    }

    if (specialty !== "All") list = list.filter((d) => d.specialty === specialty);
    if (location !== "All") list = list.filter((d) => d.location === location);
    if (onlyAvailable) list = list.filter((d) => d.available);
    if (telemedicine) list = list.filter((d) => d.telemedicine);

    const min = Number(minRating) || 0;
    list = list.filter((d) => d.rating >= min);

    switch (sort) {
      case "rating":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "experience":
        list.sort((a, b) => b.years - a.years);
        break;
      case "fee_low":
        list.sort((a, b) => a.fee - b.fee);
        break;
      default:
        // best: combine rating and experience
        list.sort((a, b) => b.rating + b.years / 10 - (a.rating + a.years / 10));
    }

    return list;
  }, [query, specialty, location, minRating, onlyAvailable, telemedicine, sort, sourceDoctors]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Find Doctors</h1>
          </div>
          <p className="text-muted-foreground">Search and filter top-rated medical professionals across Nigeria.</p>
        </div>

        {/* Filters Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid md:grid-cols-6 gap-3">
              <div className="md:col-span-2">
                <Label htmlFor="query" className="sr-only">Search</Label>
                <Input
                  id="query"
                  placeholder="Search by name, specialty, or hospital"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>

              <div>
                <Label className="sr-only">Specialty</Label>
                <Select value={specialty} onValueChange={setSpecialty}>
                  <SelectTrigger aria-label="Specialty">
                    <SelectValue placeholder="Specialty" />
                  </SelectTrigger>
                  <SelectContent>
                    {SPECIALTIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="sr-only">Location</Label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger aria-label="Location">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATIONS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="sr-only">Min Rating</Label>
                <Select value={minRating} onValueChange={setMinRating}>
                  <SelectTrigger aria-label="Minimum rating">
                    <SelectValue placeholder="Min rating" />
                  </SelectTrigger>
                  <SelectContent>
                    {["0", "3", "3.5", "4", "4.5"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}+ ★
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="sr-only">Sort</Label>
                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger aria-label="Sort">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best">Best match</SelectItem>
                    <SelectItem value="rating">Top rated</SelectItem>
                    <SelectItem value="experience">Most experienced</SelectItem>
                    <SelectItem value="fee_low">Lowest fee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox id="available" checked={onlyAvailable} onCheckedChange={(v) => setOnlyAvailable(Boolean(v))} />
                  <Label htmlFor="available">Available now</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="telemedicine" checked={telemedicine} onCheckedChange={(v) => setTelemedicine(Boolean(v))} />
                  <Label htmlFor="telemedicine">Telemedicine</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filtered.length}</span> doctor{filtered.length !== 1 ? "s" : ""}
          </p>
          <Button variant="outline" className="gap-2" onClick={() => {
            setQuery("");
            setSpecialty("All");
            setLocation("All");
            setMinRating("0");
            setOnlyAvailable(false);
            setTelemedicine(false);
            setSort("best");
          }}>
            <Filter className="h-4 w-4" />
            Reset filters
          </Button>
        </div>

        {/* Loading / Error / Results */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <Skeleton className="w-24 h-24 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/3" />
                      <Skeleton className="h-3 w-2/3" />
                      <Skeleton className="h-8 w-full" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-foreground">Unable to load doctors</h3>
                  <p className="text-sm text-muted-foreground">Showing sample results. You can retry loading real data.</p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>Retry</Button>
              </div>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No doctors match your filters. Try broadening your search.
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((d) => (
              <Card key={d.id} className="group overflow-hidden hover:shadow-md transition-all">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    <img src={d.image} alt={`${d.name} - ${d.specialty}`} className="w-24 h-24 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{d.name}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Stethoscope className="h-4 w-4" />
                            <span>{d.specialty}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-4 w-4 ${i < Math.round(d.rating) ? "fill-amber-400" : ""}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">{d.rating.toFixed(1)} / 5</span>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant={d.available ? "default" : "secondary"} className={d.available ? "bg-green-600" : undefined}>
                          {d.available ? "Available" : "Offline"}
                        </Badge>
                        {d.telemedicine && <Badge variant="outline">Telemedicine</Badge>}
                        <Badge variant="outline" className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {d.location}
                        </Badge>
                        <Badge variant="outline">{d.years} yrs exp</Badge>
                      </div>

                      <Separator className="my-3" />

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-muted-foreground">Consultation fee</div>
                          <div className="font-semibold text-foreground">₦{d.fee.toLocaleString()}</div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setOpenProfile(d)}>
                            View Profile
                          </Button>
                          <a href={`tel:+234800CALLDOC`}>
                            <Button size="sm" className="bg-primary">Call</Button>
                          </a>
                          <Button size="sm" variant="secondary" onClick={() => { setVapiDoctor(d); setVapiOpen(true); }}>
                            AI Call
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Sheet open={!!openProfile} onOpenChange={(o) => !o && setOpenProfile(null)}>
          <SheetContent side="right" className="w-full sm:max-w-lg">
            {openProfile && (
              <>
                <SheetHeader>
                  <SheetTitle>{openProfile.name}</SheetTitle>
                  <SheetDescription>{openProfile.specialty} • {openProfile.hospital}</SheetDescription>
                </SheetHeader>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <img src={openProfile.image} alt={openProfile.name} className="w-28 h-28 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline"><MapPin className="h-3 w-3 mr-1" />{openProfile.location}</Badge>
                        <Badge variant="outline">{openProfile.years}+ yrs</Badge>
                        <Badge variant="outline">₦{openProfile.fee.toLocaleString()}</Badge>
                      </div>
                      <div className="mt-2 text-sm text-muted-foreground">
                        Languages: {openProfile.languages.join(", ")}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-foreground mb-2">About</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {openProfile.name} is a seasoned {openProfile.specialty.toLowerCase()} specialist with {openProfile.years}+ years of experience.
                      Passionate about patient care, preventive medicine, and modern treatment protocols.
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <Button
                      className="bg-primary"
                      onClick={() => {
                        setBookingDoctor(openProfile);
                        setBookingOpen(true);
                      }}
                    >
                      Book Appointment
                    </Button>
                    <a href={`tel:+234800CALLDOC`}>
                      <Button variant="outline">Call now</Button>
                    </a>
                    <Link to={`/doctor/${openProfile.id}`} state={{ doctor: openProfile }}>
                      <Button variant="ghost">Full profile</Button>
                    </Link>
                    <Button variant="secondary" onClick={() => { setVapiDoctor(openProfile); setVapiOpen(true); }}>
                      AI Call
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>

        {/* Booking Dialog */}
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>
                {bookingDoctor ? `With ${bookingDoctor.name} • ${bookingDoctor.specialty}` : "Select a doctor to proceed"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="when">Date & time</Label>
                <Input
                  id="when"
                  type="datetime-local"
                  value={bookingWhen}
                  onChange={(e) => setBookingWhen(e.target.value)}
                />
              </div>
              <div>
                <Label>Consultation method</Label>
                <Select value={bookingMethod} onValueChange={setBookingMethod}>
                  <SelectTrigger aria-label="Consultation method">
                    <SelectValue placeholder="Choose method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in-person">In-person</SelectItem>
                    <SelectItem value="telemedicine">Telemedicine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="note">Notes (optional)</Label>
                <Textarea id="note" placeholder="Symptoms, preferences, or additional info" value={bookingNote} onChange={(e) => setBookingNote(e.target.value)} />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={async () => {
                  if (!bookingDoctor || !bookingWhen) {
                    toast({ title: "Missing details", description: "Please select a date/time to continue." });
                    return;
                  }
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;
                  if (!user) {
                    setAuthOpen(true);
                    toast({ title: "Please sign in", description: "Sign in to complete your booking." });
                    return;
                  }
                  try {
                    const isReal = !!doctorRows?.find((r: any) => r.id === bookingDoctor.id);
                    if (isReal) {
                      const { error } = await supabase.from("consultations").insert({
                        consultation_fee: bookingDoctor.fee,
                        consultation_type: bookingMethod,
                        doctor_id: bookingDoctor.id,
                        scheduled_date: new Date(bookingWhen).toISOString(),
                        patient_id: user.id,
                        notes: bookingNote || null,
                        payment_status: "pending",
                        status: "requested",
                      });
                      if (error) throw error;
                    }
                    toast({
                      title: "Appointment requested",
                      description: `Your request with ${bookingDoctor.name} on ${new Date(bookingWhen).toLocaleString()} has been received.`,
                    });
                    setBookingOpen(false);
                    setBookingWhen("");
                    setBookingMethod("in-person");
                    setBookingNote("");
                  } catch (e: any) {
                    toast({ title: "Booking failed", description: e.message || "Please try again later." });
                  }
                }}
                className="bg-primary"
              >
                Confirm booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

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
                    const res = await startVapiCall({ customerNumber: vapiNumber, metadata: { doctorId: vapiDoctor?.id, source: "SearchPage" } });
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
      </main>
      <Footer />
    </div>
  );
};

export default Search;
