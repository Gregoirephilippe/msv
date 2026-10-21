import React from 'react';
import { ArrowRight, Shield, Crown, TrendingUp, Building2 } from 'lucide-react';
import { BANK_CONFIG } from '../config/constants';

const Hero: React.FC = () => {
  return (
    <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-12 md:py-20">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {BANK_CONFIG.tagline}
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Solutions bancaires sur-mesure pour la gestion et l'optimisation de votre patrimoine.
              </p>
            </div>

            {/* Features Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border">
                <Crown className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">Service personnalisé</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium">Gestion d'actifs</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border">
                <Building2 className="h-4 w-4 text-slate-600" />
                <span className="text-sm font-medium">Conseil patrimonial</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-4">
              <a 
                href="/inscription"
                className="group bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center space-x-2 inline-flex"
              >
                <span>Ouvrir un compte privé</span>
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <p className="text-sm text-gray-500">
                ✓ Évaluation patrimoniale et conseiller dédié inclus
              </p>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800"
                alt="Conseiller financier professionnel"
                className="w-full h-[500px] object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Floating Feature Cards */}
              <div className="absolute -top-4 -left-4 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <Shield className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-900">Sécurité renforcée</p>
                    <p className="text-sm text-gray-600">Protection maximale</p>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-xl shadow-lg border">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Performance</p>
                    <p className="text-sm text-gray-600">Gestion optimisée</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;