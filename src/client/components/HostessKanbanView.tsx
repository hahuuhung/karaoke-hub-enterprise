import React, { useState } from 'react';
import { Hostess, Room } from '../../core/types';
import {
  Users,
  Clock,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Coffee,
  CheckCircle2,
  Sparkles,
  Phone,
  Flame,
} from 'lucide-react';

interface HostessWithLive extends Hostess {
  liveStatus: {
    servingDurationMinutes: number;
    isOvertime: boolean;
    overtimeExceededMinutes: number;
    currentEstimatedFee: number;
  };
  currentRoomName: string | null;
}

interface HostessKanbanViewProps {
  hostesses: HostessWithLive[];
  availableQueue: Hostess[];
  occupiedRooms: Room[];
  onDispatchHostess: (hostessId: string, roomId: string) => void;
  onCheckoutHostess: (hostessId: string) => void;
  onToggleStatus: (hostessId: string, newStatus: 'AVAILABLE' | 'OFF_DUTY') => void;
}

export const HostessKanbanView: React.FC<HostessKanbanViewProps> = ({
  hostesses,
  availableQueue,
  occupiedRooms,
  onDispatchHostess,
  onCheckoutHostess,
  onToggleStatus,
}) => {
  const [selectedRoomForDispatch, setSelectedRoomForDispatch] = useState<Record<string, string>>({});

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const inRoomHostesses = hostesses.filter((h) => h.status === 'IN_ROOM');
  const offDutyHostesses = hostesses.filter((h) => h.status === 'OFF_DUTY');

  return (
    <div className="space-y-6">
      {/* Header Info Banner */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Users className="w-5 h-5 text-sky-600" />
            <span>BẢNG ĐIỀU PHỐI TIẾP VIÊN (DISPATCH KANBAN)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thuật toán xoay tua công bằng: Ưu tiên người ít ca hôm nay & chờ lâu nhất
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-xl">
            Sẵn sàng: <strong>{availableQueue.length}</strong>
          </span>
          <span className="bg-sky-50 text-sky-700 border border-sky-200 font-semibold px-3 py-1.5 rounded-xl">
            Đang phục vụ: <strong>{inRoomHostesses.length}</strong>
          </span>
          <span className="bg-slate-100 text-slate-600 font-semibold px-3 py-1.5 rounded-xl">
            Nghỉ tạm: <strong>{offDutyHostesses.length}</strong>
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ============================================================== */}
        {/* COLUMN 1: AVAILABLE QUEUE (XOAY TUA)                          */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-emerald-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h3 className="font-extrabold text-slate-900 text-sm">HÀNG ĐỢI XOAY TUA</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {availableQueue.length} tiếp viên
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
            {availableQueue.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Hiện không có tiếp viên nào trong hàng đợi rảnh
              </div>
            ) : (
              availableQueue.map((h, idx) => {
                const waitMinutes = Math.floor(
                  Math.max(0, Date.now() - new Date(h.lastAvailableAt).getTime()) / (1000 * 60)
                );
                const targetRoomId = selectedRoomForDispatch[h.id] || (occupiedRooms[0]?.id || '');

                return (
                  <div
                    key={h.id}
                    className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-sm transition-all space-y-2.5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <span className="h-6 w-6 rounded-full bg-slate-200 text-slate-700 text-xs font-extrabold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {h.code} • {h.teamName}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="bg-sky-50 text-sky-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200">
                          {h.turnsToday} lượt ca
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Chờ {waitMinutes}m</div>
                      </div>
                    </div>

                    {/* Dispatch selector & Action */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <select
                        value={targetRoomId}
                        onChange={(e) =>
                          setSelectedRoomForDispatch({ ...selectedRoomForDispatch, [h.id]: e.target.value })
                        }
                        disabled={occupiedRooms.length === 0}
                        className="flex-1 bg-white border border-slate-200 rounded-lg text-xs py-1.5 px-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:opacity-50"
                      >
                        {occupiedRooms.length === 0 ? (
                          <option value="">Không có phòng hát</option>
                        ) : (
                          occupiedRooms.map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.code} ({r.name})
                            </option>
                          ))
                        )}
                      </select>

                      <button
                        onClick={() => targetRoomId && onDispatchHostess(h.id, targetRoomId)}
                        disabled={!targetRoomId || occupiedRooms.length === 0}
                        className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors"
                      >
                        <span>Điều</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onToggleStatus(h.id, 'OFF_DUTY')}
                        title="Nghỉ tạm / Ăn tối"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
                      >
                        <Coffee className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 2: IN-ROOM SERVING (ĐANG PHỤC VỤ)                      */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-sky-50/50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
              <h3 className="font-extrabold text-slate-900 text-sm">ĐANG PHỤC VỤ PHÒNG</h3>
            </div>
            <span className="bg-sky-100 text-sky-800 text-xs font-bold px-2 py-0.5 rounded-full">
              {inRoomHostesses.length} tiếp viên
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
            {inRoomHostesses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Chưa có tiếp viên nào đang phục vụ trong phòng
              </div>
            ) : (
              inRoomHostesses.map((h) => {
                const live = h.liveStatus;
                return (
                  <div
                    key={h.id}
                    className={`p-3.5 rounded-xl border transition-all space-y-2.5 ${
                      live.isOvertime
                        ? 'bg-rose-50/50 border-rose-300 ring-1 ring-rose-200'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-slate-900">{h.name}</h4>
                          {live.isOvertime && (
                            <span className="bg-rose-600 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded flex items-center space-x-1 animate-bounce">
                              <AlertTriangle className="w-3 h-3" />
                              <span>QUÁ GIỜ ({live.overtimeExceededMinutes}m)</span>
                            </span>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md mt-1 inline-block">
                          {h.currentRoomName || 'Phòng'}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-slate-800 flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <span>{live.servingDurationMinutes} phút</span>
                        </div>
                        <div className="text-[11px] font-bold text-emerald-700 mt-0.5">
                          ~ {formatVND(live.currentEstimatedFee)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Đơn giá: {formatVND(h.hourlyRate)}/h</span>

                      <button
                        onClick={() => onCheckoutHostess(h.id)}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Trả Về / Đổi Đào</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================== */}
        {/* COLUMN 3: OFF-DUTY / BREAK (NGHỈ TẠM)                         */}
        {/* ============================================================== */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <h3 className="font-extrabold text-slate-900 text-sm">NGHỈ TẠM / ĂN TỐI</h3>
            </div>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-2 py-0.5 rounded-full">
              {offDutyHostesses.length}
            </span>
          </div>

          <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-[720px]">
            {offDutyHostesses.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs italic">
                Tất cả tiếp viên đều đang sẵn sàng hoặc trong phòng
              </div>
            ) : (
              offDutyHostesses.map((h) => (
                <div
                  key={h.id}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-slate-700">{h.name}</h4>
                    <span className="text-[11px] text-slate-400">
                      {h.code} • {h.teamName}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleStatus(h.id, 'AVAILABLE')}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center space-x-1 transition-colors shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Vào Hàng Đợi</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
