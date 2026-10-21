import React, { useState } from 'react';
import { Menu, X, User, Shield, Globe } from 'lucide-react';
import { BANK_CONFIG } from '../config/constants';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-4 xl:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-500 p-2 rounded-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">{BANK_CONFIG.name}</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#compte" className="text-gray-600 hover:text-blue-600 transition-colors">
              Services
            </a>
            <a href="#epargne" className="text-gray-600 hover:text-blue-600 transition-colors">
              Patrimoine
            </a>
            <a href="#investissement" className="text-gray-600 hover:text-blue-600 transition-colors">
              Investissement
            </a>
            <a href="#voyage" className="text-gray-600 hover:text-blue-600 transition-colors">
              International
            </a>
            <a href="#aide" className="text-gray-600 hover:text-blue-600 transition-colors">
              Contact
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            <a 
              href="/connexion"
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Espace client</span>
            </a>
            <a 
              href="/inscription"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
              Ouvrir un compte
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 bg-white rounded-lg shadow-lg border p-4">
            <div className="space-y-4">
              <a href="#compte" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Services
              </a>
              <a href="#epargne" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Patrimoine
              </a>
              <a href="#investissement" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Investissement
              </a>
              <a href="#voyage" className="block text-gray-600 hover:text-blue-600 transition-colors">
                International
              </a>
              <a href="#aide" className="block text-gray-600 hover:text-blue-600 transition-colors">
                Contact
              </a>
              <hr className="my-4" />
              <a 
                href="/connexion"
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <User className="h-4 w-4" />
                <span>Espace client</span>
              </a>
              <a 
                href="/inscription"
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-block text-center"
              >
                Ouvrir un compte
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;