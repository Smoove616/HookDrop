import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { AudioProvider } from "@/contexts/AudioContext";
import { AppProvider } from "@/contexts/AppContext";
import { CartProvider } from "@/contexts/CartContext";

import { isSetupComplete } from "@/lib/setupConfig";
import SetupWizard from "@/components/SetupWizard";
import { MiniPlayer } from "@/components/MiniPlayer";

import Index from "./pages/Index";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";
import Admin from "./pages/Admin";
import VerifyLicense from "./pages/VerifyLicense";
import Discover from "./pages/Discover";
import Notifications from "./pages/Notifications";
import NotFound from "./pages/NotFound";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refunds from "./pages/Refunds";
import PurchaseSuccess from "./pages/PurchaseSuccess";



import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => {
  const [setupDone, setSetupDone] = useState(isSetupComplete());

  if (!setupDone) {
    return (
      <ThemeProvider defaultTheme="dark">
        <SetupWizard onComplete={() => setSetupDone(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AudioProvider>
                <AppProvider>
                  <CartProvider>

                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/profile/:username" element={<PublicProfile />} />
                    <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                    <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                    <Route path="/verify" element={<VerifyLicense />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/refunds" element={<Refunds />} />
                    <Route path="/success" element={<ProtectedRoute><PurchaseSuccess /></ProtectedRoute>} />

                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  <MiniPlayer />
                  </CartProvider>
                </AppProvider>
              </AudioProvider>
            </AuthProvider>

          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};


export default App;

