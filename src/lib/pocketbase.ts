import PocketBase from 'pocketbase';

// Configuration PocketBase
const POCKETBASE_URL = 'https://nod.pockethost.io';

// Instance singleton de PocketBase
export const pb = new PocketBase(POCKETBASE_URL);

// Types pour les collections
export interface User {
  id: string;
  email: string;
  emailVisibility?: boolean;
  verified?: boolean;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  phone?: number;
  birthDate?: string;
  Gender?: 'M' | 'F' | 'Other';
  nationality?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  profession?: string;
  professionalStatus?: 'student' | 'employee' | 'self-employed' | 'unemployed' | 'retired' | 'other';
  monthlyIncomeRange?: string;
  accountStatus?: 'Pending' | 'Active' | 'Suspended' | 'Closed';
  isadmin?: boolean;
  created?: string;
  updated?: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber?: string;
  balance?: string;
  currency?: string;
  accountType?: 'Checking' | 'Savings' | 'Investment';
  created?: string;
  updated?: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  type?: 'Deposit' | 'Withdrawal' | 'Transfer_Out' | 'Transfer_In' | 'Card_Purchase' | 'Fee' | 'Interest' | 'Other';
  currency?: string;
  amount?: number;
  description?: string;
  status?: 'Pending' | 'Completed' | 'Failed' | 'Cancelled';
  relatedAccountId?: string;
  beneficiaryName?: string;
  beneficiaryIBAN?: string;
  reference?: string;
  cardId?: string;
  created?: string;
  updated?: string;
  transactionDate?: string;
}

export interface Card {
  id: string;
  accountId: string;
  cardType?: 'Visa' | 'Mastercard' | 'Amex' | 'Maestro';
  cardNumber?: string; // À remplacer par cardNumberLast4 en production
  cvv?: string; // À supprimer en production
  expirationMonth?: number;
  expirationYear?: number;
  status?: 'Active' | 'Inactive' | 'Blocked' | 'Expired';
  created?: string;
  updated?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type?: 'Transaction' | 'Security' | 'Marketing' | 'System' | 'Alert';
  message?: string;
  isRead?: boolean;
  link?: string;
  created?: string;
  updated?: string;
}

export interface Beneficiary {
  id: string;
  userId: string;
  name: string;
  iban: string;
  bic?: string;
  bankName?: string;
  category: 'family' | 'friend' | 'business' | 'service' | 'other';
  isFavorite: boolean;
  notes?: string;
  created?: string;
  updated?: string;
}

export interface SupportChat {
  id: string;
  userId: string;
  conversationId: string;
  messageType: 'user_message' | 'agent_response';
  content: string;
  authorName: string;
  agentId?: string;
  isRead: boolean;
  created?: string;
  updated?: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  description?: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'vacation' | 'emergency' | 'purchase' | 'education' | 'retirement' | 'other';
  isActive: boolean;
  settings?: any; // JSON field
  created?: string;
  updated?: string;
}

export interface Investment {
  id: string;
  userId: string;
  accountId: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf' | 'crypto' | 'bond' | 'commodity';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  marketData?: any; // JSON field
  created?: string;
  updated?: string;
}

// Configuration par défaut pour l'authentification
pb.autoCancellation(false);

export default pb;