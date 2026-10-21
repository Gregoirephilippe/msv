import React from 'react';
import { Check } from 'lucide-react';
import { RegistrationStep } from '../../types/registration';

interface ProgressBarProps {
  currentStep: RegistrationStep;
  completedSteps: RegistrationStep[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, completedSteps }) => {
  const steps = [
    { key: 'personal', label: 'Identité', number: 1 },
    { key: 'address', label: 'Adresse', number: 2 },
    { key: 'professional', label: 'Situation', number: 3 },
    { key: 'credentials', label: 'Compte', number: 4 },
    { key: 'summary', label: 'Validation', number: 5 }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === currentStep);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4 xl:px-8 py-6">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const isCompleted = completedSteps.includes(step.key as RegistrationStep);
            const isCurrent = step.key === currentStep;
            const isAccessible = index <= currentStepIndex;

            return (
              <div key={step.key} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      isCompleted
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? 'bg-emerald-100 text-emerald-600 border-2 border-emerald-500'
                        : isAccessible
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      isCurrent
                        ? 'text-emerald-600'
                        : isAccessible
                        ? 'text-gray-600'
                        : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-0.5 mx-4 ${
                      index < currentStepIndex ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;