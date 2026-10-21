import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { CardService } from '../../services/cardService';

interface AdminCardManagementProps {
  userId: string;
  accounts: any[];
  cards: any[];
  onCardsUpdate: () => void;
}

const AdminCardManagement: React.FC<AdminCardManagementProps> = ({
  userId,
  accounts,
  cards,
  onCardsUpdate
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showCardNumbers, setShowCardNumbers] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState({
    accountId: '',
    cardType: 'Visa' as 'Visa' | 'Mastercard' | 'Amex' | 'Maestro',
    skipFee: true
  });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!createForm.accountId) {
      setError('Veuillez sélectionner un compte');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Créer la carte (en tant qu'admin, on peut ignorer les frais)
      if (createForm.skipFee) {
        // Logique spéciale admin - créer directement sans débiter
        const cardData = {
          accountId: createForm.accountId,
          cardType: createForm.cardType,
          cardNumber: generateCardNumber(),
          cvv: generateCVV(),
          expirationMonth: 12,
          expirationYear: new Date().getFullYear() + 4,
          status: 'Active'
        };

        await pb.collection('Cards').create(cardData);
      } else {
        // Utiliser la méthode normale avec frais
        await CardService.orderNewCard(userId, createForm.accountId);
      }
      
      setSuccess(`Carte ${createForm.cardType} créée avec succès`);
      setCreateForm({ accountId: '', cardType: 'Visa', skipFee: true });
      setShowCreateForm(false);
      onCardsUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors de la création de la carte:', error);
      setError(error.message || 'Erreur lors de la création de la carte');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleCardStatus = async (cardId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Blocked' : 'Active';
    
    try {
      setIsLoading(true);
      setError(null);
      
      await CardService.toggleCardStatus(cardId, newStatus);
      
      setSuccess(`Carte ${newStatus === 'Active' ? 'débloquée' : 'bloquée'} avec succès`);
      onCardsUpdate();
      
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error: any) {
      console.error('Erreur lors du changement de statut:', error);
      setError(error.message || 'Erreur lors du changement de statut');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette carte ?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // Note: Implémenter la suppression selon les règles métier
      setSuccess('Fonctionnalité de suppression à implémenter selon les règles métier');
      
    } catch (error: any) {
      console.error('Erreur lors de la suppression:', error);
      setError(error.message || 'Erreur lors de la suppression de la carte');
    } finally {
      setIsLoading(false);
    }
  };

  const generateCardNumber = (): string => {
    const prefix = '4000';
    let cardNumber = prefix;
    for (let i = 0; i < 12; i++) {
      cardNumber += Math.floor(Math.random() * 10).toString();
    }
    return cardNumber;
  };

  const generateCVV = (): string => {
    return Math.floor(Math.random() * 900 + 100).toString();
  };

  const formatCardNumber = (cardNumber: string, show: boolean = false) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    
    if (show) {
      return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    } else {
      return `•••• •••• •••• ${cardNumber.slice(-4)}`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-gray-900">Gestion des cartes bancaires</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle carte</span>
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

      {/* Liste des cartes */}
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        {cards.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Aucune carte bancaire</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-emerald-500 text-white px-6 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
            >
              Créer la première carte
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {cards.map((card) => {
              const showNumber = showCardNumbers[card.id] || false;
              const account = accounts.find(acc => acc.id === card.accountId);
              
              return (
                <div key={card.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Carte visuelle */}
                  <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg p-4 text-white mb-4 relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-8 h-6 bg-yellow-400 rounded-md"></div>
                      <div className="text-right">
                        <p className="text-sm opacity-80">{card.cardType}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(card.status)}`}>
                          {card.status}
                        </span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-lg font-mono tracking-wider">
                        {formatCardNumber(card.cardNumber || '', showNumber)}
                      </p>
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-xs opacity-60 mb-1">CVV</p>
                        <p className="text-sm font-medium">
                          {showNumber ? card.cvv : '•••'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs opacity-60 mb-1">EXPIRE FIN</p>
                        <p className="text-sm font-medium">
                          {card.expirationMonth?.toString().padStart(2, '0')}/{card.expirationYear?.toString().slice(-2)}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCardNumbers(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                      className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/30 transition-colors"
                    >
                      {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Informations */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <p className="text-sm text-gray-600">Compte associé</p>
                      <p className="font-medium text-gray-900">
                        {account ? getAccountName(card.accountId) : 'Compte inconnu'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Date de création</p>
                      <p className="font-medium text-gray-900">
                        {card.created ? new Date(card.created).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleToggleCardStatus(card.id, card.status || 'Active')}
                      disabled={isLoading}
                      className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2 ${
                        card.status === 'Active' 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {card.status === 'Active' ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                      <span>{card.status === 'Active' ? 'Bloquer' : 'Débloquer'}</span>
                    </button>
                    
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      disabled={isLoading}
                      className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de création de carte */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvelle carte bancaire</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateCard} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compte à associer *
                  </label>
                  <select
                    value={createForm.accountId}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, accountId: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="">Sélectionner un compte</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {getAccountName(account.id)} - {account.accountNumber?.slice(-4)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de carte *
                  </label>
                  <select
                    value={createForm.cardType}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, cardType: e.target.value as any }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Amex">American Express</option>
                    <option value="Maestro">Maestro</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="skipFee"
                    checked={createForm.skipFee}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, skipFee: e.target.checked }))}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="skipFee" className="text-sm text-gray-700">
                    Ignorer les frais de création (50€) - Privilège admin
                  </label>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Création administrative</p>
                      <p className="text-sm text-blue-700 mt-1">
                        La carte sera créée immédiatement avec un numéro et CVV générés automatiquement.
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
                    disabled={isLoading || !createForm.accountId}
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
                        <span>Créer la carte</span>
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

export default AdminCardManagement;