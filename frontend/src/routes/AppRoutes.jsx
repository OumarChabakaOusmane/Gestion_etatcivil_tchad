import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import ForgotPassword from "../pages/Auth/ForgotPassword";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import CitizenLayout from "../components/CitizenLayout";
import AdminLayout from "../components/AdminLayout";

// Pages publiques
import Home from "../pages/Public/Home";
import Services from "../pages/Public/Services";
import Contact from "../pages/Public/Contact";
import NotFound from "../pages/Public/NotFound";

// Pages citoyens
import Dashboard from "../pages/Citizen/Dashboard";

import MesDemandes from "../pages/Citizen/MesDemandes";
import DemandeNaissance from "../pages/Citizen/DemandeNaissance";
import DemandeMariage from "../pages/Citizen/DemandeMariage";
import DemandeDeces from "../pages/Citizen/DemandeDeces";
import Profile from "../pages/Citizen/Profile";
import FamilyCenter from '../pages/Citizen/FamilyCenter';
import DemanderActe from "../pages/Citizen/DemanderActe";
import Aide from "../pages/Citizen/Aide";

// Pages admin
import AdminDashboard from "../pages/Admin/AdminDashboard";
import AdminCreateNaissance from '../pages/Admin/AdminCreateNaissance';
import AdminCreateMariage from '../pages/Admin/AdminCreateMariage';
import AdminCreateDeces from '../pages/Admin/AdminCreateDeces';
import AdminDemandes from "../pages/Admin/AdminDemandes";
import AdminReports from "../pages/Admin/AdminReports";
import AdminUtilisateurs from "../pages/Admin/AdminUtilisateurs";
import AdminSettings from "../pages/Admin/AdminSettings";
import AdminMessages from "../pages/Admin/AdminMessages";
import VerifyOtp from "../pages/Auth/VerifyOtp";
import ResetPassword from "../pages/Auth/ResetPassword";
import AdminLogs from "../pages/Admin/AdminLogs";
import Actualites from "../pages/Public/Actualites";
import AdminArticles from "../pages/Admin/AdminArticles";
import VerifyCertificate from "../pages/Public/VerifyCertificate";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Routes publiques */}
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/actualites" element={<Actualites />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/verify-otp" element={<VerifyOtp />} />
        <Route path="/verifier-acte/:id" element={<VerifyCertificate />} />

        {/* Routes citoyens protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <Dashboard />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demander-acte"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <DemanderActe />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/aide"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <Aide />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/espace-famille"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <FamilyCenter />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/mes-demandes"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <MesDemandes />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demande/naissance"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <DemandeNaissance />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demande/mariage"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <DemandeMariage />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/demande/deces"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <DemandeDeces />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profil"
          element={
            <ProtectedRoute>
              <CitizenLayout>
                <Profile />
              </CitizenLayout>
            </ProtectedRoute>
          }
        />

        {/* Routes admin protégées */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/demandes"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminDemandes />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/guichet/naissance"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminCreateNaissance />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/guichet/mariage"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminCreateMariage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/guichet/deces"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminCreateDeces />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/rapports"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <ProtectedRoute superAdminOnly={true}>
              <AdminLayout>
                <AdminUtilisateurs />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute superAdminOnly={true}>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminMessages />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/logs"
          element={
            <ProtectedRoute superAdminOnly={true}>
              <AdminLayout>
                <AdminLogs />
              </AdminLayout>
            </ProtectedRoute>
          }
        />


        <Route
          path="/admin/articles"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminLayout>
                <AdminArticles />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch-all 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
