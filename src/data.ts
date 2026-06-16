import { InvestmentPackage } from './types';

export const USD_TO_KES_RATE = 132.50; // Dynamic exchange rate indicator

export const INVESTMENT_PACKAGES: InvestmentPackage[] = [
  {
    id: 'pkg-1',
    investAmount: 20,
    returnAmount: 70,
    durationDays: 7,
    category: 'Standard',
    tag: 'Starter Friendly',
  },
  {
    id: 'pkg-2',
    investAmount: 40,
    returnAmount: 170,
    durationDays: 7,
    category: 'Standard',
    tag: 'Popular',
  },
  {
    id: 'pkg-3',
    investAmount: 50,
    returnAmount: 300,
    durationDays: 7,
    category: 'Standard',
    tag: 'High Yield',
  },
  {
    id: 'pkg-4',
    investAmount: 100,
    returnAmount: 800,
    durationDays: 3,
    category: 'Premium',
    tag: 'Great ROI',
  },
  {
    id: 'pkg-5',
    investAmount: 200,
    returnAmount: 1200,
    durationDays: 3,
    category: 'Premium',
    tag: 'Pro Pool',
  },
  {
    id: 'pkg-6',
    investAmount: 300,
    returnAmount: 2500,
    durationDays: 2,
    category: 'Vip',
    tag: 'VIP Speed',
  },
  {
    id: 'pkg-7',
    investAmount: 500,
    returnAmount: 3000,
    durationDays: 1,
    category: 'Flash',
    tag: 'Express Return',
  },
];

export const PAYMENT_PHONE_NUMBER = '0797166504';
export const PAYMENT_RECIPIENT_NAME = 'GLEN K. (POOL MERCHANT)';
