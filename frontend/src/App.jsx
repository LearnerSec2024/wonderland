import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import RidesPage from "./pages/RidesPage";
import RideDetailsPage from "./pages/RideDetailsPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import AccommodationDetailsPage from "./pages/AccommodationDetailsPage";
import BasketPage from "./pages/BasketPage";
import CheckoutPage from "./pages/CheckoutPage";
import BookingConfirmationPage from "./pages/BookingConfirmationPage";
import BookingHistoryPage from "./pages/BookingHistoryPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminContentPage from "./pages/AdminContentPage";
import AdminBookingsPage from "./pages/AdminBookingsPage";
import AdminReportsPage from "./pages/AdminReportsPage";
import AdminAuditLogsPage from "./pages/AdminAuditLogsPage";
import ManagerApprovalsPage from "./pages/ManagerApprovalsPage";
import ManagerBookingActivityPage from "./pages/ManagerBookingActivityPage";
import ManagerReportsPage from "./pages/ManagerReportsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rides" element={<RidesPage />} />
            <Route path="/rides/:rideId" element={<RideDetailsPage />} />
            <Route path="/accommodations" element={<AccommodationsPage />} />
            <Route path="/accommodations/:accommodationId" element={<AccommodationDetailsPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route
              path="/checkout"
              element={
                <ProtectedRoute>
                  <CheckoutPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/booking-confirmation/:bookingReference"
              element={
                <ProtectedRoute>
                  <BookingConfirmationPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/bookings/history"
              element={
                <ProtectedRoute>
                  <BookingHistoryPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/content"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Admin"]}>
                    <AdminContentPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/bookings"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Admin"]}>
                    <AdminBookingsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Admin"]}>
                    <AdminReportsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            
          <Route
            path="/admin/audit-logs"
            element={
              <RoleProtectedRoute allowedRoles={["Admin"]}>
                <AdminAuditLogsPage />
              </RoleProtectedRoute>
            }
          /><Route
              path="/manager/approvals"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Manager"]}>
                    <ManagerApprovalsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/bookings"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Manager"]}>
                    <ManagerBookingActivityPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/manager/reports"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Manager"]}>
                    <ManagerReportsPage />
                  </RoleProtectedRoute>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
