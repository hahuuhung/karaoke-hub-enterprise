import React, { useState, useEffect } from 'react';
import { History, Download, RefreshCcw, Filter, Search, ShieldCheck } from 'lucide-react';
import { AuditLog, AuditActionType } from '../../core/types';

export const AuditLogView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterWho, setFilterWho] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchLogs = () => {
    let url = '/api/audit-logs?';
    if (filterType !== 'ALL') url += `type=${filterType}&`;
    if (filterWho !== 'ALL') url += `who=${encodeURIComponent(filterWho)}&`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error('Failed to load audit logs', err));
  };

  useEffect(() => {
    fetchLogs();
  }, [filterType, filterWho]);

  const filteredLogs = logs.filter((log) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.action.toLowerCase().includes(term) ||
      log.detail.toLowerCase().includes(term) ||
      log.who.toLowerCase().includes(term)
    );
  });

  const getActionBadge = (type: AuditActionType) => {
    switch (type) {
      case 'PAYMENT':
        return <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded text-[11px] font-bold">Thanh Toán</span>;
      case 'ROOM':
        return <span className="bg-sky-100 text-sky-800 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-bold">Phòng Hát</span>;
      case 'FNB':
        return <span className="bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[11px] font-bold">Hàng Hóa F&B</span>;
      case 'HOSTESS':
        return <span className="bg-pink-100 text-pink-800 border border-pink-200 px-2 py-0.5 rounded text-[11px] font-bold">Tiếp Viên</span>;
      case 'AUTH':
        return <span className="bg-purple-100 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-[11px] font-bold">Tài Khoản</span>;
      case 'CONFIG':
        return <span className="bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">Cấu Hình</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">Hệ Thống</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <History className="w-5 h-5 text-[#5847D9]" />
            <span>LỊCH SỬ HOẠT ĐỘNG & NHẬT KÝ THAO TÁC (AUDIT LOGS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Mọi thao tác mở phòng, xuất hàng hóa, điều tiếp viên và thanh toán được ghi vết thời gian thực
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => alert('Xuất danh sách nhật ký kiểm toán ra tệp Excel (.xlsx)')}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Xuất Excel</span>
          </button>
          <button
            onClick={fetchLogs}
            className="p-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Tải lại nhật ký"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo hành động, nhân sự, chi tiết..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
          />
        </div>

        {/* Action Type filter */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-400 font-medium">Loại:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
          >
            <option value="ALL">Tất cả thao tác</option>
            <option value="PAYMENT">Thanh toán hóa đơn</option>
            <option value="ROOM">Mở / Chuyển phòng</option>
            <option value="FNB">Gọi hàng hóa F&B</option>
            <option value="HOSTESS">Điều phối tiếp viên</option>
            <option value="AUTH">Đăng nhập & tài khoản</option>
            <option value="CONFIG">Cấu hình & đồng bộ</option>
          </select>
        </div>

        {/* Who filter */}
        <div className="flex items-center space-x-1 text-xs">
          <span className="text-slate-400 font-medium">Người thao tác:</span>
          <select
            value={filterWho}
            onChange={(e) => setFilterWho(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl py-1.5 px-3 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
          >
            <option value="ALL">Tất cả nhân sự</option>
            <option value="Phùng Học">Phùng Học (Quản lý)</option>
            <option value="Trần Thanh Thảo">Trần Thanh Thảo (Thu ngân)</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-40">Thời Gian</th>
              <th className="py-3 px-4 w-44">Người Thao Tác</th>
              <th className="py-3 px-4 w-44">Hành Động</th>
              <th className="py-3 px-4">Chi Tiết Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-10 text-center text-slate-400 italic">
                  Không tìm thấy nhật ký thao tác nào
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-500 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('vi-VN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{log.who}</div>
                    <span className="text-[10px] text-slate-400">{log.role}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      {getActionBadge(log.type)}
                      <div className="font-bold text-slate-800 text-[11px]">{log.action}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-medium leading-relaxed">
                    {log.detail}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
