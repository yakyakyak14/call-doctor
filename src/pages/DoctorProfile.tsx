import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import AuthModal from "@/components/AuthModal";
import { MapPin, Stethoscope, Star, Phone, Calendar, MessageSquare, Lock } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { payWithPaystack, type PaystackSuccessResponse } from "@/integrations/payments/paystack";

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

const DoctorProfile = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const fallbackDoctor: Doctor | null = (location.state as any)?.doctor ?? null;

  const { data: row, isLoading } = useQuery({
    queryKey: ["doctor", id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("doctor_profiles")
        .select(
          `id, consultation_fee, is_available, phone_consultation, years_of_experience, hospital_clinic_name, languages,
           profiles:profiles(first_name,last_name,profile_picture_url),
           medical_specialties:medical_specialties(name),
           locations:locations(city)`
        )
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const doctor: Doctor | null = useMemo(() => {
    if (row) {
      const first = row.profiles?.first_name ?? "Doctor";
      const last = row.profiles?.last_name ?? "";
      const img = row.profiles?.profile_picture_url ?? "";
      const specialty = row.medical_specialties?.name ?? "General Medicine";
      const city = row.locations?.city ?? "Lagos";
      return {
        id: row.id,
        name: `${first} ${last}`.trim(),
        specialty,
        location: city,
        rating: 4.7,
        years: row.years_of_experience ?? 5,
        fee: row.consultation_fee ?? 10000,
        available: Boolean(row.is_available),
        telemedicine: Boolean(row.phone_consultation),
        languages: Array.isArray(row.languages) ? row.languages : ["English"],
        image: img,
        hospital: row.hospital_clinic_name ?? "",
      } as Doctor;
    }
    return fallbackDoctor;
  }, [row, fallbackDoctor]);

  // Booking state
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingWhen, setBookingWhen] = useState("");
  const [bookingMethod, setBookingMethod] = useState("in-person");
  const [bookingNote, setBookingNote] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [pendingConsultationId, setPendingConsultationId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const [payLoading, setPayLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUserId(user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evt, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const { data: access } = useQuery({
    queryKey: ["contactAccess", doctor?.id, userId],
    enabled: !!doctor?.id && !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("consultations")
        .select("id,payment_status")
        .eq("patient_id", userId!)
        .eq("doctor_id", doctor!.id)
        .in("payment_status", ["paid", "succeeded", "completed"]) // allow any 'paid-like' status
        .limit(1);
      if (error) throw error;
      return { canAccess: (data ?? []).length > 0 };
    },
    staleTime: 60_000,
  });
  const canSeeContact = access?.canAccess ?? false;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">← Back</Button>

        {isLoading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                <Skeleton className="w-32 h-32 rounded-lg" />
                <div className="flex-1 space-y-3">
                  <Skeleton className="h-6 w-1/2" />
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : !doctor ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-muted-foreground">Doctor profile not found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{doctor.name}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={doctor.available ? "default" : "secondary"} className={doctor.available ? "bg-green-600" : undefined}>
                      {doctor.available ? "Available" : "Offline"}
                    </Badge>
                    {doctor.telemedicine && <Badge variant="outline">Telemedicine</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6">
                  {/* Image */}
                  <div className="w-32 h-32 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {doctor.image ? (
                      <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-muted-foreground">No image</div>
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Stethoscope className="h-4 w-4" />
                      <span>{doctor.specialty}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{doctor.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(doctor.rating) ? "fill-amber-400" : ""}`} />
                      ))}
                      <span className="text-xs text-muted-foreground ml-1">{doctor.rating.toFixed(1)} / 5</span>
                    </div>
                    <div className={`text-sm text-muted-foreground ${!canSeeContact ? "blur-sm select-none" : ""}`}>
                      {doctor.hospital || "Hospital / Clinic"}
                    </div>
                    {!canSeeContact && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Lock className="h-3 w-3" /> Book and pay to unlock contact
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-muted-foreground">Consultation fee</div>
                    <div className="font-semibold">₦{doctor.fee.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="font-semibold">{doctor.years}+ years</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Languages</div>
                    <div className="font-semibold">{doctor.languages.join(", ")}</div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button onClick={() => setBookingOpen(true)} className="bg-primary">
                    <Calendar className="h-4 w-4 mr-2" /> Book Appointment
                  </Button>
                  {canSeeContact ? (
                    <a href={`tel:+234800CALLDOC`}>
                      <Button variant="outline"><Phone className="h-4 w-4 mr-2" /> Call</Button>
                    </a>
                  ) : (
                    <Button variant="outline" onClick={() => setBookingOpen(true)}>
                      <Lock className="h-4 w-4 mr-2" /> Book & pay to unlock
                    </Button>
                  )}
                  <Button variant="ghost"><MessageSquare className="h-4 w-4 mr-2" /> Message</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {doctor.name} is a dedicated {doctor.specialty.toLowerCase()} specialist with {doctor.years}+ years of experience.
                  Passionate about patient‑centric care and evidence‑based medicine.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Booking Dialog */}
        <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Book Appointment</DialogTitle>
              <DialogDescription>
                {doctor ? `With ${doctor.name} • ${doctor.specialty}` : "Select a doctor to proceed"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="when">Date & time</Label>
                <Input id="when" type="datetime-local" value={bookingWhen} onChange={(e) => setBookingWhen(e.target.value)} />
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
                  if (!doctor || !bookingWhen) {
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
                    const { data: inserted, error } = await supabase
                      .from("consultations")
                      .insert({
                        consultation_fee: doctor.fee,
                        consultation_type: bookingMethod,
                        doctor_id: doctor.id,
                        scheduled_date: new Date(bookingWhen).toISOString(),
                        patient_id: user.id,
                        notes: bookingNote || null,
                        payment_status: "pending",
                        status: "requested",
                      })
                      .select("id")
                      .single();
                    if (error) throw error;
                    setPendingConsultationId(inserted.id);
                    toast({
                      title: "Appointment requested",
                      description: `Your request with ${doctor.name} on ${new Date(bookingWhen).toLocaleString()} has been received.`,
                    });
                    setBookingOpen(false);
                    setBookingWhen("");
                    setBookingMethod("in-person");
                    setBookingNote("");
                    setPaymentOpen(true);
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

        {/* Payment Dialog (Paystack) */}
        <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Complete Payment</DialogTitle>
              <DialogDescription>
                You will be redirected to Paystack's secure checkout. After a successful payment, contact will be unlocked.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Amount: ₦{doctor?.fee ? doctor.fee.toLocaleString() : "-"}</p>
              <p>Provider: Paystack</p>
            </div>
            <DialogFooter>
              <Button
                disabled={payLoading || !pendingConsultationId}
                className="bg-primary"
                onClick={async () => {
                  if (!doctor || !pendingConsultationId) return;
                  const { data: userData } = await supabase.auth.getUser();
                  const user = userData?.user;
                  if (!user?.email) {
                    setAuthOpen(true);
                    toast({ title: "Sign in required", description: "Please sign in with an email to proceed to payment." });
                    return;
                  }
                  const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;
                  if (!publicKey) {
                    toast({ title: "Payment unavailable", description: "Paystack public key not configured." });
                    return;
                  }
                  try {
                    setPayLoading(true);
                    const reference = `CD-${pendingConsultationId}-${Date.now()}`;
                    await payWithPaystack({
                      publicKey,
                      email: user.email,
                      amountKobo: Math.round(Number(doctor.fee || 0) * 100),
                      reference,
                      metadata: { consultationId: pendingConsultationId, doctorId: doctor.id },
                      onSuccess: async (resp: PaystackSuccessResponse) => {
                        try {
                          const { data, error } = await supabase.functions.invoke("verify-paystack", {
                            body: { consultationId: pendingConsultationId, reference: resp.reference },
                          });
                          if (error) throw new Error(error.message);
                          if (!(data as any)?.success) throw new Error("Payment verification failed");
                          toast({ title: "Payment successful", description: "Contact has been unlocked." });
                          setPaymentOpen(false);
                          setPendingConsultationId(null);
                          await queryClient.invalidateQueries({ queryKey: ["contactAccess", doctor.id, userId] });
                        } catch (e: any) {
                          toast({ title: "Verification failed", description: e.message || "Please contact support." });
                        }
                      },
                      onClose: () => {
                        // do nothing on close
                      },
                    });
                  } catch (e: any) {
                    toast({ title: "Payment failed to start", description: e.message || "Try again later." });
                  } finally {
                    setPayLoading(false);
                  }
                }}
              >
                {payLoading ? "Processing…" : "Pay with Paystack"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
};

export default DoctorProfile;
