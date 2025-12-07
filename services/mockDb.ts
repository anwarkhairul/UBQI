import { User, UserRole, Savings, Transaction, Product, SHUConfig, CooperativeStats, AppNotification } from '../types';

// Mock Current User (Member) - Template only
export const MOCK_USER: User = {
  id: 'USR-TEMPLATE',
  name: 'Anggota Koperasi',
  email: 'member@ub-qurrotul.id',
  role: UserRole.USER,
  joinDate: '2024-01-01',
  status: 'ACTIVE',
  avatarUrl: 'https://ui-avatars.com/api/?name=Member&background=10b981&color=fff',
};

// Mock Admin - Default Credentials
export const MOCK_ADMIN: User = {
  id: 'ADM-001',
  name: 'Admin Utama',
  email: 'ubqurrotulibaad@gmail.com',
  role: UserRole.ADMIN,
  joinDate: '2020-05-20',
  status: 'ACTIVE',
  avatarUrl: 'https://ui-avatars.com/api/?name=Admin+UB&background=059669&color=fff',
};

// User Savings
export const MOCK_USER_SAVINGS: Savings = {
  principal: 0,
  mandatory: 0,
  voluntary: 0,
  termDeposit: 0,
};

// Transactions
export const MOCK_TRANSACTIONS: Transaction[] = [];

// Pending Approvals (For Admin)
export const MOCK_PENDING_APPROVALS: Transaction[] = [];

// Shop Products
export const MOCK_PRODUCTS: Product[] = [];

// Cooperative Global Stats
export const MOCK_STATS: CooperativeStats = {
  totalMembers: 0,
  totalAssets: 0,
  totalLoans: 0,
  totalSavings: 0, // Denominator for SHU Calculation
};

// SHU Configuration Logic
export const DEFAULT_SHU_CONFIG: SHUConfig = {
  labaUsaha: 0, // Reset to 0
  allocations: {
    jasaModal: 0.30,
    cadanganModal: 0.25,
    jasaPengurus: 0.15,
    jasaTransaksi: 0.20,
    danaPendidikan: 0.05,
    infaq: 0.05,
  }
};

// News & Events
export const MOCK_NEWS = [];

// Financial Journal (Accounting)
export const MOCK_JOURNAL = [];

// Notifications
export const MOCK_NOTIFICATIONS: AppNotification[] = [];

// Helper to format currency
export const formatIDR = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};