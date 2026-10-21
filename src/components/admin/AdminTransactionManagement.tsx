import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Euro,
  Send,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Calendar,
  Receipt
} from 'lucide-react';
import { TransactionService } from '../../services/transactionService';
import { pb } from '../../lib/pocketbase';

interface AdminTransactionManagementProps {
  userId: string;
  accounts: any[];
  transactions: any[];
  onTransactionsUpdate: () => void;
}

const AdminTransactionManagement: React.FC<AdminTransactionManagementProps> = ({
  userId,
  accounts,
  transactions,
  onTransactionsUpdate
}) => {
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [transactionForm, setTransactionForm] = useState({
    accountId: '',
    type: 'Deposit',
    customType: '',
    useCustomType: false,
    amount: '',
    description: '',
    beneficiaryName: '',
    beneficiaryIban: '',
    reference: '',
    transactionDate: new Date().toISOString().split('T')[0], // Date du jour par défaut
    transactionTime: new Date().toTimeString().slice(0, 5), // Heure actuelle par défaut
    status: 'Completed' as 'Pending' | 'Completed' | 'Failed' | 'Cancelled'
  });

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionForm.accountId || !transactionForm.amount || !transactionForm.description) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const amount = parseFloat(transactionForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setError('Le montant doit être un nombre positif');
      return;
    }

    // Déterminer le type final à utiliser
    const finalType = transactionForm.useCustomType && transactionForm.customType.trim() 
      ? transactionForm.customType.trim() 
      : transactionForm.type;

    try {
      setIsLoading(true);
      setError(null);
      
      // Créer la transaction avec le type personnalisé si nécessaire
      if (transactionForm.useCustomType && transactionForm.customType.trim()) {
        // Transaction personnalisée - créer directement
        const transactionDateTime = new Date(`${transactionForm.transactionDate}T${transactionForm.transactionTime}:00`).toISOString();
        
        const transactionData = {
          accountId: transactionForm.accountId,
          type: finalType,
          amount: transactionForm.type === 'Withdrawal' || transactionForm.type === 'Transfer_Out' || transactionForm.type === 'Fee' ? -amount : amount,
          currency: 'EUR',
          description: transactionForm.description,
          beneficiaryName: transactionForm.beneficiaryName || undefined,
          beneficiaryIBAN: transactionForm.beneficiaryIban || undefined,
          reference: transactionForm.reference || undefined,
          transactionDate: transactionDateTime,
          status: transactionForm.status
        };

        await TransactionService.createTransaction(transactionData);

        // Mettre à jour le solde seulement si la transaction est terminée
        if (transactionForm.status === 'Completed') {
          const account = accounts.find(acc => acc.id === transactionForm.accountId);
          if (account) {
            const currentBalance = parseFloat(account.balance || '0');
            const transactionAmount = transactionData.amount;
            const newBalance = currentBalance + transactionAmount;
            await AccountService.updateBalance(transactionForm.accountId, newBalance.toFixed(2));
          }
        }
      } else {
        // Transaction standard
        const transactionDateTime = new Date(`${transactionForm.transactionDate}T${transactionForm.transactionTime}:00`).toISOString();
        
        switch (transactionForm.type) {
        case 'Deposit':
          if (transactionForm.status === 'Completed') {
            // Pour les dépôts avec date personnalisée, créer directement la transaction
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Deposit',
              amount: amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: 'Completed'
            });
            
            // Mettre à jour le solde manuellement
            const account = accounts.find(acc => acc.id === transactionForm.accountId);
            if (account) {
              const currentBalance = parseFloat(account.balance || '0');
              const newBalance = currentBalance + amount;
              await pb.collection('Accounts').update(transactionForm.accountId, {
                balance: newBalance.toFixed(2)
              });
            }
          } else {
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Deposit',
              amount: amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: transactionForm.status
            });
          }
          break;
          
        case 'Withdrawal':
          if (transactionForm.status === 'Completed') {
            // Pour les retraits avec date personnalisée, créer directement la transaction
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Withdrawal',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: 'Completed'
            });
            
            // Mettre à jour le solde manuellement
            const account = accounts.find(acc => acc.id === transactionForm.accountId);
            if (account) {
              const currentBalance = parseFloat(account.balance || '0');
              if (currentBalance < amount) {
                throw new Error('Solde insuffisant');
              }
              const newBalance = currentBalance - amount;
              await pb.collection('Accounts').update(transactionForm.accountId, {
                balance: newBalance.toFixed(2)
              });
            }
          } else {
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Withdrawal',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: transactionForm.status
            });
          }
          break;
          
        case 'Transfer_Out':
          if (!transactionForm.beneficiaryName || !transactionForm.beneficiaryIban) {
            setError('Nom et IBAN du bénéficiaire requis pour un virement');
            return;
          }
          if (transactionForm.status === 'Completed') {
            // Pour les virements avec date personnalisée, créer directement la transaction
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Transfer_Out',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              beneficiaryName: transactionForm.beneficiaryName,
              beneficiaryIBAN: transactionForm.beneficiaryIban,
              reference: transactionForm.reference,
              transactionDate: transactionDateTime,
              status: 'Completed'
            });
            
            // Mettre à jour le solde manuellement
            const account = accounts.find(acc => acc.id === transactionForm.accountId);
            if (account) {
              const currentBalance = parseFloat(account.balance || '0');
              if (currentBalance < amount) {
                throw new Error('Solde insuffisant');
              }
              const newBalance = currentBalance - amount;
              await pb.collection('Accounts').update(transactionForm.accountId, {
                balance: newBalance.toFixed(2)
              });
            }
          } else {
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Transfer_Out',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              beneficiaryName: transactionForm.beneficiaryName,
              beneficiaryIBAN: transactionForm.beneficiaryIban,
              reference: transactionForm.reference,
              transactionDate: transactionDateTime,
              status: transactionForm.status
            });
          }
          break;
          
        case 'Fee':
          if (transactionForm.status === 'Completed') {
            // Pour les frais avec date personnalisée, créer directement la transaction
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Fee',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: 'Completed'
            });
            
            // Mettre à jour le solde manuellement
            const account = accounts.find(acc => acc.id === transactionForm.accountId);
            if (account) {
              const currentBalance = parseFloat(account.balance || '0');
              if (currentBalance < amount) {
                throw new Error('Solde insuffisant');
              }
              const newBalance = currentBalance - amount;
              await pb.collection('Accounts').update(transactionForm.accountId, {
                balance: newBalance.toFixed(2)
              });
            }
          } else {
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Fee',
              amount: -amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: transactionForm.status
            });
          }
          break;
          
        case 'Interest':
          if (transactionForm.status === 'Completed') {
            // Pour les intérêts avec date personnalisée, créer directement la transaction
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Interest',
              amount: amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: 'Completed'
            });
            
            // Mettre à jour le solde manuellement
            const account = accounts.find(acc => acc.id === transactionForm.accountId);
            if (account) {
              const currentBalance = parseFloat(account.balance || '0');
              const newBalance = currentBalance + amount;
              await pb.collection('Accounts').update(transactionForm.accountId, {
                balance: newBalance.toFixed(2)
              });
            }
          } else {
            await TransactionService.createTransaction({
              accountId: transactionForm.accountId,
              type: 'Interest',
              amount: amount,
              currency: 'EUR',
              description: transactionForm.description,
              transactionDate: transactionDateTime,
              status: transactionForm.status
            });
          }
          break;
        }
      }
      
      setSuccess(`Transaction ${getTransactionTypeLabel(finalType)} de ${formatCurrency(amount)} créée avec succès`);
      setTransactionForm({
        accountId: '',
        type: 'Deposit',
        customType: '',
        useCustomType: false,
        amount: '',
        description: '',
        beneficiaryName: '',
        beneficiaryIban: '',
        reference: '',
        transactionDate: new Date().toISOString().split('T')[0],
        transactionTime: new Date().toTimeString().slice(0, 5),
        status: 'Completed'
      });
      setShowTransactionForm(false);
      onTransactionsUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création de la transaction:', error);
      setError(error.message || 'Erreur lors de la création de la transaction');
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAccountName = (accountId: string): string => {
    const account = accounts.find(acc => acc.id === accountId);
    if (!account) return 'Compte inconnu';
    
    switch (account.accountType) {
      case 'Checking': return 'Compte courant';
      case 'Savings': return 'Compte épargne';
      case 'Investment': return 'Compte investissement';
      default: return account.accountType || 'Compte';
    }
  };

  const getTransactionTypeLabel = (type: string) => {
    switch (type) {
      case 'Deposit': return 'Dépôt';
      case 'Withdrawal': return 'Retrait';
      case 'Transfer_Out': return 'Virement sortant';
      case 'Fee': return 'Frais';
      case 'Interest': return 'Intérêts';
      default: return type;
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'Deposit':
      case 'Interest':
        return <ArrowDownLeft className="h-5 w-5 text-green-600" />;
      case 'Withdrawal':
      case 'Transfer_Out':
      case 'Fee':
        return <ArrowUpRight className="h-5 w-5 text-red-600" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Gestion des transactions</h3>
        <button
          onClick={() => setShowTransactionForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle transaction</span>
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

      {/* Actions rapides */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setTransactionForm(prev => ({ ...prev, type: 'Deposit' }));
            setShowTransactionForm(true);
          }}
          className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ArrowDownLeft className="h-6 w-6 text-green-600" />
            <div className="text-left">
              <p className="font-medium text-green-900">Dépôt</p>
              <p className="text-sm text-green-700">Créditer le compte</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setTransactionForm(prev => ({ ...prev, type: 'Withdrawal' }));
            setShowTransactionForm(true);
          }}
          className="bg-red-50 border border-red-200 rounded-lg p-4 hover:bg-red-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <ArrowUpRight className="h-6 w-6 text-red-600" />
            <div className="text-left">
              <p className="font-medium text-red-900">Retrait</p>
              <p className="text-sm text-red-700">Débiter le compte</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setTransactionForm(prev => ({ ...prev, type: 'Transfer_Out' }));
            setShowTransactionForm(true);
          }}
          className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Send className="h-6 w-6 text-blue-600" />
            <div className="text-left">
              <p className="font-medium text-blue-900">Virement</p>
              <p className="text-sm text-blue-700">Envoyer de l'argent</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => {
            setTransactionForm(prev => ({ ...prev, type: 'Interest' }));
            setShowTransactionForm(true);
          }}
          className="bg-purple-50 border border-purple-200 rounded-lg p-4 hover:bg-purple-100 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <Euro className="h-6 w-6 text-purple-600" />
            <div className="text-left">
              <p className="font-medium text-purple-900">Intérêts</p>
              <p className="text-sm text-purple-700">Ajouter des intérêts</p>
            </div>
          </div>
        </button>
      </div>

      {/* Historique des transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Transactions récentes</h4>
        
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune transaction</p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getTransactionIcon(transaction.type || '')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description || 'Transaction'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{getAccountName(transaction.accountId || '')}</span>
                      <span>•</span>
                      <span>{transaction.transactionDate ? formatDate(transaction.transactionDate) : 'Date inconnue'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${(transaction.amount || 0) > 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {formatCurrency(transaction.amount || 0)}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transaction.status?.toLowerCase() || 'pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création de transaction */}
      {showTransactionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvelle transaction administrative</h3>
                <button
                  onClick={() => setShowTransactionForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTransaction} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compte *
                    </label>
                    <select
                      value={transactionForm.accountId}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, accountId: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="">Sélectionner un compte</option>
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {getAccountName(account.id)} - {formatCurrency(parseFloat(account.balance || '0'))}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Statut de la transaction *
                    </label>
                    <select
                      value={transactionForm.status}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, status: e.target.value as any }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="Completed">Terminée (solde mis à jour)</option>
                      <option value="Pending">En attente</option>
                      <option value="Failed">Échouée</option>
                      <option value="Cancelled">Annulée</option>
                    </select>
                  </div>
                </div>

                {/* Type de transaction */}
                <div>
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="useCustomType"
                      checked={transactionForm.useCustomType}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, useCustomType: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="useCustomType" className="text-sm font-medium text-gray-700">
                      Utiliser un type de transaction personnalisé
                    </label>
                  </div>

                  {transactionForm.useCustomType ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type personnalisé *
                      </label>
                      <input
                        type="text"
                        value={transactionForm.customType}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, customType: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Ex: Bonus, Remboursement, Correction..."
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de transaction *
                      </label>
                      <select
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      >
                        <option value="Deposit">Dépôt (+)</option>
                        <option value="Withdrawal">Retrait (-)</option>
                        <option value="Transfer_Out">Virement sortant (-)</option>
                        <option value="Fee">Frais (-)</option>
                        <option value="Interest">Intérêts (+)</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={transactionForm.amount}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="100.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence (optionnel)
                    </label>
                    <input
                      type="text"
                      value={transactionForm.reference}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, reference: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="REF-ADMIN-001"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    value={transactionForm.description}
                    onChange={(e) => setTransactionForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Ex: Dépôt initial, Correction de solde, Remboursement client..."
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Cette description apparaîtra telle quelle dans l'historique du client
                  </p>
                </div>

                {/* Champs spécifiques aux virements */}
                {transactionForm.type === 'Transfer_Out' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-4">
                    <h5 className="font-medium text-blue-900">Informations du bénéficiaire</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nom du bénéficiaire *
                        </label>
                        <input
                          type="text"
                          value={transactionForm.beneficiaryName}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Jean Dupont"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          IBAN du bénéficiaire *
                        </label>
                        <input
                          type="text"
                          value={transactionForm.beneficiaryIban}
                          onChange={(e) => setTransactionForm(prev => ({ ...prev, beneficiaryIban: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="FR76 1234 5678 9012 3456 7890 123"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de transaction *
                    </label>
                    <input
                      type="date"
                      value={transactionForm.transactionDate}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionDate: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <input
                      type="time"
                      value={transactionForm.transactionTime}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, transactionTime: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800 font-medium">Transaction administrative</p>
                      <p className="text-sm text-yellow-700 mt-1">
                        Date de transaction : {new Date(`${transactionForm.transactionDate}T${transactionForm.transactionTime}:00`).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                        <br />
                        {transactionForm.status === 'Completed' 
                          ? 'Le solde du compte sera automatiquement mis à jour.'
                          : 'Le solde du compte ne sera pas modifié (transaction non terminée).'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowTransactionForm(false)}
                    disabled={isLoading}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !transactionForm.accountId || !transactionForm.amount || !transactionForm.description || !transactionForm.transactionDate || !transactionForm.transactionTime || (transactionForm.useCustomType && !transactionForm.customType.trim()) || (transactionForm.type === 'Transfer_Out' && (!transactionForm.beneficiaryName || !transactionForm.beneficiaryIban))}
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
                        <span>Créer la transaction</span>
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

export default AdminTransactionManagement;