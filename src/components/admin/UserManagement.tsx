import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { AdminService } from '../../services/adminService';
import { AccountService } from '../../services/accountService';
import { CardService } from '../../services/cardService';
import { TransactionService } from '../../services/transactionService';
import UserDetails from './UserDetails';
import UserActions from './UserActions';
import UserAccounts from './UserAccounts';
import AdminAccountManagement from './AdminAccountManagement';
import AdminCardManagement from './AdminCardManagement';
import AdminTransactionManagement from './AdminTransactionManagement';
import AdminNotificationManagement from './AdminNotificationManagement';
import AdminChatSection from './AdminChatSection';

interface UserManagementProps {
  userId: string;
  onBack: () => void;
}

const UserManagement: React.FC<UserManagementProps> = ({ userId, onBack }) => {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'accounts' | 'cards' | 'transactions' | 'notifications' | 'chat'>('overview');

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Charger les informations de l'utilisateur
      const userData = await AdminService.getUserById(userId);
      setUser(userData);
      setEditForm(userData);
      
      // Charger les comptes de l'utilisateur
      try {
        const userAccounts = await AccountService.getUserAccounts(userId);
        setAccounts(userAccounts);
      } catch (accountError) {
        console.warn('Erreur lors du chargement des comptes:', accountError);
        setAccounts([]);
      }
      
      // Charger les cartes de l'utilisateur
      try {
        const userCards = await CardService.getUserCards(userId);
        setCards(userCards);
      } catch (cardError) {
        console.warn('Erreur lors du chargement des cartes:', cardError);
        setCards([]);
      }
      
      // Charger les transactions récentes de l'utilisateur
      try {
        const userTransactions = await TransactionService.getUserTransactions(userId, 20);
        setTransactions(userTransactions);
      } catch (transactionError) {
        console.warn('Erreur lors du chargement des transactions:', transactionError);
        setTransactions([]);
      }
      
    } catch (error: any) {
      console.error('Erreur lors du chargement des données utilisateur:', error);
      setError('Erreur lors du chargement des données utilisateur');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm(user);
    }
  };

  const handleEditChange = (field: string, value: any) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      await AdminService.updateUser(userId, editForm);
      setUser(editForm);
      setIsEditing(false);
      
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(user);
  };

  const handleStatusUpdate = async (newStatus: 'Pending' | 'Active' | 'Suspended' | 'Closed') => {
    if (!confirm(`Êtes-vous sûr de vouloir changer le statut vers "${newStatus}" ?`)) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      
      await AdminService.updateUserStatus(userId, newStatus);
      
      // Recharger les données
      await loadUserData();
      
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      alert('Erreur lors de la mise à jour du statut');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des données utilisateur...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Erreur de chargement</h3>
              <p className="text-red-700">{error || 'Utilisateur non trouvé'}</p>
              <div className="flex gap-3 mt-4">
                <button 
                  onClick={loadUserData}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Réessayer
                </button>
                <button 
                  onClick={onBack}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Retour
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const admin = AdminService.getCurrentAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Gestion de l'utilisateur
              </h1>
              <p className="text-sm text-gray-600">
                {user.firstName} {user.lastName} • {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Navigation tabs */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Vue d\'ensemble' },
                { id: 'accounts', label: 'Comptes bancaires' },
                { id: 'cards', label: 'Cartes' },
                { id: 'transactions', label: 'Transactions' },
                { id: 'notifications', label: 'Notifications' },
                { id: 'chat', label: 'Chat' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 text-red-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Détails utilisateur */}
              <UserDetails
                user={user}
                isEditing={isEditing}
                editForm={editForm}
                onEditToggle={handleEditToggle}
                onEditChange={handleEditChange}
                onSave={handleSave}
                onCancel={handleCancel}
                isSaving={isSaving}
              />

              {/* Actions */}
              <UserActions
                user={user}
                admin={admin}
                onStatusUpdate={handleStatusUpdate}
                isUpdatingStatus={isUpdatingStatus}
                onUserUpdate={loadUserData}
              />

              {/* Comptes et données financières */}
              <UserAccounts
                accounts={accounts}
                cards={cards}
                transactions={transactions}
                isLoading={false}
              />
            </>
          )}

          {activeTab === 'accounts' && (
            <AdminAccountManagement
              userId={userId}
              accounts={accounts}
              onAccountsUpdate={loadUserData}
            />
          )}

          {activeTab === 'cards' && (
            <AdminCardManagement
              userId={userId}
              accounts={accounts}
              cards={cards}
              onCardsUpdate={loadUserData}
            />
          )}

          {activeTab === 'transactions' && (
            <AdminTransactionManagement
              userId={userId}
              accounts={accounts}
              transactions={transactions}
              onTransactionsUpdate={loadUserData}
            />
          )}

          {activeTab === 'notifications' && (
            <AdminNotificationManagement
              userId={userId}
              user={user}
            />
          )}

          {activeTab === 'chat' && (
            <AdminChatSection
              userId={userId}
              user={user}
              admin={admin}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;