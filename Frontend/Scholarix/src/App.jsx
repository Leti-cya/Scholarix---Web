import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from "react-hot-toast";

import ErrorPage from './pages/ErrorPage'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import StudentDashboard from './pages/StudentDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
import ScholarshipDetails from './pages/ScholarshipDetails'
import AllScholarships from './pages/AllScholarships'
import ProviderProfile from './pages/ProviderProfile'
import ProtectedRoute from './service/ProtectedRoute'

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
          <Route path = "/providers/:id" element = {<ProviderProfile />} />
          
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path = "/dashboard" element = {<StudentDashboard />} />
            <Route path = "/scholarships" element = {<AllScholarships />} />
            <Route path = "/scholarships/:id" element = {<ScholarshipDetails />} />
          </Route>

          {/* Protected Provider Routes */}
          <Route element={<ProtectedRoute allowedRoles={['provider']} />}>
            <Route path = "/provider/dashboard" element = {<ProviderDashboard />} />
          </Route>

          {/* Fallback 404 Route */}
          <Route path = "*" element = {<ErrorPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App