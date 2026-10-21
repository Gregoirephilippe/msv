import React from 'react';
import { BarChart3, Building2, TrendingUp, Shield } from 'lucide-react';

const InvestmentSection: React.FC = () => {
  const investments = [
    {
      icon: BarChart3,
      title: 'Portefeuilles institutionnels',
      description: 'Accès privilégié aux marchés privés et alternatifs'
    },
    {
      icon: Building2,
      title: 'Immobilier de prestige',
      description: 'Investissements immobiliers haut de gamme'
    },
    {
      icon: TrendingUp,
      title: 'Gestion discrétionnaire',
      description: 'Mandats de gestion personnalisés'
    }
  ];

  return (
    <section id="investissement" className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-medium">
                <BarChart3 className="h-4 w-4" />
                <span>Gestion d'actifs</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Excellence en gestion d'actifs
              </h2>
              <p className="text-lg text-gray-600">
                Solutions d'investissement sophistiquées et accès exclusif aux opportunités réservées aux investisseurs institutionnels.
              </p>
            </div>

            {/* Investment Options */}
            <div className="space-y-4">
              {investments.map((investment, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-xl hover:border-slate-300 transition-colors bg-white/50">
                  <div className="bg-slate-100 p-3 rounded-lg flex-shrink-0">
                    <investment.icon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{investment.title}</h3>
                    <p className="text-gray-600">{investment.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Warning */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <Shield className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Investissement responsable</p>
                  <p className="text-xs text-blue-700 mt-1">
                    Nos conseillers vous accompagnent dans une approche d'investissement adaptée à votre profil de risque et vos objectifs patrimoniaux.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button className="bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl">
              Consulter un expert
            </button>
          </div>

          {/* Visual */}
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/6801874/pexels-photo-6801874.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Analyse financière professionnelle"
              className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
            />
            
            {/* Floating Performance Card */}
            <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Performance moyenne</p>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-lg font-bold text-blue-600">+8.5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestmentSection;