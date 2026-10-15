import React, { useState } from 'react';
import { OrderItem, Room } from '../../core/types';
import { X, Sparkle, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ReturnAuditModalProps {
  room: Room;
  orderItems: OrderItem[];
  onClose: () => void;
  onSubmitAudit: (auditInputs: Array<{ orderItemId: string; returnedQty: number }>) => void;
}

export const ReturnAuditModal: React.FC<ReturnAuditModalProps> = ({
  room,
  orderItems,
  onClose,
  onSubmitAudit,
}) => {
  // Initialize returned quantities with existing values
  const [returns, setReturns] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    orderItems.forEach((item) => {
      init[item.id] = item.returnedQty || 0;
    });
    return init;
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const handleReturnChange = (itemId: string, maxQty: number, val: number) => {
    const validVal = Math.min(maxQty, Math.max(0, val));
    setReturns((prev) => ({ ...prev, [itemId]: validVal }));
  };

  // Calculate live preview totals
  let totalDispatchedAmount = 0;
  let totalAuditedAmount = 0;

  orderItems.forEach((item) => {
    totalDispatchedAmount += item.dispatchedQty * item.unitPrice;
    const returned = returns[item.id] ?? item.returnedQty;
    const consumed = Math.max(0, item.dispatchedQty - returned);
    totalAuditedAmount += consumed * item.unitPrice;
  });

  const totalRefundAmount = totalDispatchedAmount - totalAuditedAmount;

  const handleSubmit = () => {
    const inputs = Object.entries(returns).map(([orderItemId, returnedQty]) => ({
      orderItemId,
      returnedQty,
    }));
    onSubmitAudit(inputs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center space-x-2">
            <Sparkle className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">KIỂM ĐỒ TRẢ LẠI: {room.code}</h3>
              <p className="text-xs text-slate-500">
                Nhập số lượng đồ thừa chưa khui (bia lon, nước ngọt, khăn) để hoàn kho và giảm trừ tiền
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {orderItems.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs italic">
              Phòng này chưa gọi món F&B nào
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Tên Món</th>
                    <th className="py-2.5 px-3 text-center">Đã Xuất</th>
                    <th className="py-2.5 px-3 text-center">Trả Lại (Chưa Dùng)</th>
                    <th className="py-2.5 px-3 text-center">Thực Dùng</th>
                    <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orderItems.map((item) => {
                    const retQty = returns[item.id] ?? item.returnedQty;
                    const consumed = item.dispatchedQty - retQty;
                    const price = consumed * item.unitPrice;

                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-800">
                          {item.name}
                          <span className="block text-[10px] text-slate-400 font-normal">
                            Đơn giá: {formatVND(item.unitPrice)}/{item.unit}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center font-bold text-slate-700">
                          {item.dispatchedQty} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="inline-flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => handleReturnChange(item.id, item.dispatchedQty, retQty - 1)}
                              className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              max={item.dispatchedQty}
                              value={retQty}
                              onChange={(e) =>
                                handleReturnChange(item.id, item.dispatchedQty, parseInt(e.target.value) || 0)
                              }
                              className="w-12 h-6 text-center font-bold text-xs border border-amber-300 rounded bg-amber-50/50"
                            />
                            <button
                              type="button"
                              onClick={() => handleReturnChange(item.id, item.dispatchedQty, retQty + 1)}
                              className="h-6 w-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold text-sky-700">
                          {consumed} {item.unit}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                          {formatVND(price)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Audit Summary Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Tổng F&B tạm xuất ban đầu:</span>
              <span className="font-semibold text-slate-700">{formatVND(totalDispatchedAmount)}</span>
            </div>
            <div className="flex justify-between text-amber-700 font-bold">
              <span>Hoàn lại tiền đồ trả về:</span>
              <span>- {formatVND(totalRefundAmount)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-sm text-slate-900">
              <span>Tổng F&B thực tế sau khi kiểm đồ:</span>
              <span className="text-emerald-700">{formatVND(totalAuditedAmount)}</span>
            </div>
          </div>

          <div className="pt-2 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-200 text-slate-700 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={orderItems.length === 0}
              className="flex-1 py-2.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-amber-500/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Xác Nhận & Hoàn Kho Tồn</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
