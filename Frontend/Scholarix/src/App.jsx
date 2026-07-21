import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from "react-hot-toast";

import ErrorPage from './pages/ErrorPage'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/SignUp'
import ForgotPassword from './pages/ForgotPassword'
import StudentDashboard from './pages/StudentDashboard'
import ProviderDashboard from './pages/ProviderDashboard'
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
          
          {/* Protected Student Routes */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path = "/dashboard" element = {<StudentDashboard />} />
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