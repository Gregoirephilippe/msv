import React, { useState, useEffect } from 'react';
import { 
  PiggyBank, 
  Plus, 
  Target, 
  TrendingUp, 
  Calendar,
  Euro,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  BarChart3,
  Coins,
  Gift
} from 'lucide-react';
import { Account, Transaction } from '../../lib/pocketbase';
import { AccountService } from '../../services/accountService';
import { SavingsService, SavingsGoal } from '../../services/savingsService';

interface SavingsSectionProps {
  user: any;
}

const SavingsSection: React.FC<SavingsSectionProps> = ({ user }) => {
  const [savingsAccounts, setSavingsAccounts] = useState<Account[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewGoalModal, setShowNewGoalModal] = useState(false);
  const [newGoalForm, setNewGoalForm] = useState({
    name: '',
    description: '',
    targetAmount: '',
    targetDate: '',
    category: 'other' as SavingsGoal['category']
  });
  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [goalError, setGoalError] = useState<string | null>(null);

  useEffect(() => {
    loadSavingsData();
  }, [user?.id]);

  const loadSavingsData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les comptes épargne
      const userAccounts = await AccountService.getUserAccounts(user.id);
      const savingsAccounts = userAccounts.filter(acc => acc.accountType === 'Savings');
      setSavingsAccounts(savingsAccounts);
      
      // Charger les objectifs d'épargne réels
      const userGoals = await SavingsService.getUserSavingsGoals(user.id);
      setSavingsGoals(userGoals);
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des données d\'épargne:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.targetDate) {
      setGoalError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const targetAmount = parseFloat(newGoalForm.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      setGoalError('Le montant cible doit être un nombre positif');
      return;
    }

    try {
      setIsCreatingGoal(true);
      setGoalError(null);
      
      await SavingsService.createSavingsGoal(
        user.id,
        newGoalForm.name,
        targetAmount,
        newGoalForm.targetDate,
        newGoalForm.category,
        newGoalForm.description
      );
      
      // Recharger les données
      await loadSavingsData();
      
      // Reset du formulaire
      setNewGoalForm({
        name: '',
        description: '',
        targetAmount: '',
        targetDate: '',
        category: 'other'
      });
      
      setShowNewGoalModal(false);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      setGoalError(error.message || 'Erreur lors de la création de l\'objectif');
    } finally {
      setIsCreatingGoal(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet objectif ?')) {
      return;
    }

    try {
      await SavingsService.deleteSavingsGoal(goalId);
      await loadSavingsData();
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      alert('Erreur lors de la suppression de l\'objectif');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'vacation': return <Gift className="h-5 w-5" />;
      case 'emergency': return <CheckCircle className="h-5 w-5" />;
      case 'purchase': return <Coins className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'vacation': return 'Vacances';
      case 'emergency': return 'Urgence';
      case 'purchase': return 'Achat';
      default: return 'Autre';
    }
  };

  const getColorForCategory = (category: string) => {
    switch (category) {
      case 'vacation': return 'bg-blue-500';
      case 'emergency': return 'bg-green-500';
      case 'purchase': return 'bg-purple-500';
      case 'education': return 'bg-yellow-500';
      case 'retirement': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0) +
                     savingsGoals.reduce((sum, goal) => sum + (goal.currentAmount || 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadSavingsData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mes espaces</h2>
          <p className="text-gray-600">
            Total épargné : {formatCurrency(totalSavings)}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Target className="h-4 w-4" />
            <span>Nouvel objectif</span>
          </button>
        </div>
      </div>

      {/* Vue d'ensemble */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <PiggyBank className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Total épargné</h3>
              <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSavings)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Objectifs actifs</h3>
              <p className="text-2xl font-bold text-blue-600">{savingsGoals.filter(g => g.isActive).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Comptes épargne</h3>
              <p className="text-2xl font-bold text-purple-600">{savingsAccounts.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Objectifs d'épargne */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Mes objectifs</h3>
          <button
            onClick={() => setShowNewGoalModal(true)}
            className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
          >
            Ajouter un objectif
          </button>
        </div>

        {savingsGoals.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Aucun objectif défini</p>
            <p className="text-sm text-gray-400">Créez votre premier objectif d'épargne</p>
          </div>
        ) : (
          <div className="space-y-4">
            {savingsGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = calculateDaysRemaining(goal.targetDate);
              const color = getColorForCategory(goal.category);
              
              return (
                <div key={goal.id} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        {getCategoryIcon(goal.category)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{goal.name}</h4>
                        <p className="text-sm text-gray-500">{getCategoryLabel(goal.category)}</p>
                        {goal.description && (
                          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-gray-600">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Progression</span>
                      <span className="text-sm font-medium text-gray-900">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${color} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">
                        {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                      </span>
                      <span className="text-gray-500">
                        {daysRemaining > 0 ? `${daysRemaining} jours restants` : 'Objectif atteint !'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <button className="flex-1 bg-emerald-500 text-white py-2 px-4 rounded-lg hover:bg-emerald-600 transition-colors">
                        Alimenter
                      </button>
                      <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Comptes épargne */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Comptes épargne</h3>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            Ouvrir un compte épargne
          </button>
        </div>

        {savingsAccounts.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PiggyBank className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">Aucun compte épargne</p>
            <p className="text-sm text-gray-400">Ouvrez votre premier compte épargne pour commencer</p>
            <button className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
              Ouvrir un compte épargne
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {savingsAccounts.map((account) => (
              <div key={account.id} className="border border-gray-200 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Compte épargne</h4>
                    <p className="text-sm text-gray-500">•••• {account.accountNumber?.slice(-4)}</p>
                  </div>
                  <div className="flex items-center space-x-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs">Actif</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Solde</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(parseFloat(account.balance || '0'))}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taux d'intérêt</span>
                    <span className="text-sm font-medium text-green-600">
                      4.2% APY
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ouvert le</span>
                    <span className="text-sm text-gray-900">
                      {account.created ? formatDate(account.created) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
                      Alimenter
                    </button>
                    <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors">
                      Gérer
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création d'objectif */}
      {showNewGoalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvel objectif d'épargne</h3>
                <button
                  onClick={() => {
                    setShowNewGoalModal(false);
                    setGoalError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>

              {goalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{goalError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'objectif *
                  </label>
                  <input
                    type="text"
                    value={newGoalForm.name}
                    onChange={(e) => setNewGoalForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: Vacances été 2025"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newGoalForm.description}
                    onChange={(e) => setNewGoalForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Ex: Voyage en Grèce"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant cible *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      value={newGoalForm.targetAmount}
                      onChange={(e) => setNewGoalForm(prev => ({ ...prev, targetAmount: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="2000"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date cible *
                    </label>
                    <input
                      type="date"
                      value={newGoalForm.targetDate}
                      onChange={(e) => setNewGoalForm(prev => ({ ...prev, targetDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      min={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={newGoalForm.category}
                    onChange={(e) => setNewGoalForm(prev => ({ ...prev, category: e.target.value as SavingsGoal['category'] }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="vacation">Vacances</option>
                    <option value="emergency">Urgence</option>
                    <option value="purchase">Achat</option>
                    <option value="education">Éducation</option>
                    <option value="retirement">Retraite</option>
                    <option value="other">Autre</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewGoalModal(false);
                      setGoalError(null);
                    }}
                    disabled={isCreatingGoal}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingGoal || !newGoalForm.name || !newGoalForm.targetAmount || !newGoalForm.targetDate}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isCreatingGoal ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        <span>Créer l'objectif</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsSection;