import React, { useState } from 'react';
import { Edit2, FileText, Download, Loader2, AlertCircle, Eye } from 'lucide-react';
import { RegistrationData, RegistrationStep } from '../../types/registration';
import { ContractService } from '../../services/contractService';

interface SummaryStepProps {
  data: RegistrationData;
  onEdit: (step: RegistrationStep) => void;
  onSubmit: () => Promise<void>;
  onBack: () => void;
  isSubmitting?: boolean;
  error?: string | null;
}

const SummaryStep: React.FC<SummaryStepProps> = ({ 
  data, 
  onEdit, 
  onSubmit, 
  onBack, 
  isSubmitting = false,
  error = null 
}) => {
  const [certifiedAccuracy, setCertifiedAccuracy] = useState(data.certifiedAccuracy);
  const [acceptedTerms, setAcceptedTerms] = useState(data.acceptedTerms);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  const isValid = certifiedAccuracy && acceptedTerms;

  const formatGender = (gender?: string) => {
    switch (gender) {
      case 'M': return 'Masculin';
      case 'F': return 'Féminin';
      case 'Other': return 'Autre';
      default: return 'Non spécifié';
    }
  };

  const formatStatus = (status: string) => {
    const statusMap = {
      'student': 'Étudiant',
      'employee': 'Salarié',
      'self-employed': 'Indépendant',
      'unemployed': 'Sans emploi',
      'retired': 'Retraité',
      'other': 'Autre'
    };
    return statusMap[status as keyof typeof statusMap] || status;
  };

  const formatIncome = (income: string) => {
    const incomeMap = {
      '0-1000': 'Moins de 1 000€',
      '1000-2000': '1 000€ - 2 000€',
      '2000-3000': '2 000€ - 3 000€',
      '3000-5000': '3 000€ - 5 000€',
      '5000-8000': '5 000€ - 8 000€',
      '8000+': 'Plus de 8 000€'
    };
    return incomeMap[income as keyof typeof incomeMap] || income;
  };

  const SectionCard: React.FC<{ 
    title: string; 
    onEdit: () => void; 
    children: React.ReactNode 
  }> = ({ title, onEdit, children }) => (
    <div className="bg-gray-50 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 transition-colors"
        >
          <Edit2 className="h-4 w-4" />
          <span className="text-sm font-medium">Modifier</span>
        </button>
      </div>
      {children}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Validation de votre dossier</h2>
          <p className="text-gray-600">Vérifiez vos informations avant de finaliser votre inscription</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Personal Information */}
          <SectionCard title="Informations personnelles" onEdit={() => onEdit('personal')}>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Nom complet :</span>
                <p className="font-medium">{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
              </div>
              <div>
                <span className="text-gray-600">Sexe :</span>
                <p className="font-medium">{formatGender(data.personalInfo.gender)}</p>
              </div>
              <div>
                <span className="text-gray-600">Date de naissance :</span>
                <p className="font-medium">{new Date(data.personalInfo.dateOfBirth).toLocaleDateString('fr-FR')}</p>
              </div>
              <div>
                <span className="text-gray-600">Nationalité :</span>
                <p className="font-medium">{data.personalInfo.nationality}</p>
              </div>
              {data.personalInfo.phone && (
                <div>
                  <span className="text-gray-600">Téléphone :</span>
                  <p className="font-medium">{data.personalInfo.phone}</p>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Address Information */}
          <SectionCard title="Adresse de résidence" onEdit={() => onEdit('address')}>
            <div className="text-sm">
              <span className="text-gray-600">Adresse complète :</span>
              <p className="font-medium">
                {data.addressInfo.street}<br />
                {data.addressInfo.postalCode} {data.addressInfo.city}<br />
                {data.addressInfo.country}
              </p>
            </div>
          </SectionCard>

          {/* Professional Information */}
          <SectionCard title="Situation professionnelle" onEdit={() => onEdit('professional')}>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Profession :</span>
                <p className="font-medium">{data.professionalInfo.profession}</p>
              </div>
              <div>
                <span className="text-gray-600">Statut :</span>
                <p className="font-medium">{formatStatus(data.professionalInfo.status)}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Revenu mensuel :</span>
                <p className="font-medium">{formatIncome(data.professionalInfo.monthlyIncome)}</p>
              </div>
            </div>
          </SectionCard>

          {/* Account Credentials */}
          <SectionCard title="Identifiants de connexion" onEdit={() => onEdit('credentials')}>
            <div className="text-sm">
              <span className="text-gray-600">Adresse email :</span>
              <p className="font-medium">{data.credentials.email}</p>
            </div>
          </SectionCard>

          {/* Terms and Conditions */}
          <div className="space-y-6">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="certify"
                checked={certifiedAccuracy}
                onChange={(e) => setCertifiedAccuracy(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="certify" className="text-sm text-gray-700">
                Je certifie que les informations fournies sont exactes et complètes.
              </label>
            </div>

            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                J'accepte le{' '}
                <button
                  type="button"
                  className="text-emerald-600 hover:text-emerald-700 underline"
                >
                  contrat d'ouverture de compte Xbank
                </button>
                {' '}et les conditions générales d'utilisation.
              </label>
            </div>
          </div>

          {/* Contract Generation */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start space-x-4">
              <FileText className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-2">Génération du contrat</h4>
                <p className="text-sm text-blue-800 mb-4">
                  Un contrat personnalisé sera généré automatiquement avec vos informations une fois votre inscription validée.
                </p>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => ContractService.previewContract(data)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span className="text-sm font-medium">Aperçu du contrat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => ContractService.downloadContract(data)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-medium">Télécharger</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Erreur d'inscription */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-red-800 font-medium">Erreur lors de l'inscription</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onBack}
              disabled={isSubmitting}
              className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Retour
            </button>
            <button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Inscription en cours...</span>
                </>
              ) : (
                <span>Finaliser l'inscription</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SummaryStep;