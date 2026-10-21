import React from 'react';
import { Globe, Crown, Shield, ConciergeBell as Concierge } from 'lucide-react';

const TravelSection: React.FC = () => {
  const features = [
    {
      icon: Globe,
      title: 'Services bancaires internationaux',
      description: 'Accès privilégié dans plus de 50 pays'
    },
    {
      icon: Shield,
      title: 'Protection premium',
      description: 'Assurances haut de gamme et assistance 24h/24'
    },
    {
      icon: Concierge,
      title: 'Conciergerie privée',
      description: 'Services personnalisés partout dans le monde'
    }
  ];

  return (
    <section id="voyage" className="py-16 bg-slate-50">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Visual */}
          <div className="relative order-2 lg:order-1">
            <img 
              src="https://images.pexels.com/photos/2034335/pexels-photo-2034335.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Voyage de luxe et services premium"
              className="w-full h-[400px] object-cover rounded-2xl shadow-xl"
            />
            
            {/* Floating Feature Cards */}
            <div className="absolute -top-4 -right-4 bg-white p-4 rounded-xl shadow-lg border">
              <div className="flex items-center space-x-3">
                <Crown className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-semibold text-gray-900">Service VIP</p>
                  <p className="text-sm text-gray-600">Partout dans le monde</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg border">
              <div className="flex items-center space-x-3">
                <div className="bg-slate-100 p-2 rounded-lg">
                  <Shield className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Sans limite</p>
                  <p className="text-sm text-gray-600">Transactions illimitées</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-slate-100 text-slate-800 px-4 py-2 rounded-full text-sm font-medium">
                <Crown className="h-4 w-4" />
                <span>Services premium</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Excellence internationale
              </h2>
              <p className="text-lg text-gray-600">
                Bénéficiez de services bancaires d'exception et d'une conciergerie privée dans le monde entier.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="bg-slate-100 p-3 rounded-lg flex-shrink-0">
                    <feature.icon className="h-6 w-6 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button className="bg-slate-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-slate-700 transition-colors shadow-lg hover:shadow-xl">
              Découvrir nos services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TravelSection;