import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Checkin from "./pages/Checkin";
import Menu from "./pages/Menu";
import CloudPage from "./pages/CloudPage";
import EvaluationPage from "./pages/EvaluationPage";
import Galeria from "./pages/Galeria";
import DashboardPage from "./pages/DashboardPage";
import CloudProjection from "./pages/CloudProjection";
import ProtectedRoute from "./components/ProtectedRoute";
import Sorteio from "./pages/Sorteio";
import Joias from "./pages/Joias";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/checkin" element={<Checkin />} />
          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <Menu />
              </ProtectedRoute>
            }
          />
          <Route
            path="/joias"
            element={
              <ProtectedRoute>
                <Joias />
              </ProtectedRoute>
            }
          />
          <Route
            path="/nuvem"
            element={
              <ProtectedRoute>
                <CloudPage />
              </ProtectedRoute>
            }
          />
          <Route path="/nuvem-telao" element={<CloudProjection />} />
          <Route
            path="/avaliacao"
            element={
              <ProtectedRoute>
                <EvaluationPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/galeria"
            element={
              <ProtectedRoute>
                <Galeria />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sorteio"
            element={
              <ProtectedRoute>
                <Sorteio />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<DashboardPage />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
