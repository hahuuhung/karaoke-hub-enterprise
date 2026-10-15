import React, { useState } from 'react';
import { Room, OrderItem, HostessSessionLog, Invoice, PaymentMethod } from '../../core/types';
import { X, QrCode, Printer, CheckCircle, CreditCard, Banknote, ShieldCheck } from 'lucide-react';

interface CheckoutModalProps {
  room: Room;
  previewData: {
    invoice: Invoice;
    billing: any;
    orders: OrderItem[];
    hostessLogs: HostessSessionLog[];
    vietQRUrl: string;
  };
  onClose: () => void;
  onConfirmCheckout: (invoice: Invoice) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  room,
  previewData,
  onClose,
  onConfirmCheckout,
}) => {
  const { billing, orders, hostessLogs, vietQRUrl } = previewData;
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VIETQR');
  const [discount, setDiscount] = useState<number>(previewData.invoice.discountAmount || 0);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Recalculate totals if discount changes
  const roomCharge = previewData.invoice.roomCharge;
  const fnbCharge = previewData.invoice.fnbCharge;
  const hostessCharge = previewData.invoice.hostessCharge;
  const subtotal = Math.max(0, roomCharge + fnbCharge + hostessCharge - discount);
  const vatAmount = Math.round(subtotal * 0.08);
  const finalAmount = subtotal + vatAmount;

  const currentInvoice: Invoice = {
    ...previewData.invoice,
    discountAmount: discount,
    vatAmount,
    finalAmount,
    paymentMethod,
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">
                THANH TOÁN HÓA ĐƠN: {room.code} ({room.name})
              </h3>
              <p className="text-xs text-slate-500 font-mono">Mã: {previewData.invoice.invoiceCode}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: 2 columns (Left: Bill Details, Right: VietQR & Payment) */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {/* Column 1: Itemized Bill Details */}
          <div className="p-6 space-y-4 max-h-[580px] overflow-y-auto">
            {/* Room time charges */}
            <div className="space-y-1 text-xs">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex justify-between">
                <span>1. Tiền giờ hát ({billing?.billableMinutes || 0} phút)</span>
                <span className="text-slate-900">{formatVND(roomCharge)}</span>
              </h4>
              <p className="text-slate-400 text-[10px]">
                {billing?.chargedBlocksCount || 1} Block • Đơn giá {formatVND(room.hourlyRate)}/h
                {billing?.breakdown?.transfersCharge > 0 && ` (gồm ${formatVND(billing.breakdown.transfersCharge)} từ phòng trước)`}
              </p>
            </div>

            {/* F&B charges */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex justify-between">
                <span>2. Đồ ăn & Thức uống F&B</span>
                <span className="text-slate-900">{formatVND(fnbCharge)}</span>
              </h4>
              {orders.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Không có đồ dùng</p>
              ) : (
                <div className="space-y-1 pl-1">
                  {orders.map((o) => (
                    <div key={o.id} className="flex justify-between text-slate-600 text-[11px]">
                      <span>
                        {o.name} x {o.consumedQty} {o.unit}
                        {o.returnedQty > 0 && <span className="text-amber-600 ml-1">(đã trả {o.returnedQty})</span>}
                      </span>
                      <span className="font-medium">{formatVND(o.totalPrice)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hostess charges */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-100">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex justify-between">
                <span>3. Phí tiếp viên ({hostessLogs.length} người)</span>
                <span className="text-slate-900">{formatVND(hostessCharge)}</span>
              </h4>
              {hostessLogs.length === 0 ? (
                <p className="text-slate-400 italic text-[11px]">Không có tiếp viên</p>
              ) : (
                <div className="space-y-1 pl-1">
                  {hostessLogs.map((h) => (
                    <div key={h.id} className="flex justify-between text-slate-600 text-[11px]">
                      <span>
                        {h.hostessName} ({h.durationMinutes || 0}m)
                        {h.tipAmount > 0 && <span className="text-sky-600 ml-1">(Tip: {formatVND(h.tipAmount)})</span>}
                      </span>
                      <span className="font-medium">{formatVND(h.totalFee || 300000)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Calculations Box */}
            <div className="pt-3 border-t-2 border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Cộng tiền hàng & dịch vụ:</span>
                <span className="font-semibold">{formatVND(roomCharge + fnbCharge + hostessCharge)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600">
                <span>Giảm trừ / Khuyến mãi (Voucher):</span>
                <input
                  type="number"
                  step="10000"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-28 text-right px-2 py-1 text-xs border border-slate-300 rounded font-bold"
                />
              </div>

              <div className="flex justify-between text-slate-600">
                <span>Thuế GTGT / VAT (8%):</span>
                <span className="font-semibold">{formatVND(vatAmount)}</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-extrabold text-base text-slate-900">
                <span>TỔNG THANH TOÁN:</span>
                <span className="text-emerald-700 text-lg font-mono">{formatVND(finalAmount)}</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              type="button"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>In Phiếu Tạm Tính (Pre-bill K80)</span>
            </button>
          </div>

          {/* Column 2: Payment Method & Dynamic VietQR */}
          <div className="p-6 bg-slate-50/50 flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-3 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('VIETQR')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'VIETQR'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>VietQR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'CASH'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>Tiền Mặt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center justify-center space-y-1 transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Thẻ POS</span>
                </button>
              </div>

              {/* VietQR Dynamic Code Display */}
              {paymentMethod === 'VIETQR' && (
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center space-y-3">
                  <div className="font-extrabold text-xs text-slate-900 tracking-wide uppercase">
                    Quét Mã VietQR Napas247 (Tự Động Điền Tiền)
                  </div>
                  <div className="w-48 h-48 mx-auto bg-slate-100 rounded-xl overflow-hidden p-2 border border-slate-200 flex items-center justify-center">
                    <img
                      src={vietQRUrl}
                      alt="VietQR Payment"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback placeholder if image load fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono space-y-0.5">
                    <div>Ngân hàng: <strong>MB BANK</strong> • STK: <strong>0999999999</strong></div>
                    <div>Nội dung: <strong className="text-sky-700">{room.code} THANHTOAN</strong></div>
                  </div>
                </div>
              )}

              {paymentMethod === 'CASH' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                  <Banknote className="w-10 h-10 text-emerald-600 mx-auto" />
                  <div className="font-bold text-slate-900 text-sm">Thanh toán bằng Tiền Mặt</div>
                  <p className="text-xs text-slate-500">
                    Thu tiền mặt từ khách: <strong className="text-emerald-700">{formatVND(finalAmount)}</strong>
                  </p>
                </div>
              )}

              {paymentMethod === 'CARD' && (
                <div className="p-6 bg-white rounded-2xl border border-slate-200 text-center space-y-2">
                  <CreditCard className="w-10 h-10 text-sky-600 mx-auto" />
                  <div className="font-bold text-slate-900 text-sm">Quẹt Thẻ Ngân Hàng</div>
                  <p className="text-xs text-slate-500">
                    Vui lòng quẹt thẻ qua máy POS ngân hàng với số tiền: <strong className="text-sky-700">{formatVND(finalAmount)}</strong>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2 pt-4">
              <button
                type="button"
                onClick={() => onConfirmCheckout(currentInvoice)}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Xác Nhận Đã Thu Tiền & Hoàn Tất</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
