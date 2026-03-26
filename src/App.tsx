import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SensorLogs from "./pages/SensorLogs";
import AlertsPage from "./pages/AlertsPage";
import RobotsPage from "./pages/RobotsPage";
import MaintenancePage from "./pages/MaintenancePage";
import InspectionsPage from "./pages/InspectionsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import AuditPage from "./pages/AuditPage";
import SchedulesPage from "./pages/SchedulesPage";
import InventoryPage from "./pages/InventoryPage";
import SlaPage from "./pages/SlaPage";
import IncidentsPage from "./pages/IncidentsPage";
import AnomaliesPage from "./pages/AnomaliesPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/sensors" element={<ProtectedRoute><SensorLogs /></ProtectedRoute>} />
            <Route path="/alerts" element={<ProtectedRoute><AlertsPage /></ProtectedRoute>} />
            <Route path="/robots" element={<ProtectedRoute><RobotsPage /></ProtectedRoute>} />
            <Route path="/maintenance" element={<ProtectedRoute><MaintenancePage /></ProtectedRoute>} />
            <Route path="/inspections" element={<ProtectedRoute><InspectionsPage /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditPage /></ProtectedRoute>} />
            <Route path="/schedules" element={<ProtectedRoute><SchedulesPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/sla" element={<ProtectedRoute><SlaPage /></ProtectedRoute>} />
            <Route path="/incidents" element={<ProtectedRoute><IncidentsPage /></ProtectedRoute>} />
            <Route path="/anomalies" element={<ProtectedRoute><AnomaliesPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
