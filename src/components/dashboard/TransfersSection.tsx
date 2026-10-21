import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  User, 
  Building, 
  Euro, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Loader2,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Edit,
  Search,
  Filter
} from 'lucide-react';
import { Account, Transaction } from '../../lib/pocketbase';
import { AccountService } from '../../services/accountService';
import { TransactionService } from '../../services/transactionService';
import { BeneficiaryService, Beneficiary } from '../../services/beneficiaryService';

interface TransfersSectionProps {
  user: any;
}

interface TransferForm {
  fromAccountId: string;
  toAccountId?: string;
  beneficiaryId?: string;
  beneficiaryName: string;
  beneficiaryIban: string;
  beneficiaryBic: string;
  beneficiaryBank: string;
  amount: string;
  description: string;
  reference: string;
  scheduledDate?: string;
  isRecurring: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'quarterly';
}

interface NewBeneficiaryForm {
  name: string;
  iban: string;
  bic: string;
  bankName: string;
  category: Beneficiary['category'];
  isFavorite: boolean;
  notes: string;
}

const TransfersSection: React.FC<TransfersSectionProps> = ({ user }) => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [recentTransfers, setRecentTransfers] = useState<Transaction[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États du formulaire
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferForm, setTransferForm] = useState<TransferForm>({
    fromAccountId: '',
    beneficiaryName: '',
    beneficiaryIban: '',
    beneficiaryBic: '',
    beneficiaryBank: '',
    amount: '',
    description: '',
    reference: '',
    isRecurring: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);
  
  // États des bénéficiaires
  const [showBeneficiaryForm, setShowBeneficiaryForm] = useState(false);
  const [newBeneficiary, setNewBeneficiary] = useState<NewBeneficiaryForm>({
    name: '',
    iban: '',
    bic: '',
    bankName: '',
    category: 'other',
    isFavorite: false,
    notes: ''
  });
  const [isSavingBeneficiary, setIsSavingBeneficiary] = useState(false);
  const [beneficiaryError, setBeneficiaryError] = useState<string | null>(null);
  
  // Filtres et recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sent' | 'received'>('all');

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les comptes
      const userAccounts = await AccountService.getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      // Charger les virements récents
      const userTransactions = await TransactionService.getUserTransactions(user.id, 20);
      const transfers = userTransactions.filter(t => 
        t.type === 'Transfer_In' || t.type === 'Transfer_Out'
      );
      setRecentTransfers(transfers);
      
      // Charger les bénéficiaires réels
      const userBeneficiaries = await BeneficiaryService.getUserBeneficiaries(user.id);
      setBeneficiaries(userBeneficiaries);
      
      // Sélectionner le premier compte par défaut
      if (userAccounts.length > 0) {
        setTransferForm(prev => ({ ...prev, fromAccountId: userAccounts[0].id }));
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des données:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transferForm.fromAccountId || !transferForm.amount || !transferForm.beneficiaryName) {
      setTransferError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const amount = parseFloat(transferForm.amount);
    if (isNaN(amount) || amount <= 0) {
      setTransferError('Le montant doit être un nombre positif');
      return;
    }

    try {
      setIsSubmitting(true);
      setTransferError(null);
      
      // Vérifier le solde
      const fromAccount = accounts.find(acc => acc.id === transferForm.fromAccountId);
      if (!fromAccount) {
        throw new Error('Compte source non trouvé');
      }
      
      const currentBalance = parseFloat(fromAccount.balance || '0');
      if (currentBalance < amount) {
        throw new Error('Solde insuffisant');
      }

      // Si c'est un virement interne (entre comptes de l'utilisateur)
      if (transferForm.toAccountId) {
        await TransactionService.transfer(
          transferForm.fromAccountId,
          transferForm.toAccountId,
          amount,
          transferForm.description || `Virement interne`,
          transferForm.beneficiaryName,
          transferForm.beneficiaryIban,
          transferForm.reference
        );
      } else {
        // Virement externe - utiliser la méthode dédiée
        await TransactionService.externalTransfer(
          user.id,
          transferForm.fromAccountId,
          amount,
          transferForm.beneficiaryName,
          transferForm.beneficiaryIban,
          transferForm.description || `Virement vers ${transferForm.beneficiaryName}`,
          transferForm.reference,
          transferForm.beneficiaryBank
        );
      }

      setTransferSuccess(`Virement de ${amount}€ vers ${transferForm.beneficiaryName} en cours de traitement`);
      
      // Reset du formulaire
      setTransferForm({
        fromAccountId: accounts[0]?.id || '',
        beneficiaryName: '',
        beneficiaryIban: '',
        beneficiaryBic: '',
        beneficiaryBank: '',
        amount: '',
        description: '',
        reference: '',
        isRecurring: false
      });
      
      // Recharger les données
      await loadData();
      
      // Fermer le formulaire après 2 secondes
      setTimeout(() => {
        setShowTransferForm(false);
        setTransferSuccess(null);
      }, 2000);
      
    } catch (error: any) {
      console.error('Erreur lors du virement:', error);
      setTransferError(error.message || 'Erreur lors du virement');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectBeneficiary = (beneficiary: Beneficiary) => {
    setTransferForm(prev => ({
      ...prev,
      beneficiaryName: beneficiary.name,
      beneficiaryIban: beneficiary.iban,
      beneficiaryBic: beneficiary.bic || '',
      beneficiaryBank: beneficiary.bankName || ''
    }));
  };

  const handleSaveBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newBeneficiary.name || !newBeneficiary.iban) {
      setBeneficiaryError('Nom et IBAN sont obligatoires');
      return;
    }

    if (!BeneficiaryService.validateIban(newBeneficiary.iban)) {
      setBeneficiaryError('IBAN invalide');
      return;
    }

    try {
      setIsSavingBeneficiary(true);
      setBeneficiaryError(null);
      
      await BeneficiaryService.createBeneficiary(
        user.id,
        newBeneficiary.name,
        newBeneficiary.iban,
        newBeneficiary.bic,
        newBeneficiary.bankName,
        newBeneficiary.category,
        newBeneficiary.isFavorite,
        newBeneficiary.notes
      );
      
      // Recharger les bénéficiaires
      await loadData();
      
      // Reset du formulaire
      setNewBeneficiary({
        name: '',
        iban: '',
        bic: '',
        bankName: '',
        category: 'other',
        isFavorite: false,
        notes: ''
      });
      
      setShowBeneficiaryForm(false);
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      setBeneficiaryError(error.message || 'Erreur lors de la sauvegarde du bénéficiaire');
    } finally {
      setIsSavingBeneficiary(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatIban = (iban: string) => {
    return BeneficiaryService.formatIban(iban);
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

  const getTransferIcon = (type: string) => {
    return type === 'Transfer_In' 
      ? <ArrowRight className="h-5 w-5 text-green-600 rotate-180" />
      : <ArrowRight className="h-5 w-5 text-blue-600" />;
  };

  const filteredTransfers = recentTransfers.filter(transfer => {
    const matchesSearch = !searchQuery || 
      transfer.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transfer.beneficiaryName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' ||
      (selectedFilter === 'sent' && transfer.type === 'Transfer_Out') ||
      (selectedFilter === 'received' && transfer.type === 'Transfer_In');
    
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
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
              onClick={loadData}
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
          <h2 className="text-2xl font-bold text-gray-900">Virements</h2>
          <p className="text-gray-600">Effectuez vos virements et gérez vos bénéficiaires</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowBeneficiaryForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span>Nouveau bénéficiaire</span>
          </button>
          <button
            onClick={() => setShowTransferForm(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Nouveau virement</span>
          </button>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-emerald-100 p-3 rounded-full">
              <Send className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Virement instantané</h3>
              <p className="text-sm text-gray-600">Envoyez de l'argent immédiatement</p>
            </div>
          </div>
          <button
            onClick={() => setShowTransferForm(true)}
            className="w-full bg-emerald-50 text-emerald-700 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
          >
            Effectuer un virement
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mes bénéficiaires</h3>
              <p className="text-sm text-gray-600">{beneficiaries.length} bénéficiaire{beneficiaries.length > 1 ? 's' : ''}</p>
            </div>
          </div>
          <button
            onClick={() => setShowBeneficiaryForm(true)}
            className="w-full bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors"
          >
            Gérer les bénéficiaires
          </button>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Virements programmés</h3>
              <p className="text-sm text-gray-600">Planifiez vos paiements</p>
            </div>
          </div>
          <button className="w-full bg-purple-50 text-purple-700 py-2 rounded-lg hover:bg-purple-100 transition-colors">
            Programmer un virement
          </button>
        </div>
      </div>

      {/* Bénéficiaires favoris */}
      {beneficiaries.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bénéficiaires favoris</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {beneficiaries.filter(b => b.isFavorite).map((beneficiary) => (
              <div key={beneficiary.id} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-100 p-2 rounded-full">
                      <User className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{beneficiary.name}</p>
                      <p className="text-sm text-gray-500">{beneficiary.bankName || 'Banque inconnue'}</p>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-3">
                  {formatIban(beneficiary.iban)}
                </p>
                <button
                  onClick={() => {
                    selectBeneficiary(beneficiary);
                    setShowTransferForm(true);
                  }}
                  className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition-colors text-sm"
                >
                  Envoyer de l'argent
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des virements */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Historique des virements</h3>
          
          {/* Recherche et filtres */}
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
              />
            </div>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value as 'all' | 'sent' | 'received')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            >
              <option value="all">Tous</option>
              <option value="sent">Envoyés</option>
              <option value="received">Reçus</option>
            </select>
          </div>
        </div>

        {filteredTransfers.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-2">
              {recentTransfers.length === 0 ? 'Aucun virement effectué' : 'Aucun résultat trouvé'}
            </p>
            <p className="text-sm text-gray-400">
              {recentTransfers.length === 0 
                ? 'Vos virements apparaîtront ici' 
                : 'Essayez de modifier vos critères de recherche'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransfers.map((transfer) => (
              <div key={transfer.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="bg-gray-100 p-2 rounded-full">
                    {getTransferIcon(transfer.type || '')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {transfer.type === 'Transfer_In' ? 'Virement reçu' : 'Virement envoyé'}
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{transfer.beneficiaryName || transfer.description}</span>
                      <span>•</span>
                      <span>{getAccountName(transfer.accountId || '')}</span>
                      <span>•</span>
                      <span>{transfer.transactionDate ? formatDate(transfer.transactionDate) : 'Date inconnue'}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${transfer.type === 'Transfer_In' ? 'text-green-600' : 'text-gray-900'}`}>
                    {transfer.type === 'Transfer_In' ? '+' : ''}{formatCurrency(Math.abs(transfer.amount || 0))}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {transfer.status?.toLowerCase() || 'pending'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de nouveau virement */}
      {showTransferForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouveau virement</h3>
                <button
                  onClick={() => {
                    setShowTransferForm(false);
                    setTransferError(null);
                    setTransferSuccess(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>

              {transferSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-green-800">{transferSuccess}</p>
                  </div>
                </div>
              )}

              {transferError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{transferError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleTransferSubmit} className="space-y-6">
                {/* Compte source */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Débiter le compte *
                  </label>
                  <select
                    value={transferForm.fromAccountId}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, fromAccountId: e.target.value }))}
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

                {/* Bénéficiaire */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom du bénéficiaire *
                    </label>
                    <input
                      type="text"
                      value={transferForm.beneficiaryName}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, beneficiaryName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Nom complet"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN du bénéficiaire *
                    </label>
                    <input
                      type="text"
                      value={transferForm.beneficiaryIban}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, beneficiaryIban: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      required
                    />
                  </div>
                </div>

                {/* Informations bancaires optionnelles */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BIC/SWIFT (optionnel)
                    </label>
                    <input
                      type="text"
                      value={transferForm.beneficiaryBic}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, beneficiaryBic: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="BNPAFRPP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la banque (optionnel)
                    </label>
                    <input
                      type="text"
                      value={transferForm.beneficiaryBank}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, beneficiaryBank: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="BNP Paribas"
                    />
                  </div>
                </div>

                {/* Montant et description */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={transferForm.amount}
                        onChange={(e) => setTransferForm(prev => ({ ...prev, amount: e.target.value }))}
                        className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="0.00"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Euro className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Référence (optionnel)
                    </label>
                    <input
                      type="text"
                      value={transferForm.reference}
                      onChange={(e) => setTransferForm(prev => ({ ...prev, reference: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Référence du virement"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motif du virement
                  </label>
                  <textarea
                    value={transferForm.description}
                    onChange={(e) => setTransferForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Décrivez le motif de ce virement..."
                  />
                </div>

                {/* Sauvegarder le bénéficiaire */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="saveBeneficiary"
                      checked={true}
                      readOnly
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveBeneficiary" className="text-sm text-blue-800">
                      Ce bénéficiaire sera automatiquement sauvegardé pour vos prochains virements
                    </label>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferForm(false);
                      setTransferError(null);
                      setTransferSuccess(null);
                    }}
                    disabled={isSubmitting}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !transferForm.fromAccountId || !transferForm.amount || !transferForm.beneficiaryName}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Virement en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Effectuer le virement</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de nouveau bénéficiaire */}
      {showBeneficiaryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouveau bénéficiaire</h3>
                <button
                  onClick={() => {
                    setShowBeneficiaryForm(false);
                    setBeneficiaryError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <AlertCircle className="h-6 w-6" />
                </button>
              </div>

              {beneficiaryError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{beneficiaryError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveBeneficiary} className="space-y-6">
                {/* Informations principales */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={newBeneficiary.name}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      IBAN *
                    </label>
                    <input
                      type="text"
                      value={newBeneficiary.iban}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, iban: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="FR76 1234 5678 9012 3456 7890 123"
                      required
                    />
                  </div>
                </div>

                {/* Informations bancaires */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      BIC/SWIFT (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newBeneficiary.bic}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, bic: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="BNPAFRPP"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom de la banque (optionnel)
                    </label>
                    <input
                      type="text"
                      value={newBeneficiary.bankName}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, bankName: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="BNP Paribas"
                    />
                  </div>
                </div>

                {/* Catégorie et options */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catégorie
                    </label>
                    <select
                      value={newBeneficiary.category}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, category: e.target.value as Beneficiary['category'] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    >
                      <option value="family">Famille</option>
                      <option value="friend">Ami</option>
                      <option value="business">Professionnel</option>
                      <option value="service">Service</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  <div className="flex items-center space-x-3 pt-8">
                    <input
                      type="checkbox"
                      id="isFavorite"
                      checked={newBeneficiary.isFavorite}
                      onChange={(e) => setNewBeneficiary(prev => ({ ...prev, isFavorite: e.target.checked }))}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFavorite" className="text-sm text-gray-700">
                      Ajouter aux favoris
                    </label>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (optionnel)
                  </label>
                  <textarea
                    value={newBeneficiary.notes}
                    onChange={(e) => setNewBeneficiary(prev => ({ ...prev, notes: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    rows={3}
                    placeholder="Notes personnelles sur ce bénéficiaire..."
                  />
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBeneficiaryForm(false);
                      setBeneficiaryError(null);
                    }}
                    disabled={isSavingBeneficiary}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingBeneficiary || !newBeneficiary.name || !newBeneficiary.iban}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isSavingBeneficiary ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Sauvegarde...</span>
                      </>
                    ) : (
                      <>
                        <User className="h-5 w-5" />
                        <span>Sauvegarder</span>
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

export default TransfersSection;