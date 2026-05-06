import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import RidesPage from "./pages/RidesPage";
import AccommodationsPage from "./pages/AccommodationsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import AdminContentPage from "./pages/AdminContentPage";
import ManagerApprovalsPage from "./pages/ManagerApprovalsPage";
import NotFoundPage from "./pages/NotFoundPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/rides" element={<RidesPage />} />
            <Route path="/accommodations" element={<AccommodationsPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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
              path="/manager/approvals"
              element={
                <ProtectedRoute>
                  <RoleProtectedRoute allowedRoles={["Manager"]}>
                    <ManagerApprovalsPage />
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
