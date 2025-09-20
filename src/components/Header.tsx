import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthModal from "./AuthModal";
import type { User } from "@supabase/supabase-js";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose, DrawerTrigger } from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";

const Header = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50 backdrop-blur-lg bg-background/95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">C</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Call-Doctor</h1>
              <p className="text-xs text-muted-foreground">Healthcare Platform</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/search" className="text-foreground hover:text-primary transition-colors">
              Find Doctors
            </Link>
            <Link to="/ambulance" className="text-foreground hover:text-primary transition-colors">
              Ambulance Service
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Link to="/ambulance?call=1" className="hidden md:block">
              <Button className="bg-emergency hover:bg-emergency/90 text-white">
                Emergency
              </Button>
            </Link>
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Search className="h-5 w-5" />
            </Button>
            
            {user && (
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Bell className="h-5 w-5" />
              </Button>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  onClick={handleSignOut}
                  className="hidden md:flex gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="hidden md:flex"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Sign In
                </Button>
                <Button 
                  className="bg-primary hover:bg-primary-dark"
                  onClick={() => setIsAuthModalOpen(true)}
                >
                  Join Now
                </Button>
              </>
            )}
            
            {/* Mobile menu drawer */}
            <Drawer>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>Menu</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 space-y-4">
                  <nav className="grid gap-3">
                    <DrawerClose asChild>
                      <Link to="/ambulance?call=1" className="text-white bg-emergency hover:bg-emergency/90 px-3 py-2 rounded-md text-center">
                        Emergency
                      </Link>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Link to="/search" className="text-foreground hover:text-primary transition-colors">Find Doctors</Link>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Link to="/ambulance" className="text-foreground hover:text-primary transition-colors">Ambulance Service</Link>
                    </DrawerClose>
                    <DrawerClose asChild>
                      <Link to="/about" className="text-foreground hover:text-primary transition-colors">About</Link>
                    </DrawerClose>
                  </nav>
                  <Separator />
                  <div className="grid sm:grid-cols-2 gap-2">
                    {user ? (
                      <Button 
                        variant="outline" 
                        onClick={handleSignOut}
                        className="gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </Button>
                    ) : (
                      <>
                        <DrawerClose asChild>
                          <Button 
                            variant="outline"
                            onClick={() => setIsAuthModalOpen(true)}
                          >
                            Sign In
                          </Button>
                        </DrawerClose>
                        <DrawerClose asChild>
                          <Button 
                            className="bg-primary hover:bg-primary-dark"
                            onClick={() => setIsAuthModalOpen(true)}
                          >
                            Join Now
                          </Button>
                        </DrawerClose>
                      </>
                    )}
                  </div>
                </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Header;