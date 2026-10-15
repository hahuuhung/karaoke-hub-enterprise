import React, { useState, useEffect } from 'react';
import { Mic2, Users, PackageCheck, Cloud, Wifi, Clock, RefreshCw } from 'lucide-react';

interface HeaderProps {
  currentTab: 'rooms' | 'hostesses' | 'inventory' | 'sync';
  onSelectTab: (tab: 'rooms' | 'hostesses' | 'inventory' | 'sync') => void;
  pendingSyncCount: number;
  connectedClients: number;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  pendingSyncCount,
  connectedClients,
  onRefresh,
}) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Mic2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                  KARAOKE HUB
                </span>
                <span className="bg-sky-100 text-sky-700 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">Offline-First & Realtime Cloud Sync</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => onSelectTab('rooms')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'rooms'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Mic2 className="w-4 h-4" />
              <span>Sơ Đồ Phòng</span>
            </button>

            <button
              onClick={() => onSelectTab('hostesses')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'hostesses'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Tiếp Viên (Kanban)</span>
            </button>

            <button
              onClick={() => onSelectTab('inventory')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                currentTab === 'inventory'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <PackageCheck className="w-4 h-4" />
              <span>Thực Đơn & Kho</span>
            </button>

            <button
              onClick={() => onSelectTab('sync')}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${
                currentTab === 'sync'
                  ? 'bg-white text-sky-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>Đồng Bộ Cloud</span>
              {pendingSyncCount > 0 && (
                <span className="ml-1 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                  {pendingSyncCount}
                </span>
              )}
            </button>
          </nav>

          {/* Status & Digital Clock */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-3 py-1.5 rounded-lg font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Wifi className="w-3.5 h-3.5" />
              <span>LAN 0ms</span>
            </div>

            <button
              onClick={onRefresh}
              title="Làm mới dữ liệu"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 bg-slate-900 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <Clock className="w-4 h-4 text-sky-400" />
              <span className="font-mono font-bold text-sm tracking-wider">{time}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
