import React, { useState, useRef } from 'react';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  MoreHorizontal,
  Package,
  Search,
  FileText,
  Settings,
  Plus,
  Trash2,
  Filter,
  Wallet,
  Edit,
  Power,
  X,
  Camera,
  ShoppingCart,
  Phone,
  Image as ImageIcon,
  Tag,
  Calendar,
  User,
  BookOpen,
  ArrowDown,
  ArrowUp,
  Download,
  Printer,
  Upload,
  Database,
  Save
} from 'lucide-react';
import { formatIDR } from '../services/mockDb';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Transaction, Product, SHUConfig, JournalEntry } from '../types';

// --- Interfaces for Props ---
interface AdminDashboardProps {
  onNavigate: (tab: string) => void;
  transactions: Transaction[];
  members: any[];
  assets: number;
  onUpdateTransactionStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  financialData: any; 
}

interface AdminSHUManagerProps {
  shuConfig: SHUConfig;
  onUpdateSHUConfig: (config: SHUConfig) => void;
  financialData: any; 
}

interface AdminMemberManagementProps {
  members: any[];
  onAddMember: (member: any) => void;
  onUpdateMember: (member: any) => void;
  onDeleteMember: (id: string) => void;
}

interface AdminInventoryProps {
  products: Product[];
  members: any[]; 
  onAddProduct: (p: Product) => void;
  onUpdateProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onUpdateStock: (id: string, qty: number) => void;
  onAddTransaction: (trx: Transaction) => void; 
}

interface AdminSettingsProps {
  settings: any;
  news: any[];
  onUpdateSettings: (s: any) => void;
  onAddNews: (n: any) => void;
  onDeleteNews: (id: number) => void;
  onExportData: () => void;
  onImportData: (data: any) => void;
}

interface AdminSavingsManagerProps {
  transactions: Transaction[];
  members: any[];
  onUpdateTransactionStatus: (id: string, status: 'APPROVED' | 'REJECTED') => void;
  onAddTransaction: (trx: Transaction) => void;
}

interface AdminReportsProps {
  transactions: Transaction[];
  members: any[];
  products: Product[];
  journal: JournalEntry[];
  financialData: any;
  shuConfig: SHUConfig;
}

interface AdminFinanceProps {
  journal: JournalEntry[];
  onAddJournalEntry: (entry: JournalEntry) => void;
}

