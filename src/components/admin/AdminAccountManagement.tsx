import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  Edit, 
  Trash2, 
  Euro,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Loader2,
  Save,
  X
} from 'lucide-react';
import { AccountService } from '../../services/accountService';
import { TransactionService } from '../../services/transactionService';

interface AdminAccountManagementProps {
  userId: string;
  accounts: any[];
  onAccountsUpdate: () => void;
}

const AdminAccountManagement: React.FC<AdminAccountManagementProps> = ({
  userId,
  accounts,
  onAccountsUpdate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState<string | null>(null);
  const [showBalanceForm, setShowBalanceForm] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    accountType: 'Checking' as 'Checking' | 'Savings' | 'Investment',
    initialBalance: '0.00'
  });

  const [balanceForm, setBalanceForm] = useState({
    newBalance: '',
    reason: '',
    transactionType: 'Deposit' as 'Deposit' | 'Withdrawal' | 'Adjustment'
  });

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Créer le compte
      const newAccount = await AccountService.createAccount(userId, createForm.accountType);
      
      // Si un solde initial est spécifié, l'ajouter
      if (parseFloat(createForm.initialBalance) > 0) {
        await TransactionService.deposit(
          newAccount.id,
          parseFloat(createForm.initialBalance),
          'Dépôt initial - Créé par admin'
        );
      }
      
      setSuccess(`Compte ${createForm.accountType} créé avec succès`);
      setCreateForm({ accountType: 'Checking', initialBalance: '0.00' });
      setShowCreateForm(false);
      onAccountsUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création du compte:', error);
      setError(error.message || 'Erreur lors de la création du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBalanceUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!showBalanceForm) return;
    
    const newBalance = parseFloat(balanceForm.newBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      setError('Le solde doit être un nombre positif');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const account = accounts.find(acc => acc.id === showBalanceForm);
      if (!account) {
        throw new Error('Compte non trouvé');
      }

      const currentBalance = parseFloat(account.balance || '0');
      const difference = newBalance - currentBalance;
      
      // Créer une transaction pour justifier le changement
      if (difference !== 0) {
        if (difference > 0) {
          await TransactionService.deposit(
            showBalanceForm,
            difference,
            `Ajustement de solde par admin: ${balanceForm.reason || 'Correction administrative'}`
          );
        } else {
          await TransactionService.withdraw(
            showBalanceForm,
            Math.abs(difference),
            `Ajustement de solde par admin: ${balanceForm.reason || 'Correction administrative'}`
          );
        }
      }
      
      setSuccess(`Solde mis à jour: ${formatCurrency(newBalance)}`);
      setBalanceForm({ newBalance: '', reason: '', transactionType: 'Deposit' });
      setShowBalanceForm(null);
      onAccountsUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du solde:', error);
      setError(error.message || 'Erreur lors de la mise à jour du solde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId: string) => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return;

    const balance = parseFloat(account.balance || '0');
    if (balance > 0) {
      if (!confirm(`Ce compte a un solde de ${formatCurrency(balance)}. Êtes-vous sûr de vouloir le supprimer ?`)) {
        return;
      }
    } else {
      if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
        return;
      }
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Note: PocketBase ne permet pas de supprimer directement, on peut marquer comme fermé
      // ou implémenter une logique de suppression selon les besoins
      setSuccess('Fonctionnalité de suppression à implémenter selon les règles métier');
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.message || 'Erreur lors de la suppression du compte');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'Checking': return 'Compte courant';
      case 'Savings': return 'Compte épargne';
      case 'Investment': return 'Compte investissement';
      default: return type;
    }
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'Checking': return Wallet;
      case 'Savings': return TrendingUp;
      case 'Investment': return TrendingUp;
      default: return Wallet;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Gestion des comptes bancaires</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouveau compte</span>
        </button>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Liste des comptes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        {accounts.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucun compte bancaire</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Créer le premier compte
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {accounts.map((account) => {
              const AccountIcon = getAccountTypeIcon(account.accountType);
              const balance = parseFloat(account.balance || '0');
              const isEditingBalance = showBalanceForm === account.id;
              
              return (
                <div key={account.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-100 p-3 rounded-full">
                        <AccountIcon className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {getAccountTypeLabel(account.accountType)}
                        </h4>
                        <p className="text-sm text-gray-500 font-mono">
                          {account.accountNumber}
                        </p>
                        <p className="text-xs text-gray-400">
                          ID: {account.id}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {formatCurrency(balance)}
                      </p>
                      <p className="text-sm text-gray-500">{account.currency || 'EUR'}</p>
                    </div>
                  </div>

                  {/* Formulaire de modification du solde */}
                  {isEditingBalance && (
                    <form onSubmit={handleBalanceUpdate} className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="font-medium text-blue-900 mb-3">Modifier le solde</h5>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nouveau solde (€)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={balanceForm.newBalance}
                            onChange={(e) => setBalanceForm(prev => ({ ...prev, newBalance: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder={balance.toString()}
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type d'opération
                          </label>
                          <select
                            value={balanceForm.transactionType}
                            onChange={(e) => setBalanceForm(prev => ({ ...prev, transactionType: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="Deposit">Dépôt</option>
                            <option value="Withdrawal">Retrait</option>
                            <option value="Adjustment">Ajustement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Motif
                          </label>
                          <input
                            type="text"
                            value={balanceForm.reason}
                            onChange={(e) => setBalanceForm(prev => ({ ...prev, reason: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Raison de la modification"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          type="submit"
                          disabled={isLoading || !balanceForm.newBalance}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors flex items-center space-x-2"
                        >
                          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                          <span>Sauvegarder</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowBalanceForm(null);
                            setBalanceForm({ newBalance: '', reason: '', transactionType: 'Deposit' });
                          }}
                          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Actions sur le compte */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => {
                        setShowBalanceForm(account.id);
                        setBalanceForm(prev => ({ ...prev, newBalance: account.balance || '0' }));
                      }}
                      disabled={isLoading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                    >
                      <Euro className="h-4 w-4" />
                      <span>Modifier solde</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteAccount(account.id)}
                      disabled={isLoading}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création de compte */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouveau compte bancaire</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de compte *
                  </label>
                  <select
                    value={createForm.accountType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, accountType: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="Checking">Compte courant</option>
                    <option value="Savings">Compte épargne</option>
                    <option value="Investment">Compte investissement</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Solde initial (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={createForm.initialBalance}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, initialBalance: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Information</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Un IBAN français sera automatiquement généré pour ce compte.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-emerald-500 text-white py-3 rounded-lg hover:bg-emerald-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Créer le compte</span>
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

export default AdminAccountManagement;