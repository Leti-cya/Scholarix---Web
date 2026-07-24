import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from "react-hot-toast";

import ErrorPage from './pages/ErrorPage'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import VerifyEmail from './pages/VerifyEmail'
import StudentDashboard from './pages/StudentDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import ScholarshipDetails from './pages/ScholarshipDetails'
import AllScholarships from './pages/AllScholarships'
import ProviderProfile from './pages/ProviderProfile'
import StudentApplications from './pages/StudentApplications'
import ProviderApplications from './pages/ProviderApplications'
import StudentAnalytics from './pages/StudentAnalytics'
import ProviderAnalytics from './pages/ProviderAnalytics'
import SavedScholarships from './pages/SavedScholarships'
import StudentDocuments from './pages/StudentDocuments'
import ProtectedRoute from './service/ProtectedRoute'
import Layout from './component/Layout'

const STUDENT_NAV = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard", end: true },
  { to: "/scholarships", icon: "🔍", label: "Explore Scholarships" },
  { to: "/saved", icon: "🔖", label: "Saved" },
  { to: "/applications", icon: "📝", label: "My Applications" },
  { to: "/documents", icon: "📎", label: "Documents" },
  { to: "/analytics", icon: "📊", label: "Analytics" },
];

const PROVIDER_NAV = [
  { to: "/provider/dashboard", icon: "🏠", label: "Dashboard", end: true },
  { to: "/provider/applications", icon: "📋", label: "Manage Applications" },
  { to: "/provider/analytics", icon: "📊", label: "Analytics" },
];

function App() {
  return (
    <>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path = "/" element = {<LandingPage />} />
          <Route path = "/login" element = {<Login />} />
          <Route path = "/register" element = {<Signup />} />
          <Route path = "/forgot-password" element = {<ForgotPassword />} />
          <Route path = "/reset-password" element = {<ResetPassword />} />
          <Route path = "/verify-email" element = {<VerifyEmail />} />
          <Route path = "/providers/:id" element = {<ProviderProfile />} />

          {/* Protected Student Routes — share the nav drawer shell */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route element={<Layout navItems={STUDENT_NAV} homeHref="/dashboard" />}>
              <Route path = "/dashboard" element = {<StudentDashboard />} />
              <Route path = "/scholarships" element = {<AllScholarships />} />
              <Route path = "/scholarships/:id" element = {<ScholarshipDetails />} />
              <Route path = "/saved" element = {<SavedScholarships />} />
              <Route path = "/applications" element = {<StudentApplications />} />
              <Route path = "/documents" element = {<StudentDocuments />} />
              <Route path = "/analytics" element = {<StudentAnalytics />} />
            </Route>
          </Route>

          {/* Protected Provider Routes — share the nav drawer shell */}
          <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
            <Route element={<Layout navItems={PROVIDER_NAV} homeHref="/provider/dashboard" />}>
              <Route path = "/provider/dashboard" element = {<ProviderDashboard />} />
              <Route path = "/provider/applications" element = {<ProviderApplications />} />
              <Route path = "/provider/analytics" element = {<ProviderAnalytics />} />
            </Route>
          </Route>

          {/* Fallback 404 Route */}
          <Route path = "*" element = {<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App