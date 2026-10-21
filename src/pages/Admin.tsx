import React, { useEffect } from 'react';
import { AdminService } from '../services/adminService';
import AdminDashboard from '../components/admin/AdminDashboard';

const Admin: React.FC = () => {
  useEffect(() => {
    // Vérifier si l'utilisateur est connecté en tant qu'admin
    if (!AdminService.isAdmin()) {
      window.location.href = '/admin/login';
      return;
    }
  }, []);

  return <AdminDashboard />;
};

export default Admin;