import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import type { ComponentType } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Search from "./pages/Search";
import Ambulance from "./pages/Ambulance";
import About from "./pages/About";
import DoctorProfile from "./pages/DoctorProfile";
import AdminEmergency from "./pages/AdminEmergency";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      {(() => {
        const isGhPages = typeof window !== "undefined" && window.location.hostname.endsWith("github.io");
        const raw = import.meta.env.BASE_URL || "/";
        const trimmed = raw.replace(/\/+$/, "");
        const base = trimmed || "/";
        const RouterAny: ComponentType<any> = isGhPages ? (HashRouter as any) : (BrowserRouter as any);
        const routerProps = isGhPages ? {} : { basename: base };
        return (
          <RouterAny {...routerProps}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/search" element={<Search />} />
              <Route path="/ambulance" element={<Ambulance />} />
              <Route path="/about" element={<About />} />
              <Route path="/doctor/:id" element={<DoctorProfile />} />
              <Route path="/admin/emergency" element={<AdminEmergency />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouterAny>
        );
      })()}
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
