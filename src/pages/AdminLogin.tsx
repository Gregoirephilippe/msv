import React from 'react';
import AdminLogin from '../components/admin/AdminLogin';

const AdminLoginPage: React.FC = () => {
  const handleLoginSuccess = () => {
    window.location.href = '/admin';
  };

  return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
};

export default AdminLoginPage;