import React, { useState, useRef } from 'react';
import { 
  CreditCard, 
  TrendingUp, 
  Download, 
  ShoppingCart, 
  ChevronRight,
  Shield,
  FileText,
  Search,
  MapPin,
  Phone,
  Mail,
  Edit2,
  Save,
  Trash2,
  Plus,
  Minus,
  CheckCircle,
  Clock,
  MessageCircle,
  Wallet,
  X,
  Camera,
  Lock,
  FileCheck,
  AlertTriangle,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { formatIDR, MOCK_USER, MOCK_STATS } from '../services/mockDb';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Product, Transaction, SHUConfig, User } from '../types';

// --- Types for Props ---
interface UserDashboardProps {
  onNavigate: (tab: string) => void;
  transactions: Transaction[];
  shuConfig: SHUConfig;
  financialData: any; // Added prop
}

interface UserSavingsProps {
  user: User;
  transactions: Transaction[];
  onAddTransaction: (trx: Transaction) => void;
}

interface UserShopProps {
  user: User;
  products: Product[];
  onAddTransaction: (trx: Transaction) => void;
}

interface UserSHUProps {
  user: User;
  shuConfig: SHUConfig;
  transactions: Transaction[];
  onAddTransaction: (trx: Transaction) => void;
  financialData: any; // Added prop
}

interface UserProfileProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

interface UserInformationProps {
  news: any[];
  settings: any;
}

// --- Helper Functions ---
const calculateUserSavings = (transactions: Transaction[]) => {
    // Filter APPROVED deposits
    const deposits = transactions
        .filter(t => (t.type === 'DEPOSIT' || t.type === 'PAYMENT') && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);
    
    // Filter APPROVED withdrawals (excluding SHU Withdrawal to keep Savings pure)
    const withdrawals = transactions
        .filter(t => (t.type === 'WITHDRAWAL') && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);

    return deposits - withdrawals;
};

// Calculate Eligible Savings for SHU (Excluding late mandatory payments)
const calculateEligibleUserSavings = (transactions: Transaction[]) => {
    return transactions.reduce((acc, t) => {
        if (t.status !== 'APPROVED') return acc;
        
        if (t.type === 'WITHDRAWAL' || t.type === 'SHU_WITHDRAWAL') return acc - t.amount;

        if (t.type === 'DEPOSIT' || t.type === 'PAYMENT') {
            const isMandatory = t.description.toLowerCase().includes('wajib');
            if (isMandatory) {
                const date = new Date(t.date);
                const day = date.getDate();
                if (day > 10) return acc; // Late payment excluded from SHU base
            }
            return acc + t.amount;
        }
        return acc;
    }, 0);
};

const calculateUserPurchases = (transactions: Transaction[]) => {
    return transactions
        .filter(t => t.type === 'PURCHASE' && t.status === 'APPROVED')
        .reduce((sum, t) => sum + t.amount, 0);
};

