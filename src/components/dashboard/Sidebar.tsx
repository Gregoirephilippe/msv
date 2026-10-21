import React, { useState } from 'react';
import { 
  Home, 
  CreditCard, 
  Receipt, 
  Send, 
  PiggyBank, 
  TrendingUp, 
  Bell, 
  HelpCircle, 
  Settings,
  Menu,
  X,
  Wallet,
  Bitcoin
} from 'lucide-react';
import { BANK_CONFIG } from '../../config/constants';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  isMobileMenuOpen: boolean;
  onMobileMenuToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeSection, 
  onSectionChange, 
  isMobileMenuOpen, 
  onMobileMenuToggle 
}) => {
  const menuItems = [
    { id: 'home', label: 'Accueil', icon: Home },
    { id: 'accounts', label: 'Mes comptes', icon: Wallet },
    { id: 'cards', label: 'Mes cartes', icon: CreditCard },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'transfers', label: 'Virements', icon: Send },
    { id: 'savings', label: 'Mes espaces', icon: PiggyBank },
    { id: 'investments', label: 'Investissement', icon: TrendingUp },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Support', icon: HelpCircle },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ];

  const handleItemClick = (itemId: string) => {
    onSectionChange(itemId);
    if (isMobileMenuOpen) {
      onMobileMenuToggle();
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={onMobileMenuToggle}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={onMobileMenuToggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white border-r border-gray-200
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{BANK_CONFIG.name}</h1>
                <p className="text-sm text-gray-500">Espace client</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors
                    ${isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-r-2 border-emerald-500' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* User Info */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              Version 1.0.0 • Sécurisé SSL
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;