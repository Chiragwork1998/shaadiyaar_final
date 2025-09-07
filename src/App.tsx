import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Bookings from './pages/Bookings';
import Payments from './pages/Payments';
import Inventory from './pages/Inventory';
import Receipts from './pages/Receipts';
import Agents from './pages/Agents';
import WhatsApp from './pages/WhatsApp';
import Intelligence from './pages/Intelligence';
import Calendar from './pages/Calendar';
import Analytics from './pages/Analytics';
import Vendors from './pages/Vendors';
import Admins from './pages/Admins';
import Approvals from './pages/Approvals';
import SettingsPage from './pages/SettingsPage';
import ExportData from './pages/ExportData';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import InstallPrompt from './components/ui/InstallPrompt';
import UpdateNotification from './components/ui/UpdateNotification';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <InstallPrompt />
      <UpdateNotification />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredPermission="canViewDashboard">
              <Layout>
                <Dashboard />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/leads"
          element={
            <ProtectedRoute>
              <Layout>
                <Leads />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <Layout>
                <Bookings />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/payments"
          element={
            <ProtectedRoute requiredPermission="canViewPayments">
              <Layout>
                <Payments />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/inventory"
          element={
            <ProtectedRoute requiredPermission="canAccessInventory">
              <Layout>
                <Inventory />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/receipts"
          element={
            <ProtectedRoute requiredPermission="canViewFinancialData">
              <Layout>
                <Receipts />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/agents"
          element={
            <ProtectedRoute>
              <Layout>
                <Agents />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/whatsapp"
          element={
            <ProtectedRoute>
              <Layout>
                <WhatsApp />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/intelligence"
          element={
            <ProtectedRoute>
              <Layout>
                <Intelligence />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/calendar"
          element={
            <ProtectedRoute requiredPermission="canViewCalendar">
              <Layout>
                <Calendar />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/analytics"
          element={
            <ProtectedRoute requiredPermission="canViewFinancialData">
              <Layout>
                <Analytics />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <Layout>
                <Vendors />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/admins"
          element={
            <ProtectedRoute requiredPermission="canManageAdmins">
              <Layout>
                <Admins />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/approvals"
          element={
            <ProtectedRoute requiredPermission="canApproveActions">
              <Layout>
                <Approvals />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        <Route
          path="/export-data"
          element={
            <ProtectedRoute requiredPermission="canExportData">
              <Layout>
                <ExportData />
              </Layout>
            </ProtectedRoute>
          }
        />
        
        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;