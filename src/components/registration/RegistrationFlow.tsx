import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { RegistrationData, RegistrationStep } from '../../types/registration';
import ProgressBar from './ProgressBar';
import PersonalInfoStep from './PersonalInfoStep';
import AddressStep from './AddressStep';
import ProfessionalStep from './ProfessionalStep';
import CredentialsStep from './CredentialsStep';
import SummaryStep from './SummaryStep';
import { AuthService } from '../../services/authService';
import { BANK_CONFIG } from '../../config/constants';

const RegistrationFlow: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('personal');
  const [completedSteps, setCompletedSteps] = useState<RegistrationStep[]>([]);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    personalInfo: {
      firstName: '',
      lastName: '',
      gender: undefined,
      dateOfBirth: '',
      nationality: ''
    },
    addressInfo: {
      street: '',
      postalCode: '',
      city: '',
      country: ''
    },
    professionalInfo: {
      profession: '',
      status: 'employee',
      monthlyIncome: ''
    },
    credentials: {
      email: '',
      password: '',
      confirmPassword: ''
    },
    acceptedTerms: false,
    certifiedAccuracy: false
  });

  const steps: RegistrationStep[] = ['personal', 'address', 'professional', 'credentials', 'summary'];

  const goToStep = (step: RegistrationStep) => {
    setCurrentStep(step);
  };

  const goToNextStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      const nextStep = steps[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // Mark current step as completed
      if (!completedSteps.includes(currentStep)) {
        setCompletedSteps([...completedSteps, currentStep]);
      }
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handlePersonalInfoChange = (data: typeof registrationData.personalInfo) => {
    setRegistrationData(prev => ({ ...prev, personalInfo: data }));
  };

  const handleAddressChange = (data: typeof registrationData.addressInfo) => {
    setRegistrationData(prev => ({ ...prev, addressInfo: data }));
  };

  const handleProfessionalChange = (data: typeof registrationData.professionalInfo) => {
    setRegistrationData(prev => ({ ...prev, professionalInfo: data }));
  };

  const handleCredentialsChange = (data: typeof registrationData.credentials) => {
    setRegistrationData(prev => ({ ...prev, credentials: data }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setRegistrationError(null);
    
    try {
      // Mettre à jour les données avec les cases cochées
      const finalData = {
        ...registrationData,
        acceptedTerms: true,
        certifiedAccuracy: true
      };
      
      // Inscrire l'utilisateur via l'API
      const user = await AuthService.register(finalData);
      
      console.log('Utilisateur créé avec succès:', user);
      
      // Marquer l'inscription comme terminée
      setRegistrationComplete(true);
      
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      setRegistrationError(error.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Écran de succès après inscription
  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-emerald-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande reçue avec succès !</h2>
              <p className="text-gray-600">
                Votre demande d'ouverture de compte {BANK_CONFIG.name} a été transmise avec succès.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Prochaines étapes :</strong><br />
                1. Examen de votre dossier par nos équipes<br />
                2. Validation et activation de votre compte<br />
              </p>
            </div>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition-colors"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmitOld = () => {
    // Mark summary step as completed
    setCompletedSteps([...completedSteps, 'summary']);
    
    // Here you would typically send the data to your backend
    console.log('Registration data:', registrationData);
    
    // For now, just show an alert
    alert('Inscription réussie ! Vous allez recevoir un email de confirmation.');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'personal':
        return (
          <PersonalInfoStep
            data={registrationData.personalInfo}
            onChange={handlePersonalInfoChange}
            onNext={goToNextStep}
          />
        );
      case 'address':
        return (
          <AddressStep
            data={registrationData.addressInfo}
            onChange={handleAddressChange}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'professional':
        return (
          <ProfessionalStep
            data={registrationData.professionalInfo}
            onChange={handleProfessionalChange}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'credentials':
        return (
          <CredentialsStep
            data={registrationData.credentials}
            onChange={handleCredentialsChange}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        );
      case 'summary':
        return (
          <SummaryStep
            data={registrationData}
            onEdit={goToStep}
            onSubmit={handleSubmit}
            onBack={goToPreviousStep}
            isSubmitting={isSubmitting}
            error={registrationError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 xl:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Ouverture de compte {BANK_CONFIG.name}</h1>
                <p className="text-sm text-gray-600">Inscription sécurisée - Banque privée</p>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Patrimoine d'exception
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep} completedSteps={completedSteps} />

      {/* Main Content */}
      <main className="container mx-auto px-4 xl:px-8 py-8">
        {renderCurrentStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 xl:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="text-sm text-gray-600">
              Besoin d'aide ? <a href="#" className="text-emerald-600 hover:text-emerald-700">Contactez notre support</a>
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-700">Politique de confidentialité</a>
              <a href="#" className="hover:text-gray-700">Conditions d'utilisation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RegistrationFlow;