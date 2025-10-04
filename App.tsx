import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import useAuth from './hooks/useAuth';
import LoginPage from './components/LoginPage';
import CustomerDashboard from './components/CustomerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AdminUserManagement from './components/AdminUserManagement';
import CustomerDetailPage from './components/CustomerDetailPage';
import Layout from './components/Layout';
import { UserRole } from './types';
import CustomerManagementPage from './components/CustomerManagementPage';
import BillingPage from './components/BillingPage';
import AllBillsPage from './components/AllBillsPage';
import SignupPage from './components/SignupPage';
import MetricsPage from './components/MetricsPage';
import BillingHistoryPage from './components/BillingHistoryPage';
import UsageAnalyticsPage from './components/UsageAnalyticsPage';
import ProfilePage from './components/ProfilePage';


// Using React.ReactElement is a more explicit and safe way to type children props.
const PrivateRoute: React.FC<{ children: React.ReactElement; role: UserRole }> = ({ children, role }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (user && user.role === role) {
    return children;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute role={UserRole.CUSTOMER}>
                  <CustomerDashboard />
                </PrivateRoute>
              }
            />
             <Route
              path="/billing-history"
              element={
                <PrivateRoute role={UserRole.CUSTOMER}>
                  <BillingHistoryPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/usage-analytics"
              element={
                <PrivateRoute role={UserRole.CUSTOMER}>
                  <UsageAnalyticsPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/profile"
              element={
                <PrivateRoute role={UserRole.CUSTOMER}>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <CustomerManagementPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <BillingPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/all-bills"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <AllBillsPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/admin/metrics"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <MetricsPage />
                </PrivateRoute>
              }
            />
             <Route
              path="/admin/users"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <AdminUserManagement />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/customer/:customerId"
              element={
                <PrivateRoute role={UserRole.ADMIN}>
                  <CustomerDetailPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </Layout>
      </HashRouter>
    </AuthProvider>
  );
}

export default App;