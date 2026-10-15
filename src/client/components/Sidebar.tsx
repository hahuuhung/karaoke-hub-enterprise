import React from 'react';
import {
  Mic2,
  Users,
  PackageCheck,
  ShieldAlert,
  History,
  BarChart3,
  Settings,
  Cloud,
  Moon,
  Sun,
  Sparkles,
  Wifi,
  LogOut,
} from 'lucide-react';

export type NavTab =
  | 'rooms'
  | 'hostesses'
  | 'inventory'
  | 'staff'
  | 'audit'
  | 'reports'
  | 'settings'
  | 'sync';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingSyncCount: number;
  onSeedData: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  pendingSyncCount,
  onSeedData,
  isDarkMode,
  onToggleDarkMode,
}) => {
  const navItems = [
    { id: 'rooms' as NavTab, label: 'Sơ đồ phòng', icon: Mic2 },
    { id: 'hostesses' as NavTab, label: 'Danh sách tiếp viên', icon: Users },
    { id: 'inventory' as NavTab, label: 'Hàng hóa & Thực đơn', icon: PackageCheck },
    { id: 'staff' as NavTab, label: 'Tài khoản & Phân quyền', icon: ShieldAlert },
    { id: 'audit' as NavTab, label: 'Lịch sử hoạt động', icon: History },
    { id: 'reports' as NavTab, label: 'Thống kê doanh thu', icon: BarChart3 },
    { id: 'settings' as NavTab, label: 'Cấu hình quán', icon: Settings },
    { id: 'sync' as NavTab, label: 'Đồng bộ đám mây', icon: Cloud, badge: pendingSyncCount },
  ];

  return (
    <aside
      className={`w-64 flex-shrink-0 flex flex-col justify-between border-r transition-colors duration-200 select-none ${
        isDarkMode
          ? 'bg-[#0E1322] border-[#1E2640] text-[#E8ECF6]'
          : 'bg-white border-slate-200 text-slate-800'
      }`}
    >
      {/* Top Brand & Staff Header */}
      <div>
        {/* Brand Header */}
        <div
          className={`p-5 border-b flex items-center space-x-3 ${
            isDarkMode ? 'border-[#1E2640]' : 'border-slate-100'
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-[#5847D9] flex items-center justify-center text-white shadow-md shadow-[#5847D9]/30 flex-shrink-0">
            <Mic2 className="w-5 h-5" />
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight leading-tight">
              Karaoke Luxury
            </div>
            <div
              className={`text-[11px] font-medium flex items-center space-x-1.5 mt-0.5 ${
                isDarkMode ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Đồng bộ thời gian thực</span>
            </div>
          </div>
        </div>

        {/* Current Staff Badge */}
        <div className="p-3 m-3 rounded-xl border flex items-center space-x-3 transition-all bg-slate-50/70 border-slate-200/80">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
            PH
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-xs truncate text-slate-900">Phùng Học</div>
            <div className="text-[10px] text-sky-700 font-medium">Quản lý · đang trực</div>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
        </div>

        {/* Navigation Items */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#5847D9] text-white shadow-sm shadow-[#5847D9]/30 font-bold'
                    : isDarkMode
                    ? 'text-slate-300 hover:bg-[#1E2640] hover:text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-2 text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-white text-[#5847D9]'
                        : 'bg-amber-500 text-white animate-pulse'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions & Controls */}
      <div
        className={`p-3 m-3 rounded-2xl border space-y-2 ${
          isDarkMode ? 'bg-[#0A0E1A] border-[#1E2640]' : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Seed Data Demo Button */}
        <button
          onClick={onSeedData}
          className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Dữ Liệu Mẫu Thực Tế</span>
        </button>

        {/* Toggle Theme */}
        <button
          onClick={onToggleDarkMode}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
            isDarkMode
              ? 'bg-[#1E2640] text-slate-300 hover:bg-[#252E4D]'
              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {isDarkMode ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-500" />
            )}
            <span>{isDarkMode ? 'Giao diện sáng' : 'Giao diện tối'}</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {isDarkMode ? 'Light' : 'Dark'}
          </span>
        </button>

        {/* Connection status */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 px-1">
          <div className="flex items-center space-x-1 text-emerald-600 font-semibold">
            <Wifi className="w-3 h-3" />
            <span>LAN 0ms</span>
          </div>
          <span>v1.2 Enterprise</span>
        </div>
      </div>
    </aside>
  );
};
