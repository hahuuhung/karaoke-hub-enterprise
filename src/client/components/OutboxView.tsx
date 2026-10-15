import React from 'react';
import { OutboxSyncEvent } from '../../core/types';
import { Cloud, ArrowUpRight, CheckCircle2, Clock, RefreshCw } from 'lucide-react';

interface OutboxViewProps {
  events: OutboxSyncEvent[];
  onFlush: () => void;
  isFlushing: boolean;
}

export const OutboxView: React.FC<OutboxViewProps> = ({ events, onFlush, isFlushing }) => {
  const pendingCount = events.filter((e) => e.status === 'PENDING').length;
  const syncedCount = events.filter((e) => e.status === 'SYNCED').length;

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-sky-600" />
            <span>HÀNG ĐỢI ĐỒNG BỘ ĐÁM MÂY (OUTBOX SYNC WORKER)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cơ chế Offline-First: Dữ liệu được lưu tại chỗ (Local SQLite) và đẩy lên Cloud khi có Internet
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Đã đồng bộ: <strong className="text-emerald-700">{syncedCount}</strong> | Đang chờ:{' '}
            <strong className="text-amber-700">{pendingCount}</strong>
          </div>

          <button
            onClick={onFlush}
            disabled={isFlushing || pendingCount === 0}
            className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${isFlushing ? 'animate-spin' : ''}`} />
            <span>Đẩy Đồng Bộ Ngay ({pendingCount})</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Mã Sự Kiện</th>
              <th className="py-3.5 px-4">Loại Sự Kiện</th>
              <th className="py-3.5 px-4">Thời Gian Tạo</th>
              <th className="py-3.5 px-4">Trạng Thái</th>
              <th className="py-3.5 px-4 text-right">Chi Tiết Payload</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-400 text-xs italic">
                  Chưa có sự kiện nào trong hàng đợi Outbox
                </td>
              </tr>
            ) : (
              events.map((evt) => (
                <tr key={evt.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-slate-500">{evt.id}</td>
                  <td className="py-3 px-4 font-bold text-slate-800 text-xs">
                    <span className="bg-slate-100 text-sky-800 font-mono px-2 py-0.5 rounded">
                      {evt.eventType}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">
                    {new Date(evt.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td className="py-3 px-4 text-xs">
                    {evt.status === 'SYNCED' ? (
                      <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã lên Cloud</span>
                      </span>
                    ) : (
                      <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full inline-flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-600 animate-spin" />
                        <span>Chờ mạng</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right text-xs text-slate-400 font-mono truncate max-w-xs">
                    {JSON.stringify(evt.payload).slice(0, 45)}...
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
