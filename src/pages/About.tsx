import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Shield, Stethoscope, Users, Heart, Clock, MapPin, Hospital, Phone, Lock } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-10">
        {/* Hero */}
        <section className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">About Call‑Doctor</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Healthcare, reimagined for everyone</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We connect patients to trusted medical professionals across Nigeria through reliable technology,
            compassionate care, and seamless experiences — from finding the right doctor to emergency response.
          </p>
        </section>

        {/* Stats */}
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[ 
            { label: "Patients served", value: "25k+" },
            { label: "Doctors onboard", value: "1.2k+" },
            { label: "Specialties", value: "50+" },
            { label: "Cities covered", value: "30+" },
          ].map((s) => (
            <Card key={s.label}>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-foreground">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Mission & Values */}
        <section className="grid lg:grid-cols-3 gap-6 mb-12">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Heart className="h-5 w-5 text-primary"/>Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p>
                To make quality healthcare accessible, efficient, and patient‑centric by empowering medical
                professionals with modern tools and connecting them to the people who need them most.
              </p>
              <p>
                From on‑demand consultations to emergency ambulance services, we deliver trusted care experiences
                built on security, reliability, and empathy.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary"/>Our Values</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Patient First</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Privacy & Security</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Clinical Excellence</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Reliability at Scale</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary"/>Accessibility</div>
            </CardContent>
          </Card>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Why patients and doctors choose us</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Stethoscope, title: "Trusted network", desc: "Verified doctors across 50+ specialties with transparent reviews." },
              { icon: Users, title: "Patient‑first UX", desc: "Simple flows for search, booking, reminders, and follow‑ups." },
              { icon: Lock, title: "Secure by design", desc: "Best‑practice data handling and access controls." },
              { icon: Clock, title: "On‑time care", desc: "Optimized scheduling and reminders reduce no‑shows and wait times." },
              { icon: Hospital, title: "Integrated care", desc: "Clinical notes and referrals streamlined between providers." },
              { icon: MapPin, title: "Nationwide reach", desc: "From Lagos to Kano — access care wherever you are." },
            ].map((f) => (
              <Card key={f.title} className="group hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="w-10 h-10 bg-accent/20 rounded-md flex items-center justify-center mb-4 group-hover:bg-accent/30">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-4">Frequently asked questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="q1">
              <AccordionTrigger>How do I book an appointment?</AccordionTrigger>
              <AccordionContent>
                Search for a doctor by specialty or location, open their profile, and click “Book Appointment.”
                You’ll receive confirmations and reminders.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q2">
              <AccordionTrigger>Are my medical details secure?</AccordionTrigger>
              <AccordionContent>
                Yes. We implement strong encryption, access controls, and audit trails. We continuously review
                our security posture to protect your privacy.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="q3">
              <AccordionTrigger>Do you support telemedicine?</AccordionTrigger>
              <AccordionContent>
                Many doctors on our platform offer telemedicine for follow‑ups and non‑emergency consultations.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </section>

        <Separator className="my-8" />

        {/* Contact CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Partner with Call‑Doctor</h2>
          <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
            Hospitals and clinics can integrate with our platform for referrals, scheduling, and telemedicine.
            Let’s improve healthcare outcomes together.
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="mailto:support@call-doctor.com">
              <Button className="bg-primary">Contact us</Button>
            </a>
            <a href="tel:+234800CALLDOC">
              <Button variant="outline"><Phone className="h-4 w-4 mr-2"/>Call</Button>
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
