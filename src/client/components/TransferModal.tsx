import React, { useState } from 'react';
import { Room } from '../../core/types';
import { X, ArrowRightLeft } from 'lucide-react';

interface TransferModalProps {
  currentRoom: Room;
  availableRooms: Room[];
  onClose: () => void;
  onConfirmTransfer: (targetRoomId: string) => void;
}

export const TransferModal: React.FC<TransferModalProps> = ({
  currentRoom,
  availableRooms,
  onClose,
  onConfirmTransfer,
}) => {
  const [targetRoomId, setTargetRoomId] = useState(availableRooms[0]?.id || '');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRoomId) return;
    onConfirmTransfer(targetRoomId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <ArrowRightLeft className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900">CHUYỂN PHÒNG HÁT</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="text-slate-500">Phòng hiện tại:</div>
            <div className="font-extrabold text-sm text-slate-900">
              {currentRoom.code} - {currentRoom.name}
            </div>
            <p className="text-[11px] text-sky-700 mt-1">
              * Tiền giờ phòng cũ sẽ được snapshot lưu lại và tự động cộng dồn với thời gian ở phòng mới.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Chọn phòng mới chuyển sang
            </label>
            {availableRooms.length === 0 ? (
              <p className="text-xs text-rose-600 italic">Không có phòng trống nào khả dụng để chuyển!</p>
            ) : (
              <select
                value={targetRoomId}
                onChange={(e) => setTargetRoomId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {availableRooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.code} ({r.name} - {formatVND(r.hourlyRate)}/h)
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={availableRooms.length === 0 || !targetRoomId}
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all"
            >
              Xác Nhận Chuyển
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
