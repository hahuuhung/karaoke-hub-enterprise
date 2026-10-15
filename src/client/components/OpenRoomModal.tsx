import React, { useState } from 'react';
import { Room } from '../../core/types';
import { X, PlayCircle } from 'lucide-react';

interface OpenRoomModalProps {
  room: Room;
  onClose: () => void;
  onConfirm: (customerName: string, customerPhone: string) => void;
}

export const OpenRoomModal: React.FC<OpenRoomModalProps> = ({ room, onClose, onConfirm }) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(customerName || 'Khách vãng lai', customerPhone);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900">MỞ PHÒNG HÁT: {room.code}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs text-sky-900 space-y-1">
            <div className="flex justify-between">
              <span>Loại phòng: <strong>{room.type}</strong></span>
              <span>Đơn giá: <strong>{new Intl.NumberFormat('vi-VN').format(room.hourlyRate)} đ/h</strong></span>
            </div>
            <p className="text-[11px] text-sky-700">Ân hạn 10 phút đầu (0đ nếu hủy). Block đầu 60 phút, block sau 15 phút.</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tên khách hàng</label>
            <input
              type="text"
              placeholder="VD: Anh Minh hoặc để trống nếu khách vãng lai"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số điện thoại (tích điểm)</label>
            <input
              type="tel"
              placeholder="0912.xxx.xxx"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-3 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all"
            >
              Bắt Đầu Tính Giờ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
