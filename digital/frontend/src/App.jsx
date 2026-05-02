import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Register from './components/Register';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminTransactions from './pages/admin/AdminTransactions';
import AdminFraudAlerts from './pages/admin/AdminFraudAlerts';
import UserManagement from './pages/admin/UserManagement';
import AnalystDashboard from './pages/analyst/AnalystDashboard';
import ViewerDashboard from './pages/viewer/ViewerDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import './App.css';

function App() {
  const [user] = useState(JSON.parse(localStorage.getItem('user')));
  const role = user?.role;

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      {role !== 'Admin' && <Navbar user={user} />}
      <main className="app-main">
        <Routes>
          {/* Public Routes */}
          {!user ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              {/* Protected Routes based on Role */}
              {role === 'Admin' && (
                <Route path="/admin/*" element={<AdminLayout />}>
                    <Route index element={<AdminOverview />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="transactions" element={<AdminTransactions />} />
                    <Route path="alerts" element={<AdminFraudAlerts />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                </Route>
              )}
              
              {role === 'Analyst' && (
                <Route path="/" element={<AnalystDashboard />} />
              )}

              {(role === 'Viewer' || role === 'User') && (
                <Route path="/" element={<ViewerDashboard />} />
              )}

              {/* Default fallback for other roles to Home if needed */}
              {['Admin', 'Analyst', 'Viewer', 'User'].indexOf(role) === -1 && (
                <Route path="/" element={<Home />} />
              )}

              {/* Redirect root to admin if they are admin */}
              {role === 'Admin' && <Route path="/" element={<Navigate to="/admin" replace />} />}

              {/* Fallback for logged in users */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route path="/register" element={<Navigate to="/" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </main>
      {role !== 'Admin' && <Footer />}
    </BrowserRouter>
  );
}

export default App;
