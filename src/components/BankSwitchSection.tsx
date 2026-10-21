import React from 'react';
import { Users, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const BankSwitchSection: React.FC = () => {
  const steps = [
    {
      step: '1',
      title: 'Analyse patrimoniale complète',
      description: 'Audit de votre situation financière actuelle'
    },
    {
      step: '2',
      title: 'Stratégie personnalisée',
      description: 'Élaboration d\'un plan sur-mesure'
    },
    {
      step: '3',
      title: 'Mise en œuvre et suivi',
      description: 'Accompagnement continu par votre conseiller'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="text-center space-y-8 mb-16">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
              <Users className="h-4 w-4" />
              <span>Accompagnement personnalisé</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Votre transition patrimoniale
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Bénéficiez d'un accompagnement expert pour optimiser la gestion de votre patrimoine et vos investissements.
            </p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              )}
              
              {/* Step Card */}
              <div className="relative z-10 text-center space-y-4">
                <div className="mx-auto w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <Clock className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Réactivité</p>
              <p className="text-sm text-gray-600">Réponse sous 24h</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <CheckCircle className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Transparence totale</p>
              <p className="text-sm text-gray-600">Tarification claire</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
            <Users className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-semibold text-gray-900">Expertise dédiée</p>
              <p className="text-sm text-gray-600">Conseiller attitré</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <button className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl">
            Prendre rendez-vous
          </button>
        </div>
      </div>
    </section>
  );
};

export default BankSwitchSection;