import React, { useState } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { AccountCredentials } from '../../types/registration';

interface CredentialsStepProps {
  data: AccountCredentials;
  onChange: (data: AccountCredentials) => void;
  onNext: () => void;
  onBack: () => void;
}

const CredentialsStep: React.FC<CredentialsStepProps> = ({ data, onChange, onNext, onBack }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const handleChange = (field: keyof AccountCredentials, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Password validation
  const passwordValidation = {
    minLength: data.password.length >= 8,
    hasUppercase: /[A-Z]/.test(data.password),
    hasLowercase: /[a-z]/.test(data.password),
    hasNumber: /\d/.test(data.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(data.password)
  };

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = data.password === data.confirmPassword && data.confirmPassword !== '';
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
  const isValid = isEmailValid && isPasswordValid && passwordsMatch;

  const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <div className={`flex items-center space-x-2 ${isValid ? 'text-green-600' : 'text-gray-400'}`}>
      {isValid ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
      <span className="text-sm">{text}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Création de votre compte</h2>
          <p className="text-gray-600">Choisissez vos identifiants de connexion</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Adresse email *
            </label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                data.email && !isEmailValid ? 'border-red-300' : 'border-gray-300 focus:border-emerald-500'
              }`}
              placeholder="votre.email@exemple.com"
              required
            />
            {data.email && !isEmailValid && (
              <p className="mt-1 text-sm text-red-600">Veuillez saisir une adresse email valide</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={data.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Choisissez un mot de passe sécurisé"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            {data.password && (
              <div className="mt-3 space-y-2">
                <ValidationItem isValid={passwordValidation.minLength} text="Au moins 8 caractères" />
                <ValidationItem isValid={passwordValidation.hasUppercase} text="Une majuscule" />
                <ValidationItem isValid={passwordValidation.hasLowercase} text="Une minuscule" />
                <ValidationItem isValid={passwordValidation.hasNumber} text="Un chiffre" />
                <ValidationItem isValid={passwordValidation.hasSpecial} text="Un caractère spécial" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={data.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-emerald-500 transition-colors ${
                  data.confirmPassword && !passwordsMatch ? 'border-red-300' : 'border-gray-300 focus:border-emerald-500'
                }`}
                placeholder="Confirmez votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {data.confirmPassword && !passwordsMatch && (
              <p className="mt-1 text-sm text-red-600">Les mots de passe ne correspondent pas</p>
            )}
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

export default CredentialsStep;