const getMonthlyStatus = (transactions: Transaction[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const hasPaid = transactions.some(t => 
        t.type === 'PAYMENT' && 
        t.description.includes('Wajib') && 
        t.date.startsWith(currentMonth) &&
        t.status === 'APPROVED'
    );
    return hasPaid ? 'Lunas' : 'Belum Lunas';
};

const isTransactionLate = (trx: Transaction): boolean => {
    if ((trx.type === 'DEPOSIT' || trx.type === 'PAYMENT') && trx.description.toLowerCase().includes('wajib')) {
        const day = new Date(trx.date).getDate();
        return day > 10;
    }
    return false;
};

// --- Dashboard Component ---
export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate, transactions, shuConfig, financialData }) => {
  const totalSavings = calculateUserSavings(transactions);
  const totalEligibleSavings = calculateEligibleUserSavings(transactions);
  const totalPurchases = calculateUserPurchases(transactions);
  const monthlyStatus = getMonthlyStatus(transactions);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Breakdown Calculation for Tooltip
  const breakdown = transactions
    .filter(t => t.status === 'APPROVED' && (t.type === 'DEPOSIT' || t.type === 'PAYMENT' || t.type === 'WITHDRAWAL'))
    .reduce((acc, t) => {
        const desc = t.description.toLowerCase();
        if (t.type === 'DEPOSIT' || t.type === 'PAYMENT') {
            if (desc.includes('pokok')) acc.pokok += t.amount;
            else if (desc.includes('wajib')) acc.wajib += t.amount;
            else acc.sukarela += t.amount;
        } else if (t.type === 'WITHDRAWAL') {
             acc.sukarela -= t.amount;
        }
        return acc;
    }, { pokok: 0, wajib: 0, sukarela: 0 });

  // --- Real-Time SHU Calculation ---
  // 1. Jasa Modal = (SHU Bersih * 30%) * (Simpanan EFEKTIF Saya / Total Simpanan EFEKTIF Koperasi)
  const jasaModalPool = financialData.netIncome * shuConfig.allocations.jasaModal;
  // Use Eligible/Effective Savings for Ratio, not total raw savings
  const mySavingsRatio = financialData.totalEligibleSavings > 0 ? (totalEligibleSavings / financialData.totalEligibleSavings) : 0;
  const myJasaModal = jasaModalPool * mySavingsRatio;

  // 2. Jasa Transaksi = (SHU Bersih * 20%) * (Belanja Saya / Total Belanja Anggota)
  const jasaTransaksiPool = financialData.netIncome * shuConfig.allocations.jasaTransaksi;
  const myPurchaseRatio = financialData.totalMemberPurchases > 0 ? (totalPurchases / financialData.totalMemberPurchases) : 0;
  const myJasaTransaksi = jasaTransaksiPool * myPurchaseRatio;

  const estimasiSHU = myJasaModal + myJasaTransaksi;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group cursor-pointer">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <CreditCard size={64} className="text-emerald-600" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Total Simpanan</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatIDR(totalSavings)}</h3>
          <div className="mt-4 flex items-center text-sm text-emerald-600">
            <TrendingUp size={16} className="mr-1" />
            <span>Akumulasi dana</span>
          </div>
          
          {/* Tooltip on Hover */}
          <div className="absolute inset-0 bg-white/95 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center text-sm text-slate-700 p-4 text-center z-10 font-medium">
              <p className="mb-1 text-emerald-600 font-bold">Rincian Saldo:</p>
              <p>Pokok: {formatIDR(breakdown.pokok)}</p>
              <p>Wajib: {formatIDR(breakdown.wajib)}</p>
              <p>Sukarela: {formatIDR(breakdown.sukarela)}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm font-medium">SHU Estimasi (Tahun Ini)</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-1">{formatIDR(estimasiSHU)}</h3>
          <p className="text-xs text-slate-400 mt-2">Dihitung dari Simpanan Eligible & Transaksi</p>
        </div>

        <div className={`p-6 rounded-xl shadow-lg text-white relative overflow-hidden group transition-colors ${monthlyStatus === 'Lunas' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
          <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/10 group-hover:scale-110 transition-transform duration-500"></div>
          
          <p className="text-emerald-100 text-sm font-medium relative z-10">Simpanan Wajib (Bulan Ini)</p>
          <div className="flex items-center gap-2 mt-1 relative z-10">
             <h3 className="text-2xl font-bold">{monthlyStatus}</h3>
             {monthlyStatus === 'Belum Lunas' && (
                 <span className="text-xs bg-red-500/90 text-white px-2 py-0.5 rounded-full font-medium shadow-sm">Tagihan</span>
             )}
          </div>
          
          <button 
            onClick={() => onNavigate('simpanan')}
            className="mt-4 w-full py-2 bg-white text-emerald-600 hover:bg-emerald-50 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-900/10 relative z-10 flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Download size={16} /> {monthlyStatus === 'Lunas' ? 'Tambah Simpanan' : 'Bayar Sekarang'}
          </button>
        </div>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">Aktivitas Terakhir</h3>
            <button onClick={() => setShowAllHistory(true)} className="text-sm text-emerald-600 hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-4">
            {transactions.length === 0 ? (
                <p className="text-slate-400 text-center py-4 italic">Belum ada aktivitas.</p>
            ) : (
                transactions.slice(0, 3).map((trx) => (
                    <div key={trx.id} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0">
                        <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${(trx.type === 'DEPOSIT' || trx.type === 'PAYMENT') ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                            {trx.type === 'DEPOSIT' || trx.type === 'PAYMENT' ? <Download size={18} /> : <CreditCard size={18} />}
                        </div>
                        <div>
                            <p className="font-medium text-slate-800">{trx.description}</p>
                            <p className="text-xs text-slate-500">{trx.date} • {trx.status}</p>
                        </div>
                        </div>
                        <span className={`font-bold ${(trx.type === 'DEPOSIT' || trx.type === 'PAYMENT') ? 'text-emerald-600' : 'text-slate-700'}`}>
                        {(trx.type === 'DEPOSIT' || trx.type === 'PAYMENT') ? '+' : '-'}{formatIDR(trx.amount)}
                        </span>
                    </div>
                ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Akses Cepat</h3>
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onNavigate('simpanan')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <Download size={24} className="text-slate-500 group-hover:text-emerald-600" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">Setor Simpanan</span>
            </button>
            <button 
              onClick={() => onNavigate('unit_usaha')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <ShoppingCart size={24} className="text-slate-500 group-hover:text-emerald-600" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">Belanja</span>
            </button>
            <button 
              onClick={() => onNavigate('informasi')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <FileText size={24} className="text-slate-500 group-hover:text-emerald-600" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">Laporan</span>
            </button>
            <button 
              onClick={() => onNavigate('profil')}
              className="p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-lg flex flex-col items-center justify-center gap-2 transition-all group"
            >
              <Shield size={24} className="text-slate-500 group-hover:text-emerald-600" />
              <span className="text-xs font-medium text-slate-600 group-hover:text-emerald-700">Ganti PIN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Riwayat Lengkap */}
      {showAllHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
            <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Riwayat Aktivitas Lengkap</h3>
                <button onClick={() => setShowAllHistory(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
                </button>
            </div>
            
            <div className="space-y-3">
                {transactions.map((trx) => {
                    const isPositive = trx.type === 'DEPOSIT' || trx.type === 'PAYMENT';
                    let Icon = CreditCard;
                    let bgClass = 'bg-blue-100 text-blue-600';

                    if (trx.type === 'DEPOSIT') { Icon = Download; bgClass = 'bg-emerald-100 text-emerald-600'; }
                    else if (trx.type === 'PAYMENT') { Icon = CheckCircle; bgClass = 'bg-emerald-100 text-emerald-600'; }
                    else if (trx.type === 'SHU_WITHDRAWAL') { Icon = Wallet; bgClass = 'bg-purple-100 text-purple-600'; }
                    else if (trx.type === 'PURCHASE') { Icon = ShoppingCart; bgClass = 'bg-orange-100 text-orange-600'; }

                    return (
                        <div key={trx.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border border-slate-100">
                            <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${bgClass}`}>
                                <Icon size={20} />
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{trx.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-slate-500">{trx.date}</span>
                                <span className="text-xs text-slate-300">•</span>
                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                    trx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                    trx.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                                }`}>
                                    {trx.status}
                                </span>
                                </div>
                            </div>
                            </div>
                            <span className={`font-bold text-lg ${
                                isPositive ? 'text-emerald-600' : 'text-slate-700'
                            }`}>
                            {isPositive ? '+' : '-'}{formatIDR(trx.amount)}
                            </span>
                        </div>
                    );
                })}
            </div>
            </div>
        </div>
      )}
    </div>
  );
};

export const UserSavings: React.FC<UserSavingsProps> = ({ user, transactions, onAddTransaction }) => {
  const [amount, setAmount] = useState('');
  const [savingType, setSavingType] = useState('Simpanan Sukarela');
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);

  const totalSavings = calculateUserSavings(transactions);

  // Filter Transactions for Savings History
  const savingsHistory = transactions
    .filter(t => ['DEPOSIT', 'PAYMENT', 'WITHDRAWAL'].includes(t.type))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleDeposit = () => {
    if (!amount) return;
    
    // Redirect to WhatsApp
    const adminNumber = "628123456789"; 
    const message = `Halo Admin, saya *${user.name}* ingin melakukan setoran:\n\nTanggal: ${date}\nJenis: ${savingType}\nNominal: ${formatIDR(Number(amount))}\nMetode: ${paymentMethod}\n\nMohon petunjuk pembayarannya.`;
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
    
    // Create Pending Transaction
    onAddTransaction({
      id: `TRX-${Date.now()}`,
      memberId: user.id,
      date: date,
      type: savingType.includes('Wajib') ? 'PAYMENT' : 'DEPOSIT',
      amount: Number(amount),
      status: 'PENDING',
      description: `Setoran ${savingType}`
    });

    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    setShowModal(false);
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10">
            <Wallet size={120} />
        </div>
        <p className="text-emerald-100 mb-1 relative z-10">Total Saldo Simpanan</p>
        <h2 className="text-3xl font-bold relative z-10">{formatIDR(totalSavings)}</h2>
        <div className="mt-4 flex items-center gap-4 relative z-10">
             <div className="text-xs bg-white/20 px-2 py-1 rounded">Pokok/Wajib: Terhitung</div>
             <div className="text-xs bg-white/20 px-2 py-1 rounded">Sukarela: Terhitung</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
         <h3 className="font-bold text-slate-800 mb-4">Tambah Simpanan</h3>
         <button onClick={() => setShowModal(true)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/10">
            <Plus size={20} /> Buat Setoran Baru
         </button>
      </div>

      {/* History Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Riwayat Simpanan</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                      <tr>
                          <th className="px-6 py-4">Tanggal</th>
                          <th className="px-6 py-4">Keterangan</th>
                          <th className="px-6 py-4 text-center">Status</th>
                          <th className="px-6 py-4 text-right">Nominal</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {savingsHistory.length === 0 ? (
                          <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">Belum ada riwayat simpanan.</td></tr>
                      ) : (
                          savingsHistory.map((trx) => {
                              const isPositive = trx.type === 'DEPOSIT' || trx.type === 'PAYMENT';
                              return (
                                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                                      <td className="px-6 py-4 text-slate-600">{trx.date}</td>
                                      <td className="px-6 py-4 font-medium text-slate-800">{trx.description}</td>
                                      <td className="px-6 py-4 text-center">
                                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                              trx.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                                              trx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                          }`}>
                                              {trx.status === 'APPROVED' ? 'Berhasil' : trx.status === 'PENDING' ? 'Menunggu' : 'Gagal'}
                                          </span>
                                      </td>
                                      <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                                          {isPositive ? '+' : '-'}{formatIDR(trx.amount)}
                                      </td>
                                  </tr>
                              );
                          })
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* Deposit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
           <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-xl font-bold text-slate-800">Form Setoran</h3>
                   <button onClick={() => setShowModal(false)}><X size={24} className="text-slate-400"/></button>
               </div>
               
               <div className="space-y-4">
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Tanggal Setoran</label>
                       <div className="relative">
                           <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                           <input 
                               type="date" 
                               value={date} 
                               onChange={e => setDate(e.target.value)}
                               className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500" 
                           />
                       </div>
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Jenis Simpanan</label>
                       <select 
                        value={savingType} 
                        onChange={e => setSavingType(e.target.value)}
                        className="w-full border p-3 rounded-lg bg-white"
                       >
                           <option>Simpanan Sukarela</option>
                           <option>Simpanan Wajib Bulanan</option>
                           <option>Simpanan Pokok</option>
                       </select>
                   </div>
                   
                   <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Nominal (Rp)</label>
                       <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0"
                        className="w-full border p-3 rounded-lg font-bold text-lg"
                       />
                   </div>

                   <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Metode Pembayaran</label>
                       <div className="grid grid-cols-3 gap-2">
                           {['Tunai', 'Transfer Bank', 'E-Wallet'].map(method => (
                               <button 
                                key={method}
                                onClick={() => setPaymentMethod(method)}
                                className={`p-2 rounded-lg text-xs font-bold border transition-colors ${paymentMethod === method ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}
                               >
                                   {method}
                               </button>
                           ))}
                       </div>
                   </div>

                   <div className="pt-4">
                       <button onClick={handleDeposit} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2">
                           <MessageCircle size={20} /> Konfirmasi via WhatsApp
                       </button>
                   </div>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};

export const UserShop: React.FC<UserShopProps> = ({ user, products, onAddTransaction }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{product: Product, qty: number}[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');

  const filteredProducts = products.filter(p => 
     p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (product: Product) => {
      if(product.stock <= 0) return alert("Stok habis");
      const existing = cart.find(c => c.product.id === product.id);
      if(existing) {
          if(existing.qty >= product.stock) return alert("Maksimal stok tercapai");
          setCart(cart.map(c => c.product.id === product.id ? {...c, qty: c.qty + 1} : c));
      } else {
          setCart([...cart, {product, qty: 1}]);
      }
  };

  const updateQty = (id: string, delta: number) => {
      setCart(cart.map(c => {
          if(c.product.id === id) {
              const newQty = c.qty + delta;
              if(newQty > c.product.stock) return c;
              if(newQty < 1) return c;
              return {...c, qty: newQty};
          }
          return c;
      }));
  };

  const removeFromCart = (id: string) => {
      setCart(cart.filter(c => c.product.id !== id));
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const handleCheckout = () => {
      if(cart.length === 0) return;
      setShowPaymentModal(true);
  };

  const handleWhatsAppCheckout = () => {
      // 1. Create Transaction Records (PENDING)
      cart.forEach(item => {
          onAddTransaction({
            id: `TRX-SHOP-${Date.now()}-${item.product.id}`,
            memberId: user.id,
            date: new Date().toISOString().split('T')[0],
            type: 'PURCHASE',
            amount: item.product.price * item.qty,
            profit: (item.product.price - (item.product.buyPrice || 0)) * item.qty, // Added fallback || 0
            status: 'PENDING', // Changed to PENDING so it requires Admin Approval before hitting Finance/SHU
            description: `Belanja: ${item.product.name} (${item.qty}x)`
          });
      });

      // 2. Redirect WhatsApp
      const adminNumber = "628123456789";
      const itemsList = cart.map(c => `- ${c.product.name} (${c.qty}x) : ${formatIDR(c.product.price * c.qty)}`).join('\n');
      const message = `Halo Admin, saya *${user.name}* ingin memesan:\n\n${itemsList}\n\n*Total: ${formatIDR(totalPrice)}*\nMetode Bayar: ${paymentMethod}\n\nMohon diproses.`;
      
      const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`;
      
      window.open(whatsappUrl, '_blank');
      setCart([]);
      setShowPaymentModal(false);
      setShowCart(false);
  };

  return (
    <div className="space-y-6 relative">
       <div className="flex justify-between items-center sticky top-0 bg-slate-50 z-10 py-4">
           <h2 className="text-xl font-bold text-slate-800">Katalog Produk</h2>
           <div className="flex gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari produk..." 
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-500 w-40 md:w-64" 
                    />
                </div>
                <button onClick={() => setShowCart(true)} className="relative bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700">
                    <ShoppingCart size={24} />
                    {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">{cart.length}</span>}
                </button>
           </div>
       </div>

       {filteredProducts.length === 0 ? (
           <div className="text-center py-12 bg-white rounded-xl border border-slate-100">
               <ShoppingCart size={48} className="mx-auto text-slate-300 mb-4" />
               <p className="text-slate-500">Produk tidak ditemukan.</p>
           </div>
       ) : (
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
             {filteredProducts.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow flex flex-col group">
                  <div className="h-40 bg-slate-100 relative overflow-hidden">
                     <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                     {p.stock <= 0 && (
                         <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                             <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">Habis</span>
                         </div>
                     )}
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                     <h4 className="font-bold text-slate-800 line-clamp-2 mb-1">{p.name}</h4>
                     <p className="text-xs text-slate-500 mb-3">{p.category}</p>
                     <div className="mt-auto flex items-center justify-between">
                        <span className="font-bold text-emerald-600">{formatIDR(p.price)}</span>
                        <span className="text-xs text-slate-400">Stok: {p.stock}</span>
                     </div>
                     <button 
                        onClick={() => addToCart(p)}
                        disabled={p.stock <= 0}
                        className="mt-3 w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-300 text-white rounded-lg text-sm font-medium transition-colors"
                     >
                        + Keranjang
                     </button>
                  </div>
                </div>
             ))}
           </div>
       )}

       {/* Cart Modal */}
       {showCart && (
           <div className="fixed inset-0 z-50 flex justify-end bg-black/50 animate-fade-in">
               <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in-right">
                   <div className="flex justify-between items-center mb-6 border-b pb-4">
                       <h3 className="text-xl font-bold text-slate-800">Keranjang Belanja</h3>
                       <button onClick={() => setShowCart(false)}><X size={24} className="text-slate-400"/></button>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto space-y-4">
                       {cart.length === 0 ? (
                           <p className="text-center text-slate-400 mt-10">Keranjang kosong.</p>
                       ) : (
                           cart.map((item, idx) => (
                               <div key={idx} className="flex gap-4 items-center">
                                   <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                       <img src={item.product.image} className="w-full h-full object-cover"/>
                                   </div>
                                   <div className="flex-1">
                                       <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.product.name}</h4>
                                       <p className="text-emerald-600 font-bold text-sm">{formatIDR(item.product.price)}</p>
                                   </div>
                                   <div className="flex items-center gap-2">
                                       <button onClick={() => updateQty(item.product.id, -1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200"><Minus size={14}/></button>
                                       <span className="text-sm font-bold w-4 text-center">{item.qty}</span>
                                       <button onClick={() => updateQty(item.product.id, 1)} className="p-1 rounded bg-slate-100 hover:bg-slate-200"><Plus size={14}/></button>
                                   </div>
                                   <button onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
                               </div>
                           ))
                       )}
                   </div>

                   <div className="border-t pt-4 mt-4">
                       <div className="flex justify-between items-center mb-4">
                           <span className="font-bold text-slate-600">Total Belanja</span>
                           <span className="font-bold text-xl text-slate-800">{formatIDR(totalPrice)}</span>
                       </div>
                       <button 
                        disabled={cart.length === 0}
                        onClick={handleCheckout} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg"
                       >
                           Checkout Sekarang
                       </button>
                   </div>
               </div>
           </div>
       )}

       {/* Payment Modal */}
       {showPaymentModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4 animate-fade-in">
           <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
               <div className="flex justify-between items-center mb-6">
                   <h3 className="text-lg font-bold text-slate-800">Pilih Pembayaran</h3>
                   <button onClick={() => setShowPaymentModal(false)}><X size={24} className="text-slate-400"/></button>
               </div>
               <div className="space-y-3 mb-6">
                   {['Tunai', 'Transfer Bank', 'E-Wallet'].map(method => (
                       <label key={method} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === method ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'}`}>
                           <span className="font-bold text-slate-700">{method}</span>
                           <input 
                            type="radio" 
                            name="payment" 
                            checked={paymentMethod === method} 
                            onChange={() => setPaymentMethod(method)}
                            className="accent-emerald-600 w-5 h-5"
                           />
                       </label>
                   ))}
               </div>
               <button onClick={handleWhatsAppCheckout} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg">
                   <MessageCircle size={20}/> Lanjut ke WhatsApp
               </button>
           </div>
        </div>
       )}
    </div>
  );
};

export const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser }) => {
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({...user});
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Modal States
    const [showDocsModal, setShowDocsModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ old: '', new: '', confirm: '' });

    const handleSave = () => {
        onUpdateUser(formData);
        setEditMode(false);
        alert("Profil berhasil diperbarui!");
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, avatarUrl: reader.result as string });
                // Automatically save when photo is uploaded for UX
                onUpdateUser({ ...formData, avatarUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChangePassword = () => {
        if(passwordForm.new !== passwordForm.confirm) return alert("Konfirmasi password tidak cocok");
        alert("Password berhasil diubah!");
        setShowPasswordModal(false);
        setPasswordForm({ old: '', new: '', confirm: '' });
    };

    return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Profile Card */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-slate-200 overflow-hidden shrink-0 border-4 border-slate-50 shadow-inner">
                <img src={formData.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <Camera className="text-white" size={24} />
            </button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </div>
          
          <div className="flex-1 text-center md:text-left w-full">
              {editMode ? (
                  <div className="space-y-3">
                      <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" placeholder="Nama Lengkap"/>
                      <input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded" placeholder="Email"/>
                  </div>
              ) : (
                <>
                    <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
                    <p className="text-slate-500">{user.email}</p>
                    <div className="flex gap-2 mt-2 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">Anggota Aktif</span>
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">Bergabung: {user.joinDate}</span>
                    </div>
                </>
              )}
          </div>
          
          <button 
            onClick={() => editMode ? handleSave() : setEditMode(true)}
            className={`p-3 rounded-full ${editMode ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
              {editMode ? <Save size={20}/> : <Edit2 size={20}/>}
          </button>
      </div>

      {/* Security & Docs */}
      <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Shield size={20} className="text-emerald-600" /> Dokumen & Keamanan
          </h3>
          <div className="space-y-4">
              {/* Change Password */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full text-slate-500"><Lock size={18} /></div>
                      <div>
                          <p className="font-medium text-slate-800">Password</p>
                          <p className="text-xs text-slate-500">Amankan akun anda secara berkala</p>
                      </div>
                  </div>
                  <button onClick={() => setShowPasswordModal(true)} className="text-emerald-600 text-sm font-bold hover:underline">Ubah</button>
              </div>

              {/* AD/ART */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full text-slate-500"><FileText size={18} /></div>
                      <div>
                          <p className="font-medium text-slate-800">AD/ART Koperasi</p>
                          <p className="text-xs text-slate-500">Dokumen legalitas koperasi</p>
                      </div>
                  </div>
                  <button onClick={() => alert("Mengunduh Dokumen AD/ART...")} className="text-emerald-600 text-sm font-bold hover:underline flex items-center gap-1">
                      <Download size={16}/> Unduh PDF
                  </button>
              </div>

              {/* Digital Invoices */}
              <div className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                      <div className="bg-white p-2 rounded-full text-slate-500"><FileCheck size={18} /></div>
                      <div>
                          <p className="font-medium text-slate-800">Bukti Transaksi Digital</p>
                          <p className="text-xs text-slate-500">Riwayat invoice & setoran</p>
                      </div>
                  </div>
                  <button onClick={() => setShowDocsModal(true)} className="text-emerald-600 text-sm font-bold hover:underline">Lihat Arsip</button>
              </div>
          </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-2xl">
                  <h3 className="font-bold text-lg mb-4">Ubah Kata Sandi</h3>
                  <div className="space-y-3">
                      <input type="password" placeholder="Password Lama" className="w-full border p-2 rounded" 
                        value={passwordForm.old} onChange={e => setPasswordForm({...passwordForm, old: e.target.value})}/>
                      <input type="password" placeholder="Password Baru" className="w-full border p-2 rounded" 
                        value={passwordForm.new} onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}/>
                      <input type="password" placeholder="Konfirmasi Password Baru" className="w-full border p-2 rounded" 
                        value={passwordForm.confirm} onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}/>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                      <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 text-slate-600">Batal</button>
                      <button onClick={handleChangePassword} className="px-4 py-2 bg-emerald-600 text-white rounded font-bold">Simpan</button>
                  </div>
              </div>
          </div>
      )}

       {/* Docs Modal */}
       {showDocsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg">Arsip Dokumen</h3>
                    <button onClick={() => setShowDocsModal(false)}><X size={20}/></button>
                  </div>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                      {[1,2,3].map(i => (
                          <div key={i} className="flex justify-between items-center p-3 border rounded hover:bg-slate-50">
                              <div>
                                  <p className="font-bold text-sm">Invoice INV-00{i}</p>
                                  <p className="text-xs text-slate-500">12 Maret 2024</p>
                              </div>
                              <button className="text-emerald-600 text-xs font-bold border border-emerald-200 px-2 py-1 rounded">Unduh</button>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export const UserInformation: React.FC<UserInformationProps> = ({ news, settings }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <h3 className="font-bold text-lg text-slate-800">Berita & Pengumuman</h3>
            {news.length === 0 ? (
                <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-400">
                    Belum ada pengumuman terbaru.
                </div>
            ) : (
                news.map((item, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">{item.date}</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">{item.content}</p>
                    </div>
                ))
            )}
        </div>
        
        <div className="space-y-6">
            <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                    <FileText size={20} /> Tentang Koperasi
                </h3>
                <div className="space-y-3 text-sm opacity-90">
                    <p><span className="font-bold">Nama:</span> {settings.name}</p>
                    <p><span className="font-bold">Alamat:</span> {settings.address}</p>
                    <p><span className="font-bold">Email:</span> {settings.email}</p>
                    <p><span className="font-bold">Telepon:</span> {settings.phone}</p>
                </div>
            </div>
            
            {/* Download Report Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Laporan Tahunan</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileText className="text-red-500" size={24} />
                            <div>
                                <p className="font-bold text-sm">Laporan RAT 2023</p>
                                <p className="text-xs text-slate-500">PDF • 2.4 MB</p>
                            </div>
                        </div>
                        <button 
                            onClick={() => alert("Mengunduh Laporan RAT 2023...")}
                            className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        >
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- SHU Saya Component ---
export const UserSHU: React.FC<UserSHUProps> = ({ user, shuConfig, transactions, onAddTransaction, financialData }) => {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  
  const totalSavings = calculateUserSavings(transactions);
  const totalEligibleSavings = calculateEligibleUserSavings(transactions); // Use filtered savings
  const totalPurchases = calculateUserPurchases(transactions);
  
  // Calculate Real-time SHU for User
  // 1. Jasa Modal
  const jasaModalPool = financialData.netIncome * shuConfig.allocations.jasaModal;
  
  // Use Eligible Savings for Ratio Calculation
  const mySavingsRatio = financialData.totalEligibleSavings > 0 ? (totalEligibleSavings / financialData.totalEligibleSavings) : 0;
  const myJasaModal = jasaModalPool * mySavingsRatio;

  // 2. Jasa Transaksi
  const jasaTransaksiPool = financialData.netIncome * shuConfig.allocations.jasaTransaksi;
  const myPurchaseRatio = financialData.totalMemberPurchases > 0 ? (totalPurchases / financialData.totalMemberPurchases) : 0;
  const myJasaTransaksi = jasaTransaksiPool * myPurchaseRatio;

  const totalSHU = myJasaModal + myJasaTransaksi;

  const data = [
    { name: 'Jasa Modal', value: myJasaModal, color: '#059669' },
    { name: 'Jasa Transaksi', value: myJasaTransaksi, color: '#34d399' },
  ];

  const handleWhatsAppWithdrawal = () => {
    const amount = parseInt(withdrawAmount);
    if (!withdrawAmount || amount <= 0) {
        return alert("Masukkan jumlah penarikan yang valid");
    }

    if (amount > totalSHU) {
        return alert("Saldo SHU tidak mencukupi untuk melakukan penarikan ini.");
    }

    const adminNumber = "628123456789";
    const header = `Halo Admin Koperasi, saya *${user.name}* ingin mengajukan penarikan SHU:`;
    const details = `Saldo SHU Tersedia: ${formatIDR(totalSHU)}\n*Nominal Penarikan: ${formatIDR(amount)}*`;
    const footer = "Mohon diproses pencairannya. Terima kasih.";

    const fullMessage = `${header}\n\n${details}\n\n${footer}`;
    const whatsappUrl = `https://wa.me/${adminNumber}?text=${encodeURIComponent(fullMessage)}`;

    // Update Global State
    const newTrx: Transaction = {
        id: `TRX-${Date.now()}`,
        memberId: user.id,
        date: new Date().toISOString().split('T')[0],
        type: 'SHU_WITHDRAWAL',
        amount: amount,
        status: 'PENDING',
        description: 'Penarikan SHU (Pengajuan)'
    };
    onAddTransaction(newTrx);

    window.open(whatsappUrl, '_blank');
    setWithdrawAmount('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
           <h3 className="font-bold text-lg text-slate-800 mb-4">Rincian SHU Saya (Real-Time)</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
             <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatIDR(value)} />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="space-y-4">
               <div>
                 <p className="text-sm text-slate-500">Total SHU Estimasi</p>
                 <h2 className="text-3xl font-bold text-slate-800">{formatIDR(totalSHU)}</h2>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">Jasa Modal (30%)</span>
                            <span className="text-[10px] text-slate-400">Proporsi Simpanan Efektif: {(mySavingsRatio * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">{formatIDR(myJasaModal)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-700">Jasa Transaksi (20%)</span>
                            <span className="text-[10px] text-slate-400">Proporsi Belanja: {(myPurchaseRatio * 100).toFixed(2)}%</span>
                        </div>
                      </div>
                      <span className="font-bold text-slate-800">{formatIDR(myJasaTransaksi)}</span>
                 </div>
               </div>
             </div>
           </div>
        </div>
        
        {/* Transaction History with Late Payment Flags */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-4">Riwayat SHU & Simpanan</h3>
          <div className="space-y-3">
               {transactions.filter(t => t.type === 'SHU_WITHDRAWAL' || (t.type === 'PAYMENT' && t.description.includes('Wajib'))).map(trx => {
                 const isLate = isTransactionLate(trx);
                 return (
                    <div key={trx.id} className="flex justify-between items-center p-4 border rounded-lg border-slate-100 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${trx.type === 'SHU_WITHDRAWAL' ? 'bg-purple-100 text-purple-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                {trx.type === 'SHU_WITHDRAWAL' ? <Wallet size={16}/> : <CheckCircle size={16}/>}
                            </div>
                            <div>
                                <p className="font-medium text-slate-800 text-sm">{trx.description}</p>
                                <p className="text-xs text-slate-500">{trx.date} • {trx.status}</p>
                                {isLate && (
                                    <div className="flex items-center gap-1 mt-1 text-[10px] text-red-500 font-bold">
                                        <AlertTriangle size={10} />
                                        <span>Telat - Tidak dihitung SHU bulan ini</span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className={`${trx.type === 'SHU_WITHDRAWAL' ? 'text-orange-600' : 'text-emerald-600'} font-bold`}>
                            {trx.type === 'SHU_WITHDRAWAL' ? '-' : '+'}{formatIDR(trx.amount)}
                        </span>
                    </div>
                 );
               })}
               {transactions.filter(t => t.type === 'SHU_WITHDRAWAL' || (t.type === 'PAYMENT' && t.description.includes('Wajib'))).length === 0 && (
                   <p className="text-slate-500 italic text-center py-4">Belum ada riwayat SHU atau Simpanan Wajib.</p>
               )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-slate-800 text-white p-6 rounded-xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
             <CreditCard size={120} />
          </div>
          <h3 className="font-bold text-lg mb-2 relative z-10">Form Penarikan SHU</h3>
          <p className="text-slate-300 text-sm mb-6 relative z-10">SHU dapat ditarik setelah RAT disahkan.</p>
          
          <div className="space-y-4 relative z-10">
             <div>
               <label className="block text-xs font-medium text-slate-400 mb-1">Saldo SHU Tersedia</label>
               <input type="text" value={formatIDR(totalSHU)} disabled className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white font-bold opacity-70" />
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-400 mb-1">Jumlah Penarikan</label>
               <input 
                 type="number" 
                 value={withdrawAmount}
                 onChange={(e) => setWithdrawAmount(e.target.value)}
                 placeholder="Min. 50.000" 
                 className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
               />
             </div>
             <button onClick={handleWhatsAppWithdrawal} className="w-full bg-emerald-600 hover:bg-emerald-500 py-3 rounded-lg font-bold transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transform active:scale-95">
               <MessageCircle size={18} /> Ajukan Penarikan
             </button>
          </div>
        </div>
        
        {/* Info Box Rule */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <h4 className="font-bold text-yellow-800 text-sm mb-2 flex items-center gap-2">
                <AlertTriangle size={16} /> Aturan Simpanan Wajib
            </h4>
            <p className="text-xs text-yellow-700 leading-relaxed">
                Pembayaran Setoran Simpanan Wajib paling lambat tanggal 10 setiap bulannya. Jika membayar di atas tanggal 10, maka 
                jumlah tersebut <b>tidak akan dihitung</b> dalam pembagian SHU Jasa Modal untuk periode berjalan.
            </p>
        </div>
      </div>
    </div>
  );
};