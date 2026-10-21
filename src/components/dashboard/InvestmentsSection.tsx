import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Bitcoin, 
  DollarSign,
  PieChart,
  AlertTriangle,
  Plus,
  Eye,
  EyeOff,
  RefreshCw,
  Calendar,
  Target,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Account } from '../../lib/pocketbase';
import { AccountService } from '../../services/accountService';
import { InvestmentService, Investment, Portfolio } from '../../services/investmentService';
import { MarketSimulationService } from '../../services/marketSimulationService';

interface InvestmentsSectionProps {
  user: any;
}

const InvestmentsSection: React.FC<InvestmentsSectionProps> = ({ user }) => {
  const [investmentAccounts, setInvestmentAccounts] = useState<Account[]>([]);
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [showValues, setShowValues] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'positions' | 'orders'>('overview');
  const [marketData, setMarketData] = useState<any[]>([]);
  const [showInvestmentModal, setShowInvestmentModal] = useState(false);
  const [newInvestmentForm, setNewInvestmentForm] = useState({
    symbol: '',
    name: '',
    type: 'stock' as Investment['type'],
    quantity: '',
    price: ''
  });
  const [isCreatingInvestment, setIsCreatingInvestment] = useState(false);
  const [investmentError, setInvestmentError] = useState<string | null>(null);

  useEffect(() => {
    loadInvestmentData();
    loadMarketData();
  }, [user?.id]);

  const loadInvestmentData = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les comptes d'investissement
      const userAccounts = await AccountService.getUserAccounts(user.id);
      const investmentAccounts = userAccounts.filter(acc => acc.accountType === 'Investment');
      setInvestmentAccounts(investmentAccounts);
      
      // Charger le portefeuille réel
      const userPortfolio = await InvestmentService.getUserPortfolio(user.id);
      
      // Simuler les fluctuations de marché pour les investissements existants
      if (userPortfolio.investments.length > 0) {
        const updatedInvestments = await Promise.all(
          userPortfolio.investments.map(async (investment) => {
            const newPrice = MarketSimulationService.simulatePriceFluctuation(
              investment.averagePrice,
              investment.type
            );
            
            // Mettre à jour le prix dans la base de données
            try {
              await InvestmentService.updateCurrentPrice(investment.id, newPrice);
              return { ...investment, currentPrice: newPrice };
            } catch (error) {
              console.warn('Erreur mise à jour prix:', error);
              return investment;
            }
          })
        );
        
        // Recalculer le portefeuille avec les nouveaux prix
        const updatedPortfolio = {
          ...userPortfolio,
          investments: updatedInvestments
        };
        
        // Recalculer les totaux
        let totalValue = 0;
        let totalInvested = 0;
        
        updatedInvestments.forEach(investment => {
          totalValue += investment.quantity * investment.currentPrice;
          totalInvested += investment.quantity * investment.averagePrice;
        });
        
        updatedPortfolio.totalValue = totalValue;
        updatedPortfolio.totalGainLoss = totalValue - totalInvested;
        updatedPortfolio.totalGainLossPercent = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
        
        setPortfolio(updatedPortfolio);
      } else {
        setPortfolio(userPortfolio);
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des données d\'investissement:', error);
      setError('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMarketData = () => {
    // Simuler les données de marché avec fluctuations
    const baseMarketData = [
      { name: 'CAC 40', baseValue: 7234.56, type: 'stock' },
      { name: 'S&P 500', baseValue: 4756.23, type: 'stock' },
      { name: 'Bitcoin', baseValue: 42150.00, type: 'crypto' },
      { name: 'EUR/USD', baseValue: 1.0875, type: 'forex' }
    ];

    const simulatedMarketData = baseMarketData.map(market => {
      const currentValue = MarketSimulationService.simulatePriceFluctuation(market.baseValue, market.type as any);
      const change = currentValue - market.baseValue;
      const changePercent = (change / market.baseValue) * 100;

      return {
        name: market.name,
        value: currentValue,
        change,
        changePercent
      };
    });

    setMarketData(simulatedMarketData);
  };

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newInvestmentForm.symbol || !newInvestmentForm.name || !newInvestmentForm.quantity || !newInvestmentForm.price) {
      setInvestmentError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const quantity = parseFloat(newInvestmentForm.quantity);
    const price = parseFloat(newInvestmentForm.price);
    
    if (isNaN(quantity) || quantity <= 0) {
      setInvestmentError('La quantité doit être un nombre positif');
      return;
    }
    
    if (isNaN(price) || price <= 0) {
      setInvestmentError('Le prix doit être un nombre positif');
      return;
    }

    try {
      setIsCreatingInvestment(true);
      setInvestmentError(null);
      
      // Vérifier qu'il y a au moins un compte d'investissement, sinon en créer un
      let investmentAccountId: string;
      
      if (investmentAccounts.length === 0) {
        // Créer un compte d'investissement automatiquement
        try {
          const newAccount = await AccountService.createAccount(user.id, 'Investment');
          investmentAccountId = newAccount.id;
          
          // Recharger les comptes
          const userAccounts = await AccountService.getUserAccounts(user.id);
          const updatedInvestmentAccounts = userAccounts.filter(acc => acc.accountType === 'Investment');
          setInvestmentAccounts(updatedInvestmentAccounts);
        } catch (accountError) {
          setInvestmentError('Impossible de créer un compte d\'investissement. Veuillez contacter le support.');
          return;
        }
      } else {
        investmentAccountId = investmentAccounts[0].id;
      }
      
      await InvestmentService.createInvestment(
        user.id,
        investmentAccountId,
        newInvestmentForm.symbol.toUpperCase(),
        newInvestmentForm.name,
        newInvestmentForm.type,
        quantity,
        price
      );
      
      // Recharger les données
      await loadInvestmentData();
      
      // Reset du formulaire
      setNewInvestmentForm({
        symbol: '',
        name: '',
        type: 'stock',
        quantity: '',
        price: ''
      });
      
      setShowInvestmentModal(false);
      
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      setInvestmentError(error.message || 'Erreur lors de la création de l\'investissement');
    } finally {
      setIsCreatingInvestment(false);
    }
  };

  const popularInvestments = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' as const, price: 185.50 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' as const, price: 378.20 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' as const, price: 142.80 },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' as const, price: 248.90 },
    { symbol: 'SPY', name: 'SPDR S&P 500 ETF', type: 'etf' as const, price: 475.60 },
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' as const, price: 42150.00 },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto' as const, price: 2580.00 }
  ];

  const selectPopularInvestment = (investment: typeof popularInvestments[0]) => {
    setNewInvestmentForm(prev => ({
      ...prev,
      symbol: investment.symbol,
      name: investment.name,
      type: investment.type,
      price: investment.price.toString()
    }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    return `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
  };

  const getInvestmentIcon = (type: string) => {
    switch (type) {
      case 'stock': return <TrendingUp className="h-5 w-5" />;
      case 'etf': return <BarChart3 className="h-5 w-5" />;
      case 'crypto': return <Bitcoin className="h-5 w-5" />;
      case 'bond': return <DollarSign className="h-5 w-5" />;
      default: return <PieChart className="h-5 w-5" />;
    }
  };

  const getInvestmentTypeLabel = (type: string) => {
    switch (type) {
      case 'stock': return 'Action';
      case 'etf': return 'ETF';
      case 'crypto': return 'Crypto';
      case 'bond': return 'Obligation';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
          <AlertTriangle className="h-6 w-6 text-red-600 flex-shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={loadInvestmentData}
              className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!portfolio || portfolio.investments.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Investissement</h2>
          <button 
            onClick={() => setShowInvestmentModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Investir</span>
          </button>
        </div>

        {/* Empty state */}
        <div className="bg-white rounded-xl p-8 shadow-sm border text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Commencez à investir</h3>
          <p className="text-gray-600 mb-6">
            Diversifiez votre patrimoine avec nos solutions d'investissement.
          </p>
          
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 border border-gray-200 rounded-lg">
              <TrendingUp className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Actions</h4>
              <p className="text-sm text-gray-600">Investissez dans les plus grandes entreprises</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <BarChart3 className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">ETF</h4>
              <p className="text-sm text-gray-600">Diversification automatique</p>
            </div>
            <div className="p-4 border border-gray-200 rounded-lg">
              <Bitcoin className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-900 mb-1">Crypto</h4>
              <p className="text-sm text-gray-600">Monnaies numériques</p>
            </div>
          </div>

          <button 
            onClick={() => setShowInvestmentModal(true)}
            className="bg-emerald-500 text-white px-6 py-3 rounded-lg hover:bg-emerald-600 transition-colors"
          >
            Commencer à investir
          </button>
        </div>

        {/* Données de marché simulées */}
        {marketData.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Marchés financiers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {marketData.map((market, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{market.name}</span>
                    {market.change >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {market.name.includes('/') ? market.value.toFixed(4) : market.value.toLocaleString('fr-FR')}
                  </p>
                  <p className={`text-sm ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({formatPercent(market.changePercent)})
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal de création d'investissement */}
        {showInvestmentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Nouvel investissement</h3>
                  <button
                    onClick={() => {
                      setShowInvestmentModal(false);
                      setInvestmentError(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-6 w-6" />
                  </button>
                </div>

                {investmentError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-red-800">{investmentError}</p>
                    </div>
                  </div>
                )}

                {/* Investissements populaires */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Investissements populaires</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {popularInvestments.map((investment) => (
                      <button
                        key={investment.symbol}
                        onClick={() => selectPopularInvestment(investment)}
                        className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            {getInvestmentIcon(investment.type)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{investment.symbol}</p>
                            <p className="text-sm text-gray-500">{investment.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{formatCurrency(investment.price)}</p>
                          <p className="text-xs text-gray-500">{getInvestmentTypeLabel(investment.type)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <form onSubmit={handleCreateInvestment} className="space-y-6">
                  {/* Informations de base */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symbole *
                      </label>
                      <input
                        type="text"
                        value={newInvestmentForm.symbol}
                        onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="AAPL, BTC, SPY..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type d'actif *
                      </label>
                      <select
                        value={newInvestmentForm.type}
                        onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, type: e.target.value as Investment['type'] }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        required
                      >
                        <option value="stock">Action</option>
                        <option value="etf">ETF</option>
                        <option value="crypto">Cryptomonnaie</option>
                        <option value="bond">Obligation</option>
                        <option value="commodity">Matière première</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      type="text"
                      value={newInvestmentForm.name}
                      onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="Apple Inc., Bitcoin, SPDR S&P 500..."
                      required
                    />
                  </div>

                  {/* Quantité et prix */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        step="0.00000001"
                        min="0.00000001"
                        value={newInvestmentForm.quantity}
                        onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="1.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prix d'achat (€) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={newInvestmentForm.price}
                        onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="185.50"
                        required
                      />
                    </div>
                  </div>

                  {/* Calcul du montant total */}
                  {newInvestmentForm.quantity && newInvestmentForm.price && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">Montant total de l'investissement :</span>
                        <span className="text-lg font-bold text-blue-900">
                          {formatCurrency(parseFloat(newInvestmentForm.quantity) * parseFloat(newInvestmentForm.price))}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Avertissement */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-amber-800 font-medium">Avertissement</p>
                        <p className="text-sm text-amber-700 mt-1">
                          Les investissements comportent un risque de perte en capital. Assurez-vous de bien comprendre les risques avant d'investir.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Boutons */}
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={() => {
                        setShowInvestmentModal(false);
                        setInvestmentError(null);
                      }}
                      disabled={isCreatingInvestment}
                      className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isCreatingInvestment || !newInvestmentForm.symbol || !newInvestmentForm.name || !newInvestmentForm.quantity || !newInvestmentForm.price}
                      className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      {isCreatingInvestment ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>Création...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="h-5 w-5" />
                          <span>Créer l'investissement</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Avertissement */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-amber-900 mb-2">Avertissement sur les risques</h4>
              <p className="text-amber-800 text-sm leading-relaxed">
                Les investissements comportent un risque de perte en capital. Les performances passées ne préjugent pas des performances futures. 
                Il est recommandé de diversifier ses investissements et de ne jamais investir plus que ce que l'on peut se permettre de perdre.
              </p>
            </div>
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
          <h2 className="text-2xl font-bold text-gray-900">Investissement</h2>
          <p className="text-gray-600">
            Portefeuille total : {showValues ? formatCurrency(portfolio.totalValue) : '••••••'}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowValues(!showValues)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showValues ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
          <button 
            onClick={() => {
              loadInvestmentData();
              loadMarketData();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualiser</span>
          </button>
          <button 
            onClick={() => setShowInvestmentModal(true)}
            className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Investir</span>
          </button>
        </div>
      </div>

      {/* Vue d'ensemble du portefeuille */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Valeur totale</h3>
            <PieChart className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {showValues ? formatCurrency(portfolio.totalValue) : '••••••'}
          </p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Plus/Moins-value</h3>
            {portfolio.totalGainLoss >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-600" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-600" />
            )}
          </div>
          <div className="space-y-1">
            <p className={`text-2xl font-bold ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {showValues ? formatCurrency(portfolio.totalGainLoss) : '••••••'}
            </p>
            <p className={`text-sm ${portfolio.totalGainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatPercent(portfolio.totalGainLossPercent)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-600">Positions</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{portfolio.investments.length}</p>
          <p className="text-sm text-gray-500">investissements actifs</p>
        </div>
      </div>

      {/* Onglets */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: PieChart },
              { id: 'positions', label: 'Positions', icon: BarChart3 },
              { id: 'orders', label: 'Ordres', icon: Calendar }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab.id
                      ? 'border-emerald-500 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {selectedTab === 'overview' && (
            <div className="space-y-6">
              {/* Données de marché */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Marchés</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {marketData.map((market, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{market.name}</span>
                        {market.change >= 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {market.name.includes('/') ? market.value.toFixed(4) : market.value.toLocaleString('fr-FR')}
                      </p>
                      <p className={`text-sm ${market.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {market.change >= 0 ? '+' : ''}{market.change.toFixed(2)} ({formatPercent(market.changePercent)})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'positions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">Mes positions</h4>
                <button className="text-emerald-600 hover:text-emerald-700 text-sm font-medium">
                  Ajouter une position
                </button>
              </div>

              <div className="space-y-4">
                {portfolio.investments.map((investment) => {
                  const { gainLoss, gainLossPercent } = InvestmentService.calculateGainLoss(investment);
                  const totalValue = investment.quantity * investment.currentPrice;
                  
                  return (
                    <div key={investment.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gray-100 p-2 rounded-lg">
                            {getInvestmentIcon(investment.type)}
                          </div>
                          <div>
                            <h5 className="font-semibold text-gray-900">{investment.name}</h5>
                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                              <span>{investment.symbol}</span>
                              <span>•</span>
                              <span>{getInvestmentTypeLabel(investment.type)}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {showValues ? formatCurrency(totalValue) : '••••••'}
                          </p>
                          <div className="flex items-center space-x-2">
                            <p className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {showValues ? formatCurrency(gainLoss) : '••••••'}
                            </p>
                            <span className={`text-sm ${gainLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              ({formatPercent(gainLossPercent)})
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Quantité</span>
                            <p className="font-medium text-gray-900">{investment.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Prix moyen</span>
                            <p className="font-medium text-gray-900">{formatCurrency(investment.averagePrice)}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Prix actuel</span>
                            <p className="font-medium text-gray-900">{formatCurrency(investment.currentPrice)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {selectedTab === 'orders' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">Aucun ordre en cours</p>
              <p className="text-sm text-gray-400">Vos ordres d'achat et de vente apparaîtront ici</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de création d'investissement */}
      {showInvestmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Nouvel investissement</h3>
                <button
                  onClick={() => {
                    setShowInvestmentModal(false);
                    setInvestmentError(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              {investmentError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-800">{investmentError}</p>
                  </div>
                </div>
              )}

              {/* Investissements populaires */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Investissements populaires</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {popularInvestments.map((investment) => (
                    <button
                      key={investment.symbol}
                      onClick={() => selectPopularInvestment(investment)}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-emerald-300 hover:bg-emerald-50 transition-colors text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          {getInvestmentIcon(investment.type)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{investment.symbol}</p>
                          <p className="text-sm text-gray-500">{investment.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(investment.price)}</p>
                        <p className="text-xs text-gray-500">{getInvestmentTypeLabel(investment.type)}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateInvestment} className="space-y-6">
                {/* Informations de base */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Symbole *
                    </label>
                    <input
                      type="text"
                      value={newInvestmentForm.symbol}
                      onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="AAPL, BTC, SPY..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'actif *
                    </label>
                    <select
                      value={newInvestmentForm.type}
                      onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, type: e.target.value as Investment['type'] }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    >
                      <option value="stock">Action</option>
                      <option value="etf">ETF</option>
                      <option value="crypto">Cryptomonnaie</option>
                      <option value="bond">Obligation</option>
                      <option value="commodity">Matière première</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet *
                  </label>
                  <input
                    type="text"
                    value={newInvestmentForm.name}
                    onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Apple Inc., Bitcoin, SPDR S&P 500..."
                    required
                  />
                </div>

                {/* Quantité et prix */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantité *
                    </label>
                    <input
                      type="number"
                      step="0.00000001"
                      min="0.00000001"
                      value={newInvestmentForm.quantity}
                      onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, quantity: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="1.5"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prix d'achat (€) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={newInvestmentForm.price}
                      onChange={(e) => setNewInvestmentForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="185.50"
                      required
                    />
                  </div>
                </div>

                {/* Calcul du montant total */}
                {newInvestmentForm.quantity && newInvestmentForm.price && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-800">Montant total de l'investissement :</span>
                      <span className="text-lg font-bold text-blue-900">
                        {formatCurrency(parseFloat(newInvestmentForm.quantity) * parseFloat(newInvestmentForm.price))}
                      </span>
                    </div>
                  </div>
                )}

                {/* Avertissement */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium">Avertissement</p>
                      <p className="text-sm text-amber-700 mt-1">
                        Les investissements comportent un risque de perte en capital. Assurez-vous de bien comprendre les risques avant d'investir.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Boutons */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowInvestmentModal(false);
                      setInvestmentError(null);
                    }}
                    disabled={isCreatingInvestment}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-full text-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isCreatingInvestment || !newInvestmentForm.symbol || !newInvestmentForm.name || !newInvestmentForm.quantity || !newInvestmentForm.price}
                    className="flex-1 bg-emerald-500 text-white py-4 rounded-full text-lg font-semibold hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                  >
                    {isCreatingInvestment ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Création...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5" />
                        <span>Créer l'investissement</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Avertissement */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-semibold text-amber-900 mb-2">Avertissement sur les risques</h4>
            <p className="text-amber-800 text-sm leading-relaxed">
              Les investissements comportent un risque de perte en capital. Les performances passées ne préjugent pas des performances futures. 
              Il est recommandé de diversifier ses investissements et de ne jamais investir plus que ce que l'on peut se permettre de perdre.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestmentsSection;