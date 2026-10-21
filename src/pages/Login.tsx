import React from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import LoginForm from '../components/auth/LoginForm';
import { BANK_CONFIG } from '../config/constants';

const Login: React.FC = () => {
  const handleLoginSuccess = () => {
    // Redirection après connexion réussie
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 xl:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{BANK_CONFIG.name}</h1>
                  <p className="text-sm text-gray-600">Espace client privé</p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Banque privée
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 xl:px-8 py-12">
        <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
          <LoginForm onLoginSuccess={handleLoginSuccess} />
        </div>
      </main>

      {/* Security Notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-4">
        <div className="container mx-auto px-4 xl:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Connexion sécurisée - Protection maximale de vos données</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;