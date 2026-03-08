import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import MLTDashboard from './pages/mlt/MLTDashboard';
import ClinicianDashboard from './pages/clinician/ClinicianDashboard';
import PatientPortal from './pages/patient/PatientPortal';
import PatientVerification from './pages/patient/PatientVerification';
import PatientOTP from './pages/patient/PatientOTP';
import UserProfile from './pages/shared/UserProfile';
import Layout from './components/Layout';

// Staff route guard (MLT / Clinician)
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

// Patient route guard — requires patient OTP JWT
const PatientPrivateRoute = ({ children }) => {
  const { isPatientAuthenticated, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!isPatientAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Public patient verification flow (full-screen, no layout) */}
      <Route path="/patient-verify" element={<PatientVerification />} />
      <Route path="/patient-otp" element={<PatientOTP />} />
      
      {/* Patient portal — standalone page, no sidebar */}
      <Route 
        path="/patient-portal" 
        element={
          <PatientPrivateRoute>
            <PatientPortal />
          </PatientPrivateRoute>
        } 
      />
      
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/login" />} />
        
        <Route 
          path="mlt-dashboard" 
          element={
            <PrivateRoute allowedRoles={['MLT']}>
              <MLTDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="clinician-dashboard" 
          element={
            <PrivateRoute allowedRoles={['CLINICIAN']}>
              <ClinicianDashboard />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="profile" 
          element={
            <PrivateRoute allowedRoles={['MLT', 'CLINICIAN', 'PATIENT']}>
              <UserProfile />
            </PrivateRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;

