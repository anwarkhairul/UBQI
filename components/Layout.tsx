import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Wallet, 
  ShoppingBag, 
  PieChart, 
  User, 
  Info, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Users,
  FileText,
  TrendingUp, 
  Bell,
  Cloud,
  HardDrive
} from 'lucide-react';
import { UserRole, AppNotification, User as UserType } from '../types';
import { formatIDR } from '../services/mockDb';

interface SidebarProps {
  user: UserType;
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
  isCloudMode: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, role, activeTab, setActiveTab, isOpen, setIsOpen, onLogout, isCloudMode }) => {
  const userMenu = [
    { id: 'dashboard', label: 'Beranda', icon: LayoutDashboard },
    { id: 'simpanan', label: 'Simpanan', icon: Wallet },
    { id: 'unit_usaha', label: 'UB. Store', icon: ShoppingBag },
    { id: 'shu', label: 'SHU Saya', icon: PieChart },
    { id: 'profil', label: 'Profil & Akun', icon: User },
    { id: 'informasi', label: 'Informasi Koperasi', icon: Info },
  ];

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard Ops', icon: LayoutDashboard },
    { id: 'anggota', label: 'Manajemen Anggota', icon: Users },
    { id: 'simpanan_adm', label: 'Manajemen Simpanan', icon: Wallet },
    { id: 'unit_usaha_adm', label: 'UB. Store', icon: ShoppingBag },
    { id: 'shu_adm', label: 'Manajemen SHU', icon: PieChart },
    { id: 'keuangan', label: 'Keuangan & Akun', icon: TrendingUp },
    { id: 'laporan', label: 'Pelaporan', icon: FileText },
    { id: 'pengaturan', label: 'Pengaturan', icon: Settings },
  ];

  const menuItems = role === UserRole.USER ? userMenu : adminMenu;

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 bg-slate-800">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="font-bold text-white text-lg">UB</span>
              </div>
              <span className="font-bold text-lg tracking-tight">Qurrotul ‘Ibaad</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* User Info (Mini) */}
          <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50">
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider">
              {role === UserRole.USER ? 'Anggota' : 'Administrator'}
            </p>
            <p className="text-sm font-medium mt-1 truncate">
               {user.name}
            </p>
          </div>

          {/* Connection Status Indicator */}
          <div className="px-6 pt-4 pb-2">
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors ${
              isCloudMode 
                ? 'bg-emerald-900/30 border-emerald-800 text-emerald-400' 
                : 'bg-orange-900/30 border-orange-800 text-orange-400'
            }`}>
               {isCloudMode ? <Cloud size={14} /> : <HardDrive size={14} />}
               <div className="flex flex-col">
                 <span>{isCloudMode ? 'Database Online' : 'Mode Offline'}</span>
                 <span className="text-[10px] opacity-70">{isCloudMode ? 'Terhubung ke Cloud' : 'Penyimpanan Lokal'}</span>
               </div>
               {isCloudMode && <span className="ml-auto w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2">
            <ul className="space-y-1 px-3">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 ${
                      activeTab === item.id 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' 
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <item.icon size={20} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-slate-700">
            <button 
              onClick={onLogout}
              className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 py-2 rounded-lg transition-all duration-200"
            >
              <LogOut size={18} />
              <span className="text-sm font-medium">Keluar</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  user: UserType;
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  notifications: AppNotification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  walletBalance?: number;
  isCloudMode?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user,
  role, 
  activeTab, 
  setActiveTab, 
  onLogout,
  notifications,
  onMarkAsRead,
  onMarkAllAsRead,
  walletBalance = 0,
  isCloudMode = false
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Handle click outside to close notification dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar 
        user={user}
        role={role} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={onLogout}
        isCloudMode={isCloudMode}
      />
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header for Mobile */}
        <header className="bg-white shadow-sm lg:hidden flex items-center justify-between px-4 h-16 z-10">
          <button onClick={() => setIsSidebarOpen(true)} className="text-slate-500 hover:text-emerald-600">
            <Menu size={24} />
          </button>
          <span className="font-semibold text-slate-800">UB Qurrotul ‘Ibaad</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
             {/* Header Section of Page */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-slate-800 capitalize">
                {activeTab === 'unit_usaha' || activeTab === 'unit_usaha_adm' ? 'UB. Store' : activeTab.replace('_', ' ')}
              </h1>
              <div className="flex items-center space-x-4">
                
                {/* Notification Dropdown */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setIsNotifOpen(!isNotifOpen)}
                    className="relative p-2 text-slate-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-slate-100 outline-none"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
                    )}
                  </button>

                  {isNotifOpen && (
                    <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-fade-in-down overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">Notifikasi</h3>
                        {unreadCount > 0 && (
                          <button 
                            onClick={onMarkAllAsRead}
                            className="text-xs text-emerald-600 font-bold hover:underline"
                          >
                            Tandai semua dibaca
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-slate-400 text-sm">
                            Tidak ada notifikasi.
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map((notif) => (
                              <div 
                                key={notif.id} 
                                onClick={() => onMarkAsRead(notif.id)}
                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${notif.isRead ? 'opacity-60' : 'bg-blue-50/30'}`}
                              >
                                <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${notif.isRead ? 'bg-slate-300' : 'bg-emerald-500'}`} />
                                <div className="flex-1">
                                  <div className="flex justify-between items-start mb-1">
                                    <h4 className={`text-sm ${notif.isRead ? 'font-medium text-slate-700' : 'font-bold text-slate-900'}`}>{notif.title}</h4>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">{notif.date}</span>
                                  </div>
                                  <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{notif.message}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="p-2 border-t border-slate-100 text-center">
                        <button className="text-xs text-slate-500 hover:text-slate-800 font-medium py-1 w-full block">
                          Lihat semua notifikasi
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Saldo Dompet (Hanya untuk User) */}
                {role === UserRole.USER && (
                  <div className="hidden md:flex flex-col items-end">
                    <span className="text-xs text-slate-500">Saldo Dompet</span>
                    <span className="text-sm font-bold text-emerald-600">{formatIDR(walletBalance)}</span>
                  </div>
                )}
              </div>
            </div>

            {children}
          </div>
        </main>
      </div>
    </div>
  );
};