import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Login                from './pages/Login';
import SuperAdminDashboard  from './pages/SuperAdminDashboard';
import ManageUniversities   from './pages/ManageUniversities';
import ManageAdmins         from './pages/ManageAdmins';
import ClientAdminDashboard from './pages/ClientAdminDashboard';
import ManageDepartments    from './pages/ManageDepartments';
import ManageBatches        from './pages/ManageBatches';
import AdmitStudent         from './pages/AdmitStudent';
import StudentList          from './pages/StudentList';

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/"      element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Super Admin */}
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['super_admin']}><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/super-admin/universities" element={
            <ProtectedRoute allowedRoles={['super_admin']}><ManageUniversities /></ProtectedRoute>} />
          <Route path="/super-admin/admins" element={
            <ProtectedRoute allowedRoles={['super_admin']}><ManageAdmins /></ProtectedRoute>} />

          {/* Client Admin */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['client_admin']}><ClientAdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/departments" element={
            <ProtectedRoute allowedRoles={['client_admin']}><ManageDepartments /></ProtectedRoute>} />
          <Route path="/admin/batches" element={
            <ProtectedRoute allowedRoles={['client_admin']}><ManageBatches /></ProtectedRoute>} />
          <Route path="/admin/admit" element={
            <ProtectedRoute allowedRoles={['client_admin']}><AdmitStudent /></ProtectedRoute>} />
          <Route path="/admin/students" element={
            <ProtectedRoute allowedRoles={['client_admin']}><StudentList /></ProtectedRoute>} />

          <Route path="/unauthorized" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🚫</div>
                <h1 className="text-2xl font-bold text-gray-800">Unauthorized</h1>
                <a href="/login" className="text-blue-600 mt-4 inline-block hover:underline">Back to Login</a>
              </div>
            </div>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ErrorBoundary>
  );
}
