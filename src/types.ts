export interface InvestmentPackage {
  id: string;
  investAmount: number; // in USD
  returnAmount: number; // in USD
  durationDays: number; // in days
  category: 'Standard' | 'Premium' | 'Vip' | 'Flash';
  tag?: string;
}

export interface UserInvestment {
  id: string;
  userId?: string;
  packageId: string;
  investAmount: number;
  returnAmount: number;
  durationDays: number;
  timestamp: number; // created date
  status: 'pending' | 'active' | 'matured' | 'rejected';
  transactionId: string;
  senderPhone: string;
  senderName: string;
  screenshotUrl: string; // base64 string
  notes?: string;
  approvedAt?: number;
  maturedAt?: number;
}

export interface UserAccount {
  name: string;
  phone: string;
  balanceUSD: number;
  totalWithdrawn: number;
}

export interface WithdrawalRequest {
  id: string;
  userId?: string;
  amountUSD: number;
  phone: string;
  network: string;
  timestamp: number;
  status: 'pending' | 'completed' | 'failed';
  completedAt?: number;
}

export interface SystemNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: number;
  read: boolean;
}
