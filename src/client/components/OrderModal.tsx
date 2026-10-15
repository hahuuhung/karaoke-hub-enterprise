import React, { useState } from 'react';
import { MenuItem, Room } from '../../core/types';
import { X, Utensils, Plus, Check } from 'lucide-react';

interface OrderModalProps {
  room: Room;
  menuItems: MenuItem[];
  onClose: () => void;
  onDispatchOrder: (menuItemId: string, quantity: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  room,
  menuItems,
  onClose,
  onDispatchOrder,
}) => {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(menuItems[0] || null);
  const [quantity, setQuantity] = useState<number>(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleOrder = () => {
    if (!selectedItem || quantity <= 0) return;
    onDispatchOrder(selectedItem.id, quantity);
    setSuccessToast(`Đã mang ${quantity} ${selectedItem.unit} ${selectedItem.name} vào ${room.code}!`);
    setTimeout(() => setSuccessToast(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-sky-600" />
            <h3 className="font-extrabold text-slate-900">GỌI MÓN / XUẤT F&B: {room.code}</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {successToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">{successToast}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Chọn sản phẩm</label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItem(item)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedItem?.id === item.id
                      ? 'border-sky-500 bg-sky-50 ring-1 ring-sky-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="font-bold text-xs text-slate-900 truncate">{item.name}</div>
                  <div className="text-[11px] text-slate-500 flex justify-between mt-1">
                    <span>{formatVND(item.price)}</span>
                    <span className="text-slate-400 font-medium">Kho: {item.stockQuantity}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedItem && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">{selectedItem.name}</span>
                <span className="font-extrabold text-sky-700">{formatVND(selectedItem.price * quantity)}</span>
              </div>

              {/* Quick quantity selectors */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Số lượng:</span>
                <div className="flex items-center space-x-1">
                  {[1, 6, 12, 24].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuantity(num)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                        quantity === num ? 'bg-sky-600 text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      +{num}
                    </button>
                  ))}
                </div>

                <div className="ml-auto flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="h-7 w-7 rounded-lg border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={selectedItem.stockQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 h-7 text-center font-bold text-xs border border-slate-300 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="h-7 w-7 rounded-lg border border-slate-300 font-bold flex items-center justify-center hover:bg-slate-100"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={handleOrder}
              disabled={!selectedItem || selectedItem.stockQuantity < quantity}
              className="flex-1 py-2.5 bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-sky-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Xuất Vào Phòng</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
