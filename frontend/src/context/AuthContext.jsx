import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [patientToken, setPatientTokenState] = useState(null);

  useEffect(() => {
    // Check for stored staff user on mount
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    // Check for stored patient token on mount
    const storedPatientToken = localStorage.getItem('patientToken');
    if (storedPatientToken) {
      setPatientTokenState(storedPatientToken);
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', jwtToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const setPatientToken = (token) => {
    setPatientTokenState(token);
    localStorage.setItem('patientToken', token);
  };

  const clearPatientToken = () => {
    setPatientTokenState(null);
    localStorage.removeItem('patientToken');
  };

  const isPatientAuthenticated = !!patientToken;

  return (
    <AuthContext.Provider value={{ 
      user, login, logout, loading,
      patientToken, setPatientToken, clearPatientToken, isPatientAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

