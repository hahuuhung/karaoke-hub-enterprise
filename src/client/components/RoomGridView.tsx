import React, { useState } from 'react';
import { Room, RoomStatus, RoomType } from '../../core/types';
import {
  Mic2,
  Users,
  Utensils,
  Play,
  Pause,
  ArrowRightLeft,
  Receipt,
  Sparkles,
  PlusCircle,
  Clock,
  Sparkle,
} from 'lucide-react';

interface RoomWithDetails extends Room {
  activeSession?: any;
  billing?: any;
  activeHostessesCount?: number;
  activeHostesses?: Array<{ id: string; name: string; durationMinutes: number; isOvertime: boolean }>;
  totalFnb?: number;
}

interface RoomGridViewProps {
  rooms: RoomWithDetails[];
  onOpenRoom: (room: RoomWithDetails) => void;
  onOpenOrder: (room: RoomWithDetails) => void;
  onOpenReturnAudit: (room: RoomWithDetails) => void;
  onOpenCheckout: (room: RoomWithDetails) => void;
  onTogglePause: (roomId: string) => void;
  onOpenTransfer: (room: RoomWithDetails) => void;
  onMarkClean: (roomId: string) => void;
}

export const RoomGridView: React.FC<RoomGridViewProps> = ({
  rooms,
  onOpenRoom,
  onOpenOrder,
  onOpenReturnAudit,
  onOpenCheckout,
  onTogglePause,
  onOpenTransfer,
  onMarkClean,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredRooms = rooms.filter((r) => {
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  const countOccupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
  const countAvailable = rooms.filter((r) => r.status === 'AVAILABLE').length;
  const countCleaning = rooms.filter((r) => r.status === 'CLEANING').length;

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getTypeBadge = (type: RoomType) => {
    switch (type) {
      case 'PARTY':
        return <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-purple-200">PARTY / SÂN KHẤU</span>;
      case 'SUPER_VIP':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-200">SUPER VIP</span>;
      case 'VIP':
        return <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-200">VIP</span>;
      default:
        return <span className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2 py-0.5 rounded-full border border-slate-200">STANDARD</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Bar & Summary Statistics */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất Cả ({rooms.length})
          </button>
          <button
            onClick={() => setFilterStatus('OCCUPIED')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'OCCUPIED'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200'
            }`}
          >
            Đang Hát ({countOccupied})
          </button>
          <button
            onClick={() => setFilterStatus('AVAILABLE')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'AVAILABLE'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Phòng Trống ({countAvailable})
          </button>
          <button
            onClick={() => setFilterStatus('CLEANING')}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              filterStatus === 'CLEANING'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Chờ Dọn Dẹp ({countCleaning})
          </button>
        </div>

        <div className="text-sm text-slate-500 font-medium">
          Tỷ lệ lấp đầy: <strong className="text-slate-900">{Math.round((countOccupied / (rooms.length || 1)) * 100)}%</strong>
        </div>
      </div>

      {/* Grid of Rooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const isOccupied = room.status === 'OCCUPIED';
          const isCleaning = room.status === 'CLEANING';
          const isAvailable = room.status === 'AVAILABLE';

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                isOccupied
                  ? 'border-sky-300 ring-1 ring-sky-200'
                  : isCleaning
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg text-slate-900">{room.code}</span>
                  <span className="text-xs text-slate-500 font-medium truncate max-w-[140px]">{room.name}</span>
                </div>
                <div>{getTypeBadge(room.type)}</div>
              </div>

              {/* Card Content */}
              <div className="p-4 flex-1">
                {/* CASE 1: ROOM AVAILABLE */}
                {isAvailable && (
                  <div className="space-y-4 my-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-500">Giá phòng cơ bản:</span>
                      <span className="font-bold text-slate-800">{formatVND(room.hourlyRate)}/h</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Phòng sạch sẽ, âm thanh sẵn sàng đón khách</span>
                    </div>
                    <button
                      onClick={() => onOpenRoom(room)}
                      className="w-full mt-2 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-sm shadow-sky-500/20 flex items-center justify-center space-x-2 transition-all"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Nhận Phòng Hát</span>
                    </button>
                  </div>
                )}

                {/* CASE 2: ROOM OCCUPIED */}
                {isOccupied && (
                  <div className="space-y-3">
                    {/* Time & Session Header */}
                    <div className="flex items-center justify-between bg-sky-50 p-2.5 rounded-xl border border-sky-100">
                      <div className="flex items-center space-x-2 text-sky-900 text-sm font-semibold">
                        <Clock className="w-4 h-4 text-sky-600" />
                        <span>Hát: {room.billing?.rawMinutes || 0} phút</span>
                        {room.activeSession?.isPaused && (
                          <span className="bg-amber-200 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">TẠM DỪNG</span>
                        )}
                      </div>
                      <span className="font-extrabold text-sky-700 text-sm">
                        {formatVND(room.billing?.totalRoomCharge || 0)}
                      </span>
                    </div>

                    {/* Customer Info */}
                    <div className="text-xs text-slate-600 flex justify-between">
                      <span>Khách: <strong className="text-slate-800">{room.activeSession?.customerName || 'Vãng lai'}</strong></span>
                      <span>Vào lúc: {new Date(room.activeSession?.checkInTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Hostesses in room */}
                    <div className="text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>Tiếp viên ({room.activeHostessesCount || 0}):</span>
                        </span>
                      </div>
                      {room.activeHostesses && room.activeHostesses.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {room.activeHostesses.map((h) => (
                            <span
                              key={h.id}
                              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold flex items-center space-x-1 ${
                                h.isOvertime
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                                  : 'bg-slate-100 text-slate-700 border border-slate-200'
                              }`}
                            >
                              <span>{h.name} ({h.durationMinutes}m)</span>
                              {h.isOvertime && <span className="font-bold text-rose-600">!</span>}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic text-[11px]">Chưa điều tiếp viên vào</p>
                      )}
                    </div>

                    {/* F&B Items Summary */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-600">
                      <span className="flex items-center space-x-1">
                        <Utensils className="w-3.5 h-3.5" />
                        <span>F&B Đã Gọi:</span>
                      </span>
                      <strong className="text-slate-800">{formatVND(room.totalFnb || 0)}</strong>
                    </div>

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => onOpenOrder(room)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center space-x-1"
                      >
                        <Utensils className="w-3.5 h-3.5 text-slate-600" />
                        <span>+ Gọi Món</span>
                      </button>
                      <button
                        onClick={() => onOpenReturnAudit(room)}
                        className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold py-2 rounded-xl transition-colors flex items-center justify-center space-x-1"
                      >
                        <Sparkle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Kiểm Đồ Trả</span>
                      </button>
                    </div>

                    <div className="flex space-x-2 pt-1">
                      <button
                        onClick={() => onTogglePause(room.id)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                        title={room.activeSession?.isPaused ? 'Tiếp tục tính giờ' : 'Tạm dừng tính giờ'}
                      >
                        {room.activeSession?.isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                      </button>
                      <button
                        onClick={() => onOpenTransfer(room)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors"
                        title="Chuyển sang phòng khác"
                      >
                        <ArrowRightLeft className="w-4 h-4 text-sky-600" />
                      </button>
                      <button
                        onClick={() => onOpenCheckout(room)}
                        className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs py-2 rounded-xl shadow-sm flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Receipt className="w-4 h-4" />
                        <span>Thanh Toán VietQR</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* CASE 3: ROOM CLEANING */}
                {isCleaning && (
                  <div className="space-y-4 my-2 text-center py-2">
                    <div className="h-10 w-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-900 text-sm">Phòng Đang Chờ Dọn Dẹp</h4>
                      <p className="text-xs text-amber-700 mt-0.5">Nhân viên đang khử khuẩn & xếp lại phòng</p>
                    </div>
                    <button
                      onClick={() => onMarkClean(room.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Xác Nhận Đã Dọn Xong</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