// --- Admin Dashboard ---
export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, transactions, members, assets, onUpdateTransactionStatus, financialData }) => {
  const pendingTasks = transactions.filter(t => t.status === 'PENDING');
  
  // Stats Calculation
  const totalSavings = transactions.filter(t => (t.type === 'DEPOSIT' || t.type === 'PAYMENT') && t.status === 'APPROVED').reduce((acc, t) => acc + t.amount, 0);

  const handleAction = (id: string, action: 'APPROVED' | 'REJECTED') => {
    onUpdateTransactionStatus(id, action);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-2">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Aset</p>
             <DollarSign size={20} className="text-emerald-600" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{formatIDR(assets)}</h3>
           <span className="text-xs text-green-600 font-medium">+0% YoY</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-2">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Anggota Aktif</p>
             <Users size={20} className="text-blue-600" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{members.length}</h3>
           <span className="text-xs text-blue-600 font-medium">Data Realtime</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm group relative">
           <div className="flex items-center justify-between mb-2">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Total Simpanan Anggota</p>
             <Wallet size={20} className="text-orange-600" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{formatIDR(totalSavings)}</h3>
           <span className="text-xs text-slate-400 font-medium">Akumulasi Pokok, Wajib, Sukarela</span>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center justify-between mb-2">
             <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">Laba Usaha (SHU)</p>
             <Package size={20} className="text-purple-600" />
           </div>
           <h3 className="text-2xl font-bold text-slate-800">{formatIDR(financialData.netIncome)}</h3>
           <span className="text-xs text-slate-400 font-medium">Real-Time (Bersih)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800">Persetujuan Menunggu</h3>
             <span className={`px-2 py-1 text-xs font-bold rounded-full ${pendingTasks.length > 0 ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
               {pendingTasks.length} Pending
             </span>
           </div>
           <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
             {pendingTasks.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-sm italic">
                    Semua tugas telah diselesaikan. Kerja bagus!
                </div>
             ) : (
                pendingTasks.map((task) => (
                <div key={task.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div>
                    <p className="font-semibold text-slate-800 text-sm">{task.description}</p>
                    <p className="text-xs text-slate-500">{task.date} • {formatIDR(task.amount)}</p>
                    </div>
                    <div className="flex space-x-2">
                    <button 
                        onClick={() => handleAction(task.id, 'APPROVED')}
                        className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                        title="Setujui"
                    >
                        <CheckCircle size={18} />
                    </button>
                    <button 
                        onClick={() => handleAction(task.id, 'REJECTED')}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Tolak"
                    >
                        <XCircle size={18} />
                    </button>
                    </div>
                </div>
                ))
             )}
           </div>
           <div className="p-4 border-t border-slate-100 text-center">
             <button onClick={() => onNavigate('simpanan_adm')} className="text-sm text-emerald-600 font-medium hover:underline">Lihat Semua Tugas</button>
           </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
           <h3 className="font-bold text-slate-800 mb-6">Pertumbuhan Aset (Jutaan Rupiah)</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={[
                 {name: 'Jan', val: 0}, {name: 'Feb', val: 0}, {name: 'Mar', val: 0}, 
                 {name: 'Apr', val: 0}, {name: 'Mei', val: 0}, {name: 'Jun', val: 0}
               ]}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                 <XAxis dataKey="name" axisLine={false} tickLine={false} />
                 <YAxis axisLine={false} tickLine={false} />
                 <Tooltip />
                 <Line type="monotone" dataKey="val" stroke="#059669" strokeWidth={3} dot={{r: 4}} activeDot={{r: 8}} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};

export const AdminMemberManagement: React.FC<AdminMemberManagementProps> = ({ members, onAddMember, onUpdateMember, onDeleteMember }) => {
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ id: '', name: '', email: '', phone: '', nik: '' });
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('Semua'); 
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [activeActionId, setActiveActionId] = useState<string | null>(null);

    const filteredMembers = members.filter(m => {
        const matchesSearch = 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
            m.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filterStatus === 'Semua' || m.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const handleSaveMember = () => {
        if (!formData.name) return;
        
        if (isEditing) {
            onUpdateMember({ ...formData, status: 'Aktif' });
            alert('Data anggota diperbarui!');
        } else {
            const newId = `USR-00${members.length + 1}`;
            onAddMember({
                id: newId,
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '-',
                nik: formData.nik || '-',
                joinDate: new Date().toISOString().split('T')[0],
                status: 'Aktif'
            });
            alert('Anggota baru berhasil didaftarkan!');
        }
        closeModal();
    };

    const handleDelete = (id: string) => {
        if (confirm('Hapus anggota ini?')) onDeleteMember(id);
        setActiveActionId(null);
    };

    const handleToggleStatus = (member: any) => {
        onUpdateMember({ ...member, status: member.status === 'Aktif' ? 'Non-Aktif' : 'Aktif' });
        setActiveActionId(null);
    };

    const handleEdit = (member: any) => {
        setFormData({ ...member });
        setIsEditing(true);
        setShowModal(true);
        setActiveActionId(null);
    };

    const openAddModal = () => {
        setFormData({ id: '', name: '', email: '', phone: '', nik: '' });
        setIsEditing(false);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ id: '', name: '', email: '', phone: '', nik: '' });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px]">
            {/* Header & Controls */}
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-3 text-slate-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari anggota..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:border-emerald-500 transition-colors" 
                    />
                </div>
                <div className="flex space-x-3">
                    <div className="relative">
                        <button 
                            onClick={() => setShowFilterMenu(!showFilterMenu)}
                            className={`px-4 py-2.5 border rounded-lg font-medium flex items-center gap-2 transition-colors ${filterStatus !== 'Semua' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-300 text-slate-700'}`}
                        >
                            <Filter size={18} /> {filterStatus}
                        </button>
                        {showFilterMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 overflow-hidden">
                                <div className="p-2 space-y-1">
                                    {['Semua', 'Aktif', 'Non-Aktif'].map((status) => (
                                        <button 
                                            key={status}
                                            onClick={() => { setFilterStatus(status); setShowFilterMenu(false); }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-slate-50`}
                                        >
                                            {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <button onClick={openAddModal} className="px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center gap-2 shadow-lg shadow-emerald-900/10">
                        <Plus size={18} /> Anggota Baru
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto h-full">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-sm font-semibold uppercase tracking-wider border-b border-slate-200">
                            <th className="px-6 py-4">ID Anggota</th>
                            <th className="px-6 py-4">Nama / Kontak</th>
                            <th className="px-6 py-4">Bergabung</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredMembers.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-slate-600 font-medium">{m.id}</td>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">{m.name}</p>
                                    <p className="text-xs text-slate-400">{m.email}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-500">{m.joinDate}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${m.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                        {m.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right relative">
                                    <button 
                                        onClick={() => setActiveActionId(activeActionId === m.id ? null : m.id)}
                                        className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>
                                    {activeActionId === m.id && (
                                        <div className="absolute right-8 top-10 w-48 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden text-left">
                                            <div className="p-1">
                                                <button onClick={() => handleEdit(m)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                                    <Edit size={16} className="text-blue-500"/> Edit Data
                                                </button>
                                                <button onClick={() => handleToggleStatus(m)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 rounded-lg">
                                                    <Power size={16} className={m.status === 'Aktif' ? 'text-orange-500' : 'text-green-500'}/> 
                                                    {m.status === 'Aktif' ? 'Non-aktifkan' : 'Aktifkan'}
                                                </button>
                                                <div className="h-px bg-slate-100 my-1"></div>
                                                <button onClick={() => handleDelete(m.id)} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                                                    <Trash2 size={16} /> Hapus Anggota
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Click outside listener */}
            {(showFilterMenu || activeActionId) && <div className="fixed inset-0 z-10 bg-transparent" onClick={() => { setShowFilterMenu(false); setActiveActionId(null); }}></div>}
            
            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                             <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Data Anggota' : 'Pendaftaran Anggota Baru'}</h3>
                             <button onClick={closeModal}><X size={24} className="text-slate-400"/></button>
                        </div>
                        <div className="space-y-4">
                            <input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded" placeholder="Nama Lengkap" />
                            <input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border p-2 rounded" placeholder="Email" />
                            <input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full border p-2 rounded" placeholder="No Telepon" />
                        </div>
                        <div className="flex gap-3 justify-end pt-4 mt-4 border-t">
                            <button onClick={closeModal} className="px-4 py-2 border rounded">Batal</button>
                            <button onClick={handleSaveMember} className="px-4 py-2 bg-emerald-600 text-white rounded">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
};

export const AdminInventory: React.FC<AdminInventoryProps> = ({ products, members, onAddProduct, onUpdateProduct, onDeleteProduct, onUpdateStock, onAddTransaction }) => {
    const [showModal, setShowModal] = useState(false);
    const [showPOSModal, setShowPOSModal] = useState(false); 
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [formData, setFormData] = useState({ 
        name: '', 
        price: '', 
        buyPrice: '', 
        stock: '', 
        category: 'Sembako', 
        sku: '', 
        description: '', 
        image: '',
        supplierPhone: ''
    });
    
    const [posForm, setPosForm] = useState({ 
        memberId: '', 
        productId: '', 
        qty: 1,
        date: new Date().toISOString().split('T')[0]
    });

    const selectedProduct = products.find(p => p.id === posForm.productId);
    const posTotal = selectedProduct ? selectedProduct.price * posForm.qty : 0;

    const openAddModal = () => {
        setFormData({ name: '', price: '', buyPrice: '', stock: '', category: 'Sembako', sku: '', description: '', image: '', supplierPhone: '' });
        setIsEditing(false);
        setEditingId(null);
        setShowModal(true);
    };

    const openEditModal = (product: Product) => {
        setFormData({
            name: product.name,
            price: product.price.toString(),
            buyPrice: product.buyPrice?.toString() || (product.price * 0.8).toString(), 
            stock: product.stock.toString(),
            category: product.category,
            sku: product.sku || `SKU-${product.id.split('-')[1] || '000'}`,
            description: product.description || `Deskripsi produk...`,
            image: product.image,
            supplierPhone: product.supplierPhone || ''
        });
        setIsEditing(true);
        setEditingId(product.id);
        setShowModal(true);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = () => {
        if (!formData.name) return;
        const finalImage = formData.image || `https://picsum.photos/200/200?random=${Math.random()}`;

        const productData: Product = {
            id: editingId || `PRD-${Date.now()}`,
            name: formData.name,
            price: parseInt(formData.price) || 0,
            buyPrice: parseInt(formData.buyPrice) || 0,
            stock: parseInt(formData.stock) || 0,
            category: formData.category,
            image: finalImage,
            sku: formData.sku,
            description: formData.description,
            supplierPhone: formData.supplierPhone
        };

        if (isEditing && editingId) {
            onUpdateProduct(productData);
            alert("Data produk diperbarui.");
        } else {
            onAddProduct(productData);
            alert("Produk ditambahkan.");
        }
        setShowModal(false);
    };

    const handlePOSSubmit = () => {
        if(!posForm.productId) return alert("Pilih produk.");
        if(posForm.qty <= 0) return alert("Jumlah minimal 1.");
        
        const product = products.find(p => p.id === posForm.productId);
        if(!product) return;
        if(posForm.qty > product.stock) return alert("Stok tidak mencukupi!");

        onUpdateStock(product.id, posForm.qty);

        const totalPrice = product.price * posForm.qty;
        const totalProfit = (product.price - (product.buyPrice || 0)) * posForm.qty;
        const buyerName = posForm.memberId ? members.find(m => m.id === posForm.memberId)?.name : 'Umum/Non-Member';
        
        const newTrx: Transaction = {
            id: `TRX-POS-${Date.now()}`,
            memberId: posForm.memberId || 'NON-MEMBER',
            date: posForm.date,
            type: 'PURCHASE',
            amount: totalPrice,
            profit: totalProfit,
            status: 'APPROVED',
            description: `Pembelian Toko: ${product.name} (${posForm.qty}x) oleh ${buyerName}`
        };
        onAddTransaction(newTrx);

        alert(`Penjualan Berhasil!\nTotal: ${formatIDR(totalPrice)}`);
        
        setShowPOSModal(false);
        setPosForm({ memberId: '', productId: '', qty: 1, date: new Date().toISOString().split('T')[0] });
    };

    const profitMargin = (parseInt(formData.price) || 0) - (parseInt(formData.buyPrice) || 0);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[500px] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <h3 className="font-bold text-slate-800">Stok Produk</h3>
                    <div className="flex gap-2">
                        <button onClick={() => setShowPOSModal(true)} className="text-white bg-blue-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-1">
                            <ShoppingCart size={16}/> Kasir
                        </button>
                        <button onClick={openAddModal} className="text-white bg-emerald-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-emerald-700 flex items-center gap-1">
                            <Plus size={16}/> Tambah
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-slate-500 font-medium">
                            <tr>
                                <th className="px-6 py-3">Produk</th>
                                <th className="px-6 py-3 text-right">Harga Jual</th>
                                <th className="px-6 py-3 text-center">Stok</th>
                                <th className="px-6 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {products.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-slate-100 rounded-lg overflow-hidden shrink-0 border">
                                                <img src={p.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-slate-800 line-clamp-1">{p.name}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-xs text-slate-500">{p.category}</p>
                                                    {p.sku && <span className="text-[10px] bg-slate-100 px-1 rounded text-slate-500">{p.sku}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div>
                                            <span className="block">{formatIDR(p.price)}</span>
                                            {p.buyPrice > 0 && <span className="text-xs text-emerald-600 block">Margin: {formatIDR(p.price - p.buyPrice)}</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => openEditModal(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={16}/></button>
                                            <button onClick={() => onDeleteProduct(p.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 size={16}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Report Section */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Ringkasan Penjualan</h3>
                    <div className="flex justify-between items-center"><span className="text-slate-500">Bulan Ini</span><span className="font-bold text-slate-800">{formatIDR(0)}</span></div>
                </div>
            </div>
            
            {/* Modal Tambah/Edit Produk */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-2xl w-full p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
                         <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold text-slate-800">{isEditing ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                            <button onClick={() => setShowModal(false)} className="hover:bg-slate-100 rounded-full p-1"><X size={24} className="text-slate-500"/></button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <div className="col-span-1">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Foto Produk</label>
                                <div 
                                    className="aspect-square bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 transition-colors relative overflow-hidden group"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {formData.image ? (
                                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <>
                                            <ImageIcon size={32} className="text-slate-400 mb-2" />
                                            <span className="text-xs text-slate-500 text-center px-2">Klik untuk upload</span>
                                        </>
                                    )}
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="text-white" size={24}/>
                                    </div>
                                </div>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                             </div>

                             <div className="col-span-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Produk</label>
                                        <input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" placeholder="Contoh: Beras Premium 5kg" />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kategori</label>
                                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg">
                                            <option>Sembako</option><option>Elektronik</option><option>Pakaian</option><option>Makanan</option><option>Minuman</option><option>Lainnya</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kode SKU</label>
                                        <input value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" placeholder="Opsional" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Beli (HPP)</label>
                                        <input type="number" value={formData.buyPrice} onChange={e => setFormData({...formData, buyPrice: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" placeholder="0" />
                                     </div>
                                     <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Jual</label>
                                        <input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg font-bold text-emerald-700" placeholder="0" />
                                     </div>
                                     {profitMargin > 0 && (
                                         <div className="col-span-2 text-xs text-emerald-600 bg-emerald-50 p-2 rounded flex justify-between">
                                             <span>Estimasi Profit/Unit:</span>
                                             <span className="font-bold">{formatIDR(profitMargin)}</span>
                                         </div>
                                     )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Awal</label>
                                        <input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" placeholder="0" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Telepon Supplier</label>
                                        <input type="tel" value={formData.supplierPhone} onChange={e => setFormData({...formData, supplierPhone: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" placeholder="08..." />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Keterangan Produk</label>
                                    <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg" rows={2} placeholder="Deskripsi singkat..." />
                                </div>
                             </div>
                        </div>

                         <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                             <button onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors">Batal</button>
                             <button onClick={handleSaveProduct} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/10 transition-colors flex items-center gap-2">
                                <CheckCircle size={18}/> Simpan Produk
                             </button>
                         </div>
                    </div>
                </div>
            )}

            {showPOSModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-slate-800">Kasir / POS</h3>
                            <button onClick={() => setShowPOSModal(false)}><X size={20} className="text-slate-400"/></button>
                        </div>
                        
                        <div className="space-y-4">
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tanggal Transaksi</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <input 
                                        type="date" 
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500" 
                                        value={posForm.date} 
                                        onChange={e => setPosForm({...posForm, date: e.target.value})} 
                                    />
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Pembeli / Anggota</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500 appearance-none bg-white" 
                                        value={posForm.memberId} 
                                        onChange={e => setPosForm({...posForm, memberId: e.target.value})}
                                    >
                                        <option value="">Umum / Non-Anggota</option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>{m.name} - {m.id}</option>
                                        ))}
                                    </select>
                                </div>
                             </div>

                             <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Produk</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-2.5 text-slate-400" size={18} />
                                    <select 
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-emerald-500 appearance-none bg-white" 
                                        value={posForm.productId} 
                                        onChange={e => setPosForm({...posForm, productId: e.target.value})}
                                    >
                                        <option value="">-- Pilih Produk --</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} (Stok: {p.stock})</option>
                                        ))}
                                    </select>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga Satuan</label>
                                    <input 
                                        disabled 
                                        className="w-full bg-slate-50 border border-slate-200 p-2 rounded-lg text-slate-500" 
                                        value={formatIDR(selectedProduct?.price || 0)} 
                                    />
                                 </div>
                                 <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Qty</label>
                                    <input 
                                        type="number" 
                                        min="1"
                                        className="w-full border border-slate-300 p-2 rounded-lg" 
                                        value={posForm.qty} 
                                        onChange={e => setPosForm({...posForm, qty: parseInt(e.target.value) || 1})} 
                                    />
                                 </div>
                             </div>

                             <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center mt-2">
                                 <span className="text-emerald-700 font-bold text-sm">Total Pembayaran</span>
                                 <span className="text-xl font-bold text-emerald-800">{formatIDR(posTotal)}</span>
                             </div>

                             <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowPOSModal(false)} className="flex-1 py-2.5 border border-slate-300 rounded-lg font-medium text-slate-600 hover:bg-slate-50">Batal</button>
                                <button onClick={handlePOSSubmit} className="flex-1 bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-900/10">
                                    Proses Bayar
                                </button>
                             </div>
                        </div>
                    </div>
                 </div>
            )}
        </div>
    )
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, news, onUpdateSettings, onAddNews, onDeleteNews, onExportData, onImportData }) => {
    const [newsTitle, setNewsTitle] = useState('');
    const [newsContent, setNewsContent] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handlePostNews = () => {
        if(!newsTitle) return;
        onAddNews({
            id: Date.now(),
            title: newsTitle,
            content: newsContent,
            date: new Date().toISOString().split('T')[0]
        });
        setNewsTitle('');
        setNewsContent('');
        alert("Berita diposting.");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target?.result as string);
                    onImportData(data);
                } catch (err) {
                    alert("Format file tidak valid!");
                }
            };
            reader.readAsText(file);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Profil Koperasi */}
             <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Settings size={20}/> Profil Koperasi</h3>
                 <div className="space-y-4">
                     <div><label className="text-xs font-bold text-slate-500">Nama Koperasi</label><input value={settings.name} onChange={e => onUpdateSettings({name: e.target.value})} className="w-full border p-2 rounded" /></div>
                     <div><label className="text-xs font-bold text-slate-500">Alamat Lengkap</label><textarea value={settings.address} onChange={e => onUpdateSettings({address: e.target.value})} className="w-full border p-2 rounded" /></div>
                     <div><label className="text-xs font-bold text-slate-500">Email Kontak</label><input value={settings.email} onChange={e => onUpdateSettings({email: e.target.value})} className="w-full border p-2 rounded" /></div>
                     <div><label className="text-xs font-bold text-slate-500">No Telepon / WhatsApp</label><input value={settings.phone} onChange={e => onUpdateSettings({phone: e.target.value})} className="w-full border p-2 rounded" /></div>
                     <button className="bg-emerald-600 text-white px-4 py-2 rounded font-bold text-sm w-full mt-2 hover:bg-emerald-700 transition-colors">Simpan Profil</button>
                 </div>
             </div>
             
             {/* Kolom Kanan */}
             <div className="space-y-6">
                 {/* Manajemen Data Backup/Restore */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Database size={20}/> Backup & Restore Data</h3>
                     <p className="text-xs text-slate-500 mb-4">Gunakan fitur ini untuk memindahkan data antar perangkat atau menyimpan cadangan.</p>
                     
                     <div className="grid grid-cols-2 gap-4">
                         <button 
                             onClick={onExportData}
                             className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-emerald-200 bg-emerald-50 rounded-xl hover:bg-emerald-100 transition-colors group"
                         >
                             <Download size={32} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                             <span className="text-sm font-bold text-emerald-800">Download Backup</span>
                             <span className="text-[10px] text-emerald-600">Format .JSON</span>
                         </button>

                         <button 
                             onClick={() => fileInputRef.current?.click()}
                             className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors group"
                         >
                             <Upload size={32} className="text-blue-600 mb-2 group-hover:scale-110 transition-transform" />
                             <span className="text-sm font-bold text-blue-800">Restore Data</span>
                             <span className="text-[10px] text-blue-600">Upload file .JSON</span>
                         </button>
                         <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleFileChange} />
                     </div>
                 </div>

                 {/* Posting Berita */}
                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                     <h3 className="font-bold text-slate-800 mb-4">Posting Berita</h3>
                     <div className="space-y-3">
                         <input value={newsTitle} onChange={e => setNewsTitle(e.target.value)} placeholder="Judul Berita" className="w-full border p-2 rounded" />
                         <textarea value={newsContent} onChange={e => setNewsContent(e.target.value)} placeholder="Isi berita..." rows={3} className="w-full border p-2 rounded" />
                         <button onClick={handlePostNews} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm w-full hover:bg-blue-700 transition-colors">Posting Pengumuman</button>
                     </div>
                     <div className="mt-6 border-t pt-4 space-y-2">
                         <h4 className="font-bold text-slate-700 text-sm mb-2">Riwayat Berita</h4>
                         {news.length === 0 && <p className="text-slate-400 text-xs italic">Belum ada berita diposting.</p>}
                         {news.map(n => (
                             <div key={n.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                                 <span className="font-medium text-slate-700 truncate max-w-[200px]">{n.title}</span>
                                 <button onClick={() => onDeleteNews(n.id)} className="text-red-400 hover:text-red-600 p-1 rounded-md hover:bg-red-50"><Trash2 size={16}/></button>
                             </div>
                         ))}
                     </div>
                 </div>
             </div>
        </div>
    );
};

// AdminSHUManager
export const AdminSHUManager: React.FC<AdminSHUManagerProps> = ({ shuConfig, onUpdateSHUConfig, financialData }) => {
  const [config, setConfig] = useState(shuConfig.allocations);

  const handleChange = (key: keyof typeof config, value: string) => {
    const num = parseFloat(value) || 0;
    setConfig(prev => ({ ...prev, [key]: num / 100 }));
  };

  const totalPercentage = (Object.values(config) as number[]).reduce((a, b) => a + b, 0) * 100;
  
  const handleSave = () => {
    if (Math.abs(totalPercentage - 100) > 0.1) {
      alert(`Total alokasi harus 100%. Saat ini: ${totalPercentage.toFixed(1)}%`);
      return;
    }
    onUpdateSHUConfig({ ...shuConfig, allocations: config });
    alert("Konfigurasi SHU berhasil diperbarui.");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Settings size={20} /> Konfigurasi Pembagian SHU
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
                {Object.entries(config).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                        <div className="flex items-center gap-2">
                            <input 
                                type="number" 
                                value={((val as number) * 100).toFixed(1)} 
                                onChange={(e) => handleChange(key as any, e.target.value)}
                                className="w-20 p-2 border border-slate-300 rounded-lg text-right"
                            />
                            <span className="text-slate-500">%</span>
                        </div>
                    </div>
                ))}
                <div className={`flex justify-between items-center pt-4 border-t ${Math.abs(totalPercentage - 100) > 0.1 ? 'text-red-600' : 'text-emerald-600'}`}>
                    <span className="font-bold">Total Alokasi</span>
                    <span className="font-bold">{totalPercentage.toFixed(1)}%</span>
                </div>
                <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-700 mt-4">Simpan Konfigurasi</button>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                <h4 className="font-bold text-slate-800 mb-4">Simulasi SHU Tahun Ini</h4>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total SHU (Laba Bersih)</span>
                        <span className="font-bold text-emerald-600">{formatIDR(financialData.netIncome)}</span>
                    </div>
                    <div className="h-px bg-slate-200 my-2"></div>
                    {Object.entries(config).map(([key, val]) => (
                         <div key={key} className="flex justify-between text-sm">
                            <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <span className="font-medium">{formatIDR(financialData.netIncome * (val as number))}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// AdminSavingsManager
export const AdminSavingsManager: React.FC<AdminSavingsManagerProps> = ({ transactions, members, onUpdateTransactionStatus, onAddTransaction }) => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ memberId: '', type: 'Simpanan Sukarela', amount: '', method: 'Tunai', date: new Date().toISOString().split('T')[0] });

    const pendingSavings = transactions.filter(t => t.status === 'PENDING' && (t.type === 'DEPOSIT' || t.type === 'PAYMENT' || t.type === 'WITHDRAWAL' || t.type === 'SHU_WITHDRAWAL'));

    const handleApprove = (id: string) => onUpdateTransactionStatus(id, 'APPROVED');
    const handleReject = (id: string) => onUpdateTransactionStatus(id, 'REJECTED');

    const handleManualSubmit = () => {
        if(!form.memberId || !form.amount) return alert("Lengkapi data");
        
        onAddTransaction({
            id: `TRX-MAN-${Date.now()}`,
            memberId: form.memberId,
            date: form.date,
            type: form.type === 'Penarikan' ? 'WITHDRAWAL' : (form.type.includes('Wajib') ? 'PAYMENT' : 'DEPOSIT'),
            amount: parseFloat(form.amount),
            status: 'APPROVED',
            description: `Setoran Manual: ${form.type} (${form.method})`
        });
        setShowModal(false);
        setForm({ memberId: '', type: 'Simpanan Sukarela', amount: '', method: 'Tunai', date: new Date().toISOString().split('T')[0] });
        alert("Transaksi berhasil dicatat");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Manajemen Simpanan</h2>
                <button onClick={() => setShowModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700">
                    <Plus size={18} /> Input Transaksi Manual
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                 {/* Pending Approvals */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                     <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-orange-600">
                         <Calendar size={20}/> Menunggu Persetujuan
                     </h3>
                     <div className="space-y-3">
                         {pendingSavings.length === 0 ? <p className="text-slate-400 text-sm italic">Tidak ada antrian.</p> : 
                            pendingSavings.map(t => (
                                <div key={t.id} className="p-4 border rounded-lg hover:bg-slate-50 flex justify-between items-center">
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{t.description}</p>
                                        <p className="text-xs text-slate-500">{members.find(m => m.id === t.memberId)?.name || t.memberId} • {t.date}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-emerald-600">{formatIDR(t.amount)}</span>
                                        <div className="flex gap-1">
                                            <button onClick={() => handleApprove(t.id)} className="p-1.5 bg-green-100 text-green-600 rounded hover:bg-green-200"><CheckCircle size={18}/></button>
                                            <button onClick={() => handleReject(t.id)} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200"><XCircle size={18}/></button>
                                        </div>
                                    </div>
                                </div>
                            ))
                         }
                     </div>
                 </div>

                 {/* Quick Stats or History */}
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-800 mb-4">Riwayat Terakhir</h3>
                    <div className="space-y-2">
                         {transactions
                            .filter(t => t.status === 'APPROVED' && ['DEPOSIT','PAYMENT','WITHDRAWAL'].includes(t.type))
                            .slice(0, 5)
                            .map(t => (
                                <div key={t.id} className="flex justify-between items-center p-2 border-b border-slate-50 last:border-0 text-sm">
                                    <span className="text-slate-600 truncate max-w-[200px]">{t.description}</span>
                                    <span className={`font-medium ${t.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-emerald-600'}`}>
                                        {t.type === 'WITHDRAWAL' ? '-' : '+'}{formatIDR(t.amount)}
                                    </span>
                                </div>
                            ))
                         }
                    </div>
                 </div>
            </div>

            {/* Manual Input Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex justify-between mb-4">
                            <h3 className="font-bold text-lg">Input Transaksi Manual</h3>
                            <button onClick={() => setShowModal(false)}><X size={20}/></button>
                        </div>
                        <div className="space-y-3">
                            <select className="w-full border p-2 rounded" value={form.memberId} onChange={e => setForm({...form, memberId: e.target.value})}>
                                <option value="">-- Pilih Anggota --</option>
                                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                            </select>
                            <select className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option>Simpanan Sukarela</option>
                                <option>Simpanan Wajib</option>
                                <option>Simpanan Pokok</option>
                                <option>Penarikan</option>
                            </select>
                            <input type="number" placeholder="Nominal" className="w-full border p-2 rounded" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                            <select className="w-full border p-2 rounded" value={form.method} onChange={e => setForm({...form, method: e.target.value})}>
                                <option>Tunai</option><option>Transfer</option>
                            </select>
                            <button onClick={handleManualSubmit} className="w-full bg-emerald-600 text-white py-2 rounded font-bold mt-2">Simpan</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


// AdminFinance
export const AdminFinance: React.FC<AdminFinanceProps> = ({ journal, onAddJournalEntry }) => {
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], type: 'DEBIT', category: '', amount: '', description: '' });

    const handleSubmit = () => {
        if(!form.amount || !form.category) return;
        onAddJournalEntry({
            id: `JRN-MAN-${Date.now()}`,
            date: form.date,
            type: form.type as 'DEBIT' | 'CREDIT',
            category: form.category,
            amount: parseFloat(form.amount),
            description: form.description,
            isCash: true // manual entry assumes cash effect mostly
        });
        setShowModal(false);
        setForm({ date: new Date().toISOString().split('T')[0], type: 'DEBIT', category: '', amount: '', description: '' });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Jurnal Keuangan</h2>
                <button onClick={() => setShowModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700">
                    <Plus size={18} /> Catat Jurnal Manual
                </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 font-medium text-slate-500">
                            <tr>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-right">Debit</th>
                                <th className="px-6 py-4 text-right">Kredit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {journal.length === 0 ? <tr><td colSpan={5} className="px-6 py-4 text-center text-slate-400">Belum ada data jurnal.</td></tr> :
                                journal.map(entry => (
                                    <tr key={entry.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 text-slate-600">{entry.date}</td>
                                        <td className="px-6 py-4 font-medium text-slate-800">{entry.description}</td>
                                        <td className="px-6 py-4 text-slate-500"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{entry.category}</span></td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-700">{entry.type === 'DEBIT' ? formatIDR(entry.amount) : '-'}</td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-700">{entry.type === 'CREDIT' ? formatIDR(entry.amount) : '-'}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <h3 className="font-bold text-lg mb-4">Input Jurnal Manual</h3>
                        <div className="space-y-3">
                            <input type="date" className="w-full border p-2 rounded" value={form.date} onChange={e => setForm({...form, date: e.target.value})} />
                            <select className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option value="DEBIT">Debit (Pemasukan Kas)</option>
                                <option value="CREDIT">Kredit (Pengeluaran Kas)</option>
                            </select>
                            <input type="text" placeholder="Kategori (Misal: Listrik, Gaji)" className="w-full border p-2 rounded" value={form.category} onChange={e => setForm({...form, category: e.target.value})} />
                            <input type="number" placeholder="Nominal" className="w-full border p-2 rounded" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
                            <textarea placeholder="Keterangan" className="w-full border p-2 rounded" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                            <button onClick={handleSubmit} className="w-full bg-blue-600 text-white py-2 rounded font-bold mt-2">Simpan Jurnal</button>
                            <button onClick={() => setShowModal(false)} className="w-full border py-2 rounded font-bold mt-2 text-slate-600">Batal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// AdminReports
export const AdminReports: React.FC<AdminReportsProps> = ({ transactions, members, products, journal, financialData, shuConfig }) => {
    const downloadReport = (reportName: string) => {
        alert(`Sedang mengunduh laporan: ${reportName}.pdf`);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-slate-800">Laporan & Arsip</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
                        <Users size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Laporan Anggota</h3>
                    <p className="text-sm text-slate-500 mb-4">Data lengkap anggota, status keaktifan, dan rekap simpanan per anggota.</p>
                    <button onClick={() => downloadReport('Laporan_Anggota')} className="text-emerald-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <Download size={16}/> Unduh PDF
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Laporan Keuangan (Neraca)</h3>
                    <p className="text-sm text-slate-500 mb-4">Neraca saldo, laba rugi, dan arus kas periode berjalan.</p>
                    <button onClick={() => downloadReport('Laporan_Keuangan')} className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <Download size={16}/> Unduh PDF
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4">
                        <ShoppingCart size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Laporan Penjualan</h3>
                    <p className="text-sm text-slate-500 mb-4">Rekapitulasi omzet toko, barang terlaris, dan stok opname.</p>
                    <button onClick={() => downloadReport('Laporan_Penjualan')} className="text-orange-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <Download size={16}/> Unduh PDF
                    </button>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600 mb-4">
                        <BookOpen size={24} />
                    </div>
                    <h3 className="font-bold text-slate-800 mb-2">Jurnal Transaksi</h3>
                    <p className="text-sm text-slate-500 mb-4">Buku besar dan detail setiap transaksi masuk/keluar.</p>
                    <button onClick={() => downloadReport('Laporan_Jurnal')} className="text-purple-600 font-bold text-sm flex items-center gap-1 hover:underline">
                        <Download size={16}/> Unduh Excel
                    </button>
                </div>
            </div>
        </div>
    );
};