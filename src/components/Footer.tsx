import React from 'react';
import { Shield, Twitter, Linkedin, Facebook, Globe, ChevronDown } from 'lucide-react';
import { BANK_CONFIG, SOCIAL_LINKS } from '../config/constants';

const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'À propos',
      links: [
        'Notre histoire',
        'Carrières',
        'Presse',
        'Investisseurs',
        'Blog'
      ]
    },
    {
      title: 'Aide',
      links: [
        'Centre d\'aide',
        'Contact',
        'Sécurité',
        'Tarifs',
        'Statut des services'
      ]
    },
    {
      title: 'Ressources',
      links: [
        'Guides financiers',
        'API développeurs',
        'Partenaires',
        'Affiliés',
        'Communauté'
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 xl:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="bg-emerald-500 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">{BANK_CONFIG.name}</h3>
                <p className="text-sm text-gray-400">{BANK_CONFIG.fullName}</p>
              </div>
            </div>
            <p className="text-gray-300 leading-relaxed">
              {BANK_CONFIG.description}. Une expérience bancaire moderne, sécurisée et accessible à tous.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              <a 
                href={SOCIAL_LINKS.twitter}
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href={SOCIAL_LINKS.linkedin}
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a 
                href={SOCIAL_LINKS.facebook}
                className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <div key={index} className="space-y-6">
              <h4 className="text-lg font-semibold">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Language Selector */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <Globe className="h-4 w-4 text-gray-400" />
              <div className="relative">
                <select className="bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2 pr-8 appearance-none">
                  <option value="FR">Français</option>
                  <option value="EN">English</option>
                  <option value="DE">Deutsch</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* App Download */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Télécharger l'app :</span>
              <div className="flex space-x-3">
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <span className="text-sm">App Store</span>
                </div>
                <div className="bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer">
                  <span className="text-sm">Google Play</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-400">
              © 2024 {BANK_CONFIG.fullName}. Tous droits réservés.
            </p>
            <div className="flex flex-wrap gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Mentions légales
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Politique de confidentialité
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Cookies
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                RGPD
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;