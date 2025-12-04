import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EventDetail from "./pages/EventDetail";
import TicketSelection from "./pages/TicketSelection";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import MyTickets from "./pages/MyTickets";
import ParticipantProfile from "./pages/ParticipantProfile";
import OrganizerDashboard from "./pages/OrganizerDashboard";
import OrganizerProfile from "./pages/OrganizerProfile";
import CreateEvent from "./pages/CreateEvent";
import DraftEvents from "./pages/DraftEvents";
import EditEventPage from "./pages/EditEventPage";
import CheckInReportPage from "./pages/CheckInReportPage";
import SummaryPage from "./pages/SummaryPage";
import SeatMapPage from "./pages/SeatMapPage";
import MemberPage from "./pages/MemberPage";
import VoucherPage from "./pages/VoucherPage";
import EventSales from "./pages/EventSales";
import CheckIn from "./pages/CheckIn";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to scroll to top on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/event/:id" element={<EventDetail />} />

            {/* Protected Participant Routes */}
            <Route path="/event/:eventId/tickets/:sessionIndex" element={
              <ProtectedRoute>
                <TicketSelection />
              </ProtectedRoute>
            } />
            <Route path="/event/:eventId/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/confirmation" element={
              <ProtectedRoute>
                <Confirmation />
              </ProtectedRoute>
            } />
            <Route path="/my-tickets" element={
              <ProtectedRoute>
                <MyTickets />
              </ProtectedRoute>
            } />
            <Route path="/participant/profile" element={
              <ProtectedRoute>
                <ParticipantProfile />
              </ProtectedRoute>
            } />

            {/* Protected Organizer Routes - Require ROLE_ORGANIZER */}
            <Route path="/organizer" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organize" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <OrganizerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/organize/create" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <CreateEvent />
              </ProtectedRoute>
            } />
            <Route path="/organize/drafts" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <DraftEvents />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/edit" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <EditEventPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/checkin-report" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <CheckInReportPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/summary" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <SummaryPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/seat-map" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <SeatMapPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/member" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <MemberPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/voucher" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <VoucherPage />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/sales" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <EventSales />
              </ProtectedRoute>
            } />
            <Route path="/organize/event/:id/checkin" element={
              <ProtectedRoute requireRole="ROLE_ORGANIZER">
                <CheckIn />
              </ProtectedRoute>
            } />

            {/* Organizer Profile - Protected but doesn't require role (for becoming organizer) */}
            <Route path="/organizer/profile" element={
              <ProtectedRoute>
                <OrganizerProfile />
              </ProtectedRoute>
            } />

            {/* 404 - Keep this last */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
