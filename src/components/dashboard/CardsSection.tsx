import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Eye, 
  EyeOff, 
  Plus, 
  MoreHorizontal, 
  Copy, 
  Lock,
  Unlock,
  Settings,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Shield,
  Smartphone,
  Globe,
  Pause,
  Play,
  Trash2
} from 'lucide-react';
import { Card, Account } from '../../lib/pocketbase';
import { CardService } from '../../services/cardService';
import { AccountService } from '../../services/accountService';

interface CardsSectionProps {
  user: any;
}

const CardsSection: React.FC<CardsSectionProps> = ({ user }) => {
  const [cards, setCards] = useState<Card[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [showCardNumbers, setShowCardNumbers] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isOrderingCard, setIsOrderingCard] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    loadCardsAndAccounts();
  }, [user?.id]);

  const loadCardsAndAccounts = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les comptes et cartes de l'utilisateur
      const userAccounts = await AccountService.getUserAccounts(user.id);
      setAccounts(userAccounts);
      
      const userCards = await CardService.getUserCards(user.id);
      setCards(userCards);
      
      // Sélectionner la première carte par défaut
      if (userCards.length > 0 && !selectedCard) {
        setSelectedCard(userCards[0]);
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des cartes:', error);
      setError('Erreur lors du chargement des cartes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCard = async () => {
    if (!accounts.length) {
      setOrderError('Aucun compte disponible');
      return;
    }

    // Utiliser le premier compte courant disponible
    const checkingAccount = accounts.find(acc => acc.accountType === 'Checking') || accounts[0];
    
    try {
      setIsOrderingCard(true);
      setOrderError(null);
      
      // Vérifier si l'utilisateur peut commander une carte
      const canOrder = await CardService.canOrderCard(user.id, checkingAccount.id);
      
      if (!canOrder.canOrder) {
        setOrderError(canOrder.reason || 'Impossible de commander une carte');
        return;
      }

      // Commander la carte
      try {
        const newCard = await CardService.orderNewCard(user.id, checkingAccount.id);
        
        // Recharger les données
        await loadCardsAndAccounts();
        
        // Sélectionner la nouvelle carte
        setSelectedCard(newCard);
        setShowOrderModal(false);
      } catch (orderError: any) {
        console.error('Erreur détaillée lors de la commande:', orderError);
        setOrderError(orderError.message || 'Erreur lors de la commande de la carte');
        return;
      }
      
    } catch (error: any) {
      console.error('Erreur lors de la commande:', error);
      setOrderError(error.message || 'Erreur lors de la commande de la carte');
    } finally {
      setIsOrderingCard(false);
    }
  };

  const getAccountForCard = (card: Card): Account | undefined => {
    return accounts.find(account => account.id === card.accountId);
  };

  const formatCardNumber = (cardNumber: string, show: boolean = false) => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    
    if (show) {
      return cardNumber.replace(/(.{4})/g, '$1 ').trim();
    } else {
      return `•••• •••• •••• ${cardNumber.slice(-4)}`;
    }
  };

  const toggleCardNumberVisibility = (cardId: string) => {
    setShowCardNumbers(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
    }
  };

  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case 'Visa': return '💳';
      case 'Mastercard': return '💳';
      case 'Amex': return '💳';
      case 'Maestro': return '💳';
      default: return '💳';
    }
  };

  const getCardTypeColor = (cardType: string) => {
    switch (cardType) {
      case 'Visa': return 'from-blue-500 to-blue-700';
      case 'Mastercard': return 'from-red-500 to-red-700';
      case 'Amex': return 'from-green-500 to-green-700';
      case 'Maestro': return 'from-purple-500 to-purple-700';
      default: return 'from-gray-500 to-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Inactive': return <Pause className="h-4 w-4 text-gray-600" />;
      case 'Blocked': return <Lock className="h-4 w-4 text-red-600" />;
      case 'Expired': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Active': return 'Active';
      case 'Inactive': return 'Inactive';
      case 'Blocked': return 'Bloquée';
      case 'Expired': return 'Expirée';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Blocked': return 'bg-red-100 text-red-800';
      case 'Expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatExpirationDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="space-y-4">
              {[1, 2].map((i) => (
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
              onClick={loadCardsAndAccounts}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune carte disponible</h3>
        <p className="text-gray-600 mb-6">
          Vous n'avez pas encore de carte bancaire. Commandez votre première carte pour commencer à payer.
        </p>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          Commander ma première carte
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Mes cartes</h2>
        <button 
          onClick={() => setShowOrderModal(true)}
          className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle carte</span>
        </button>
      </div>

      {/* Modal de commande de carte */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Commander une nouvelle carte</h3>
            
            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-800 font-medium">Carte Visa</p>
                    <ul className="text-sm text-blue-700 mt-1 space-y-1">
                      <li>• Frais de commande : 50€</li>
                      <li>• Livraison sous 5-7 jours</li>
                      <li>• Solde minimum requis : 100€</li>
                      <li>• Paiements sans contact</li>
                    </ul>
                  </div>
                </div>
              </div>

              {accounts.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Compte à débiter :</p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="font-medium text-gray-900">
                      {accounts.find(acc => acc.accountType === 'Checking')?.accountType === 'Checking' ? 'Compte courant' : 'Premier compte'}
                    </p>
                    <p className="text-sm text-gray-600">
                      Solde : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(
                        parseFloat((accounts.find(acc => acc.accountType === 'Checking') || accounts[0])?.balance || '0')
                      )}
                    </p>
                  </div>
                </div>
              )}

              {orderError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <p className="text-sm text-red-800">{orderError}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowOrderModal(false);
                  setOrderError(null);
                }}
                disabled={isOrderingCard}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleOrderCard}
                disabled={isOrderingCard}
                className="flex-1 bg-emerald-500 text-white py-3 rounded-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 transition-colors flex items-center justify-center space-x-2"
              >
                {isOrderingCard ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Commande...</span>
                  </>
                ) : (
                  <span>Commander (50€)</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Liste des cartes */}
        <div className="lg:col-span-1 space-y-4">
          {cards.map((card) => {
            const account = getAccountForCard(card);
            const isSelected = selectedCard?.id === card.id;
            const showNumber = showCardNumbers[card.id] || false;
            
            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`relative overflow-hidden rounded-xl cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-emerald-500 ring-offset-2' : 'hover:shadow-lg'
                }`}
              >
                {/* Carte bancaire visuelle */}
                <div className={`bg-gradient-to-br ${getCardTypeColor(card.cardType || 'Visa')} p-6 text-white relative`}>
                  {/* Puce et logo */}
                  <div className="flex items-start justify-between mb-8">
                    <div className="w-10 h-8 bg-yellow-400 rounded-md flex items-center justify-center">
                      <div className="w-6 h-6 bg-yellow-500 rounded-sm"></div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm opacity-80">{card.cardType}</p>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(card.status || 'Active')}
                        <span className="text-xs">{getStatusLabel(card.status || 'Active')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Numéro de carte */}
                  <div className="mb-6">
                    <p className="text-lg font-mono tracking-wider">
                      {formatCardNumber(card.cardNumber || '', showNumber)}
                    </p>
                  </div>

                  {/* Informations du bas */}
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs opacity-60 mb-1">TITULAIRE</p>
                      <p className="text-sm font-medium">
                        {user?.firstName?.toUpperCase()} {user?.lastName?.toUpperCase()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-60 mb-1">EXPIRE FIN</p>
                      <p className="text-sm font-medium">
                        {card.expirationMonth && card.expirationYear 
                          ? formatExpirationDate(card.expirationMonth, card.expirationYear)
                          : '••/••'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Bouton voir/masquer */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCardNumberVisibility(card.id);
                    }}
                    className="absolute top-4 right-4 p-2 bg-black/20 rounded-full hover:bg-black/30 transition-colors"
                  >
                    {showNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Informations du compte associé */}
                <div className="bg-white p-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {account?.accountType === 'Checking' ? 'Compte courant' : 
                         account?.accountType === 'Savings' ? 'Compte épargne' : 
                         'Compte investissement'}
                      </p>
                      <p className="text-xs text-gray-500">
                        •••• {account?.accountNumber?.slice(-4)}
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Détails de la carte sélectionnée */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCard && (
            <>
              {/* Informations détaillées */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Détails de la carte
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedCard.status || 'Active')}`}>
                      {getStatusIcon(selectedCard.status || 'Active')}
                      <span className="ml-1">{getStatusLabel(selectedCard.status || 'Active')}</span>
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de carte
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="flex-1 bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono">
                          {formatCardNumber(selectedCard.cardNumber || '', showCardNumbers[selectedCard.id])}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedCard.cardNumber || '', 'cardNumber')}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copier le numéro"
                        >
                          {copiedField === 'cardNumber' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Code de sécurité (CVV)
                      </label>
                      <div className="flex items-center space-x-2">
                        <code className="bg-gray-50 px-3 py-2 rounded-lg text-sm font-mono">
                          {showCardNumbers[selectedCard.id] ? selectedCard.cvv : '•••'}
                        </code>
                        <button
                          onClick={() => copyToClipboard(selectedCard.cvv || '', 'cvv')}
                          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copier le CVV"
                        >
                          {copiedField === 'cvv' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date d'expiration
                      </label>
                      <p className="text-gray-900 font-mono">
                        {selectedCard.expirationMonth && selectedCard.expirationYear 
                          ? formatExpirationDate(selectedCard.expirationMonth, selectedCard.expirationYear)
                          : 'Non définie'
                        }
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type de carte
                      </label>
                      <p className="text-gray-900">{selectedCard.cardType || 'Non défini'}</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de création
                      </label>
                      <p className="text-gray-900">
                        {selectedCard.created ? new Date(selectedCard.created).toLocaleDateString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-red-100 p-3 rounded-full">
                      <Lock className="h-6 w-6 text-red-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Bloquer</span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <Settings className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Plafonds</span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-purple-100 p-3 rounded-full">
                      <Smartphone className="h-6 w-6 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Paiement mobile</span>
                  </button>
                  
                  <button className="flex flex-col items-center space-y-2 p-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="bg-green-100 p-3 rounded-full">
                      <Globe className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Paiements étrangers</span>
                  </button>
                </div>
              </div>

              {/* Sécurité */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-blue-900 mb-2">Sécurité de votre carte</h4>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• Notifications en temps réel pour chaque transaction</li>
                      <li>• Blocage instantané depuis l'application</li>
                      <li>• Contrôle des plafonds et zones géographiques</li>
                      <li>• Protection 3D Secure pour les achats en ligne</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardsSection;