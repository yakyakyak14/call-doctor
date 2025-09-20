import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Stethoscope, 
  User, 
  MapPin, 
  Clock, 
  Phone, 
  AlertTriangle,
  DollarSign,
  Home,
  Video
} from "lucide-react";

const RegistrationPreview = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">Registration Forms</Badge>
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-6">
            Join Our 
            <span className="text-primary"> Healthcare Network</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Register as a medical professional or patient to start connecting with our community
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Doctor Registration Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <span className="text-foreground">Medical Professional</span>
                  <p className="text-sm text-muted-foreground font-normal">Join as a Doctor</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="doctor-name">Full Name *</Label>
                  <Input id="doctor-name" placeholder="Dr. John Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialty">Medical Specialty *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="pediatrics">Pediatrics</SelectItem>
                      <SelectItem value="general">General Medicine</SelectItem>
                      <SelectItem value="dermatology">Dermatology</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="license">Medical License *</Label>
                  <Input id="license" placeholder="License number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input id="experience" type="number" placeholder="10" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Practice Location *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state/city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos">Lagos State</SelectItem>
                    <SelectItem value="abuja">Abuja FCT</SelectItem>
                    <SelectItem value="kano">Kano State</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="consultation-fee">Consultation Fee (₦) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="consultation-fee" className="pl-10" placeholder="5000" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="+234 800 000 0000" />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Service Options *</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="phone-consult" />
                    <Label htmlFor="phone-consult" className="text-sm flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Consultations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="video-consult" />
                    <Label htmlFor="video-consult" className="text-sm flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      Video Consultations
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="home-visit" />
                    <Label htmlFor="home-visit" className="text-sm flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Home Visits
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="emergency" />
                    <Label htmlFor="emergency" className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-emergency" />
                      Emergency Calls
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="operating-hours">Operating Hours</Label>
                <Textarea 
                  id="operating-hours" 
                  placeholder="Mon-Fri: 9AM-5PM, Sat: 9AM-1PM" 
                  rows={2}
                />
              </div>

              <Button className="w-full bg-primary hover:bg-primary-dark">
                Register as Medical Professional
              </Button>
            </CardContent>
          </Card>

          {/* Patient Registration Form */}
          <Card className="shadow-lg">
            <CardHeader className="bg-accent/5">
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
                  <User className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <span className="text-foreground">Patient</span>
                  <p className="text-sm text-muted-foreground font-normal">I need a Doctor</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-name">Full Name *</Label>
                  <Input id="patient-name" placeholder="Jane Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input id="age" type="number" placeholder="30" />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="patient-phone">Phone Number *</Label>
                  <Input id="patient-phone" placeholder="+234 800 000 0000" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" placeholder="jane@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="patient-location">Location *</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lagos-island">Lagos Island</SelectItem>
                    <SelectItem value="lagos-mainland">Lagos Mainland</SelectItem>
                    <SelectItem value="abuja-central">Abuja Central</SelectItem>
                    <SelectItem value="abuja-suburbs">Abuja Suburbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency-contact">Emergency Contact</Label>
                <Input id="emergency-contact" placeholder="Emergency contact number" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medical-history">Medical History (Optional)</Label>
                <Textarea 
                  id="medical-history" 
                  placeholder="Brief medical history, allergies, current medications..." 
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Preferred Consultation Methods</Label>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-phone-consult" />
                    <Label htmlFor="patient-phone-consult" className="text-sm">Phone Calls</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-video-consult" />
                    <Label htmlFor="patient-video-consult" className="text-sm">Video Calls</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-home-visit" />
                    <Label htmlFor="patient-home-visit" className="text-sm">Home Visits</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="patient-clinic-visit" />
                    <Label htmlFor="patient-clinic-visit" className="text-sm">Clinic Visits</Label>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-accent hover:bg-accent/90">
                Register as Patient
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            By registering, you agree to our Terms of Service and Privacy Policy. 
            All medical professionals are verified before approval.
          </p>
        </div>
      </div>
    </section>
  );
};

export default RegistrationPreview;