import React from 'react';
import { TrendingUp, Shield, Crown, Building } from 'lucide-react';

const SavingsSection: React.FC = () => {
  return (
    <section id="epargne" className="py-16 bg-white">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <img 
              src="https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Gestion de patrimoine professionnel"
              className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
            />
            
            {/* Floating Rate Card */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-xl shadow-2xl border">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Crown className="h-6 w-6 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Performance</span>
                </div>
                <p className="text-3xl font-bold text-blue-600">8.5%</p>
                <p className="text-sm text-gray-500">Rendement annuel moyen</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span>Gestion de patrimoine</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Optimisez votre patrimoine
              </h2>
              <p className="text-lg text-gray-600">
                Stratégies d'investissement personnalisées et gestion active de portefeuille par nos experts financiers.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-slate-100 p-2 rounded-lg flex-shrink-0">
                  <TrendingUp className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Allocation d'actifs optimisée</p>
                  <p className="text-gray-600">Diversification intelligente selon votre profil</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                  <Shield className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Protection institutionnelle</p>
                  <p className="text-gray-600">Couverture étendue et assurance premium</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-emerald-100 p-2 rounded-lg flex-shrink-0">
                  <Building className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Conseil patrimonial</p>
                  <p className="text-gray-600">Expertise fiscale et succession</p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl">
              Consulter nos solutions
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SavingsSection;