import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Instagram, 
  Twitter,
  Linkedin,
  Heart,
  Shield,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">Call-Doctor</h3>
                <p className="text-xs text-muted-foreground">Healthcare Platform</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Connecting patients with medical professionals through innovative technology 
              and compassionate care. Your health, our priority.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Facebook className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Instagram className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Linkedin className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Quick Links</h4>
            <div className="space-y-3">
              {[
                { label: "Find Doctors", href: "/search" },
                { label: "Join as Medical Pro", href: "/register-doctor" },
                { label: "Patient Registration", href: "/register-patient" },
                { label: "Ambulance Service", href: "/ambulance" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" }
              ].map((link) => (
                <Link 
                  key={link.href}
                  to={link.href} 
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Services</h4>
            <div className="space-y-3">
              {[
                { icon: Heart, label: "Cardiology" },
                { icon: Shield, label: "General Medicine" },
                { icon: Clock, label: "Emergency Care" }
              ].map((service, index) => (
                <div key={index} className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <service.icon className="h-4 w-4 text-primary" />
                  <span>{service.label}</span>
                </div>
              ))}
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  And 50+ other medical specialties
                </p>
              </div>
            </div>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground">Stay Connected</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>+234-800-CALLDOC</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@call-doctor.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Lagos, Nigeria</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Newsletter</p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Your email" 
                  className="text-sm"
                />
                <Button size="sm" className="bg-primary hover:bg-primary-dark">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2024 Call-Doctor. All rights reserved. Built with care for better healthcare.
          </div>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/hipaa" className="hover:text-primary transition-colors">HIPAA Compliance</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;