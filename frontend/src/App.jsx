import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/auth/Login';
import MLTDashboard from './pages/mlt/MLTDashboard';
import ClinicianDashboard from './pages/clinician/ClinicianDashboard';
import PatientPortal from './pages/patient/PatientPortal';
import Layout from './components/Layout';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
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
          path="patient-portal" 
          element={
            <PrivateRoute allowedRoles={['PATIENT']}>
              <PatientPortal />
            </PrivateRoute>
          } 
        />
      </Route>
    </Routes>
  );
}

export default App;
