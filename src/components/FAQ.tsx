import React, { useState } from 'react';
import { ChevronDown, Shield, Lock, CreditCard, HelpCircle } from 'lucide-react';
import { BANK_CONFIG } from '../config/constants';

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqItems = [
    {
      icon: Shield,
      question: `${BANK_CONFIG.name} dispose-t-elle d'une licence bancaire ?`,
      answer: `Oui, ${BANK_CONFIG.fullName} est une banque privée européenne agréée et régulée par les autorités financières. Nous offrons une protection étendue et des garanties institutionnelles pour les patrimoines importants.`
    },
    {
      icon: Lock,
      question: 'Comment mes données sont-elles protégées ?',
      answer: 'Nous appliquons les plus hauts standards de sécurité bancaire avec chiffrement militaire, authentification multi-facteurs et protocoles de confidentialité renforcés. Vos données sont protégées selon les normes les plus strictes.'
    },
    {
      icon: CreditCard,
      question: 'Quelles sont les conditions d\'éligibilité ?',
      answer: 'Nos services s\'adressent aux clients disposant d\'un patrimoine significatif. Un entretien préalable avec l\'un de nos conseillers permet d\'évaluer l\'adéquation de nos solutions à votre profil.'
    },
    {
      icon: HelpCircle,
      question: 'Comment fonctionne la tarification ?',
      answer: 'Nos honoraires sont transparents et adaptés aux services utilisés. La tarification est personnalisée selon votre profil et vos besoins. Consultez votre conseiller pour un devis détaillé.'
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Questions fréquentes
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Trouvez rapidement les réponses à vos questions sur nos services bancaires.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border">
              <button
                onClick={() => toggleItem(index)}
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <item.icon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <span className="font-semibold text-gray-900">{item.question}</span>
                </div>
                <ChevronDown 
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              
              {openItems.includes(index) && (
                <div className="px-6 pb-6">
                  <div className="pl-12">
                    <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Vous avez d'autres questions ?</p>
          <button className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors">
            Contactez notre support client →
          </button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;