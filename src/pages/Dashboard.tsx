import React, { useState, useEffect } from 'react';
import { LogOut, Clock, Shield } from 'lucide-react';
import { AuthService } from '../services/authService';
import { BANK_CONFIG } from '../config/constants';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import DashboardHome from '../components/dashboard/DashboardHome';
import AccountsSection from '../components/dashboard/AccountsSection';
import CardsSection from '../components/dashboard/CardsSection';
import TransactionsSection from '../components/dashboard/TransactionsSection';
import TransfersSection from '../components/dashboard/TransfersSection';
import SavingsSection from '../components/dashboard/SavingsSection';
import InvestmentsSection from '../components/dashboard/InvestmentsSection';
import NotificationsSection from '../components/dashboard/NotificationsSection';
import SupportSection from '../components/dashboard/SupportSection';
import SettingsSection from '../components/dashboard/SettingsSection';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    if (!AuthService.isAuthenticated()) {
      window.location.href = '/connexion';
      return;
    }

    // Récupérer les informations de l'utilisateur
    const currentUser = AuthService.getCurrentUser();
    setUser(currentUser);
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    window.location.href = '/';
  };

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de votre espace...</p>
        </div>
      </div>
    );
  }

  // Vérification du statut de vérification de l'utilisateur
  if (user && !user.verified) {
    return (
      <div className="min-h-screen bg-gray-50 relative overflow-hidden">
        {/* Contenu flouté en arrière-plan */}
        <div className="absolute inset-0 filter blur-sm">
          <div className="flex">
            <Sidebar 
              activeSection={activeSection}
              onSectionChange={handleSectionChange}
              isMobileMenuOpen={isMobileMenuOpen}
              onMobileMenuToggle={handleMobileMenuToggle}
            />
            <div className="flex-1 lg:ml-0">
              <Header user={user} />
              <main className="p-6">
                <DashboardHome user={user} />
              </main>
            </div>
          </div>
        </div>

        {/* Overlay de vérification */}
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Compte en attente de vérification
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-gray-600 leading-relaxed">
                Votre compte {BANK_CONFIG.name} a été créé avec succès mais nécessite une vérification avant d'être pleinement activé.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-left">
                    <p className="text-sm text-blue-800 font-medium">Prochaines étapes :</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• Vérification de votre identité</li>
                      <li>• Validation de vos documents</li>
                      <li>• Activation de votre compte</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500">
                Vous recevrez une notification dès que votre compte sera vérifié.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-full font-semibold hover:bg-gray-600 transition-colors flex items-center justify-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Se déconnecter</span>
              </button>
              
              <p className="text-xs text-gray-400">
                Statut : En attente • ID: {user.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <DashboardHome user={user} />;
      case 'accounts':
        return <AccountsSection user={user} />;
      case 'cards':
        return <CardsSection user={user} />;
      case 'transactions':
        return <TransactionsSection user={user} />;
      case 'transfers':
        return <TransfersSection user={user} />;
      case 'savings':
        return <SavingsSection user={user} />;
      case 'investments':
        return <InvestmentsSection user={user} />;
      case 'notifications':
        return <NotificationsSection user={user} />;
      case 'support':
        return <SupportSection user={user} />;
      case 'settings':
        return <SettingsSection user={user} />;
      default:
        return <DashboardHome user={user} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuToggle={handleMobileMenuToggle}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Header */}
        <Header user={user} />

        {/* Content */}
        <main className="p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;