import React from 'react';
import { Crown, Shield, Users, CheckCircle } from 'lucide-react';
import { BANK_CONFIG } from '../config/constants';

const AccountSection: React.FC = () => {
  const features = [
    {
      icon: Crown,
      text: 'Service bancaire privé exclusif'
    },
    {
      icon: Shield,
      text: 'Sécurité et confidentialité maximales'
    },
    {
      icon: Users,
      text: 'Conseiller dédié disponible 24h/7j'
    },
    {
      icon: CheckCircle,
      text: 'Solutions sur-mesure'
    }
  ];

  return (
    <section id="compte" className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                <CheckCircle className="h-4 w-4" />
                <span>Banque privée</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Banque privée d'exception
              </h2>
              <p className="text-lg text-gray-600">
                Services bancaires haut de gamme dédiés à la gestion et à l'optimisation de votre patrimoine.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-gray-700 font-medium">{feature.text}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a 
              href="/inscription"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl inline-block text-center"
            >
              Ouvrir un compte privé
            </a>
          </div>

          {/* Visual */}
          <div className="relative">
            <img 
              src="https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Conseiller en gestion de patrimoine"
              className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
            />
            
            {/* Floating Stats */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">25+</p>
                <p className="text-sm text-gray-600">Années d'expertise</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AccountSection;