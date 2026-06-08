import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { V_DashboardView } from "./views/V_DashboardView";
import { V_HomestayDetailView } from "./views/V_HomestayDetailView";
import { V_RegistrationView } from "./views/V_RegistrationView";
import { V_LoginView } from "./views/V_LoginView";
import { V_BookingView } from "./views/V_BookingView";
import { V_MyBookingsView } from "./views/V_MyBookingsView";
import { V_HomestayManagementView } from "./views/V_HomestayManagementView";
import { V_HomestayFormView } from "./views/V_HomestayFormView";
import { V_AdminVerificationView } from "./views/V_AdminVerificationView";
import { Toaster } from "./components/ui/sonner";

// Protected Route wrapper
function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "user" | "owner" | "admin";
}) {
  const { isAuthenticated, hasRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<V_DashboardView />} />
          <Route
            path="/homestay/:id"
            element={<V_HomestayDetailView />}
          />
          <Route path="/login" element={<V_LoginView />} />
          <Route
            path="/register"
            element={<V_RegistrationView />}
          />

          {/* User Routes */}
          <Route
            path="/book/:id"
            element={
              <ProtectedRoute requiredRole="user">
                <V_BookingView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute requiredRole="user">
                <V_MyBookingsView />
              </ProtectedRoute>
            }
          />

          {/* Owner Routes */}
          <Route
            path="/my-homestays"
            element={
              <ProtectedRoute requiredRole="owner">
                <V_HomestayManagementView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homestay/new"
            element={
              <ProtectedRoute requiredRole="owner">
                <V_HomestayFormView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/homestay/edit/:id"
            element={
              <ProtectedRoute requiredRole="owner">
                <V_HomestayFormView />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="admin">
                <V_AdminVerificationView />
              </ProtectedRoute>
            }
          />

          {/* Catch all */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}