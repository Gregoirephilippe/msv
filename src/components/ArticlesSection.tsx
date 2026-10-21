import React from 'react';
import { BookOpen, TrendingUp, Plane, Calculator } from 'lucide-react';

const ArticlesSection: React.FC = () => {
  const articles = [
    {
      icon: TrendingUp,
      title: 'Maximiser votre épargne',
      description: 'Découvrez les meilleures stratégies pour faire fructifier votre argent avec l\'épargne Turbo X.',
      image: 'https://images.pexels.com/photos/3943716/pexels-photo-3943716.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '5 min'
    },
    {
      icon: Plane,
      title: 'Voyager sans frais bancaires',
      description: 'Tous nos conseils pour optimiser vos finances en voyage et éviter les frais cachés.',
      image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '7 min'
    },
    {
      icon: Calculator,
      title: 'Gérer son budget efficacement',
      description: 'Méthodes et outils pour maîtriser ses dépenses et atteindre ses objectifs financiers.',
      image: 'https://images.pexels.com/photos/4386370/pexels-photo-4386370.jpeg?auto=compress&cs=tinysrgb&w=400',
      readTime: '6 min'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 xl:px-8">
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center space-x-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            <BookOpen className="h-4 w-4" />
            <span>Ressources</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Articles et conseils
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Enrichissez vos connaissances financières avec nos guides pratiques et conseils d'experts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article key={index} className="group bg-white rounded-2xl shadow-sm border hover:shadow-lg transition-shadow cursor-pointer">
              <div className="relative overflow-hidden rounded-t-2xl">
                <img 
                  src={article.image}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                  <div className="flex items-center space-x-2">
                    <article.icon className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">{article.readTime}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {article.description}
                </p>
                <div className="flex items-center text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Lire l'article →</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl">
            Explorer nos articles
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;