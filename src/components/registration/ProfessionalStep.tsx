import React from 'react';
import { ProfessionalInfo } from '../../types/registration';

interface ProfessionalStepProps {
  data: ProfessionalInfo;
  onChange: (data: ProfessionalInfo) => void;
  onNext: () => void;
  onBack: () => void;
}

const ProfessionalStep: React.FC<ProfessionalStepProps> = ({ data, onChange, onNext, onBack }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleChange = (field: keyof ProfessionalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const isValid = data.profession && data.status && data.monthlyIncome;

  const incomeRanges = [
    { value: '0-1000', label: 'Moins de 1 000€' },
    { value: '1000-2000', label: '1 000€ - 2 000€' },
    { value: '2000-3000', label: '2 000€ - 3 000€' },
    { value: '3000-5000', label: '3 000€ - 5 000€' },
    { value: '5000-8000', label: '5 000€ - 8 000€' },
    { value: '8000+', label: 'Plus de 8 000€' }
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Situation professionnelle</h2>
          <p className="text-gray-600">Renseignez votre activité professionnelle actuelle</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profession *
            </label>
            <input
              type="text"
              value={data.profession}
              onChange={(e) => handleChange('profession', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              placeholder="Ex: Développeur, Enseignant, Consultant..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut professionnel *
            </label>
            <select
              value={data.status}
              onChange={(e) => handleChange('status', e.target.value as ProfessionalInfo['status'])}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              <option value="">Sélectionner votre statut</option>
              <option value="student">Étudiant</option>
              <option value="employee">Salarié</option>
              <option value="self-employed">Indépendant / Freelance</option>
              <option value="unemployed">Sans emploi</option>
              <option value="retired">Retraité</option>
              <option value="other">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Revenu mensuel estimé *
            </label>
            <select
              value={data.monthlyIncome}
              onChange={(e) => handleChange('monthlyIncome', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              required
            >
              <option value="">Sélectionner une fourchette</option>
              {incomeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-800">
              <strong>Confidentialité :</strong> Ces informations sont utilisées uniquement pour l'évaluation de votre dossier et ne seront jamais partagées avec des tiers.
            </p>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Continuer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfessionalStep;