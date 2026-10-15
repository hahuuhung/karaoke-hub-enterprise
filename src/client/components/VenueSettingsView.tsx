import React, { useState, useEffect } from 'react';
import { Settings, Save, Wifi, CreditCard, Clock, Store, Receipt, CheckCircle, AlertCircle } from 'lucide-react';
import { VenueSettings } from '../../core/types';

const POPULAR_BANKS = [
  { id: 'MB', name: 'MB Bank (Ngân hàng Quân Đội)' },
  { id: 'VCB', name: 'Vietcombank (Ngoại thương Việt Nam)' },
  { id: 'TCB', name: 'Techcombank (Kỹ Thương Việt Nam)' },
  { id: 'BIDV', name: 'BIDV (Đầu tư và Phát triển Việt Nam)' },
  { id: 'ACB', name: 'ACB (Á Châu)' },
  { id: 'VPB', name: 'VPBank (Việt Nam Thịnh Vượng)' },
  { id: 'TPB', name: 'TPBank (Tiên Phong)' },
];

export const VenueSettingsView: React.FC = () => {
  const [settings, setSettings] = useState<VenueSettings>({
    venueName: 'Karaoke Luxury Enterprise',
    phone: '0987.654.321',
    address: '123 Phố Vọng, Hai Bà Trưng, Hà Nội',
    slogan: 'Đồng bộ đám mây thời gian thực & Âm thanh đỉnh cao',
    wifiSsid: 'KaraokeFree_5G',
    wifiPassword: 'luxuryenterprise',
    bankId: 'MB',
    bankAccountNo: '0987654321',
    bankAccountName: 'NGUYEN VAN QUAN LY',
    firstBlockMinutes: 60,
    subsequentBlockMinutes: 15,
    gracePeriodMinutes: 10,
    peakHourSurchargeRate: 0.2,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.venueName) {
          setSettings(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load venue settings', err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setNotification(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Không thể lưu cài đặt');

      setNotification({
        type: 'success',
        message: 'Cài đặt quán đã được lưu thành công và áp dụng cho toàn bộ hóa đơn!',
      });
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Lỗi khi lưu cấu hình',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Đang tải thông tin cấu hình quán...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Settings className="w-5 h-5 text-[#5847D9]" />
            <span>CẤU HÌNH QUÁN & QUY TẮC THANH TOÁN</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thương hiệu, WiFi, VietQR nhận tiền và thuật toán tính block giờ hát tự động
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center space-x-2 px-5 py-2.5 bg-[#5847D9] hover:bg-[#4838bd] text-white text-xs font-bold rounded-xl transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Đang lưu...' : 'LƯU CÀI ĐẶT'}</span>
        </button>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center space-x-2 ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Settings Form */}
        <form onSubmit={handleSave} className="lg:col-span-8 space-y-6">
          {/* Thông tin thương hiệu quán */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Store className="w-4 h-4 text-[#5847D9]" />
              <h3 className="text-sm font-bold text-slate-900">Thông tin cơ sở & Thương hiệu</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên thương hiệu quán (In trên hóa đơn)
                </label>
                <input
                  type="text"
                  name="venueName"
                  value={settings.venueName}
                  onChange={handleChange}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5847D9] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại hotline
                </label>
                <input
                  type="text"
                  name="phone"
                  value={settings.phone}
                  onChange={handleChange}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5847D9] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ cơ sở kinh doanh
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address}
                  onChange={handleChange}
                  required
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5847D9] focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Slogan / Lời chào chân trang hóa đơn
                </label>
                <input
                  type="text"
                  name="slogan"
                  value={settings.slogan}
                  onChange={handleChange}
                  className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5847D9] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* WiFi Quán & Tài khoản VietQR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WiFi */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">WiFi cho khách</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên WiFi (SSID)
                  </label>
                  <input
                    type="text"
                    name="wifiSsid"
                    value={settings.wifiSsid}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mật khẩu WiFi
                  </label>
                  <input
                    type="text"
                    name="wifiPassword"
                    value={settings.wifiPassword}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* VietQR Bank */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Nhận tiền qua VietQR</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngân hàng thụ hưởng
                  </label>
                  <select
                    name="bankId"
                    value={settings.bankId}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    {POPULAR_BANKS.map((bank) => (
                      <option key={bank.id} value={bank.id}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số tài khoản ngân hàng
                  </label>
                  <input
                    type="text"
                    name="bankAccountNo"
                    value={settings.bankAccountNo}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên chủ tài khoản (In hoa không dấu)
                  </label>
                  <input
                    type="text"
                    name="bankAccountName"
                    value={settings.bankAccountName}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quy tắc tính tiền giờ hát */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
              <Clock className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">Quy tắc Block & Thời gian ân hạn</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Block giờ đầu tiên (phút)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="firstBlockMinutes"
                    min="1"
                    max="120"
                    value={settings.firstBlockMinutes}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">phút</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mặc định: 60 phút (tối thiểu tính đủ block đầu)
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Block các giờ tiếp theo (phút)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="subsequentBlockMinutes"
                    min="1"
                    max="60"
                    value={settings.subsequentBlockMinutes}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">phút</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Mặc định: 15 phút làm tròn lên block tiếp theo
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời gian ân hạn miễn phí (Grace)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="gracePeriodMinutes"
                    min="0"
                    max="30"
                    value={settings.gracePeriodMinutes}
                    onChange={handleChange}
                    className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                  />
                  <span className="absolute right-3 top-2 text-xs text-slate-400">phút</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Dưới 10 phút hủy phòng không tính phí
                </p>
              </div>
            </div>
          </div>
        </form>

        {/* Live K80 Thermal Receipt Preview */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Receipt className="w-4 h-4 text-[#5847D9]" />
              <span>Xem trước hóa đơn in</span>
            </h3>
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Giấy in nhiệt K80
            </span>
          </div>

          <div className="bg-[#FAF9F5] p-5 rounded-xl border border-dashed border-slate-300 font-mono text-[11px] text-slate-800 shadow-sm space-y-3">
            {/* Store header */}
            <div className="text-center space-y-1">
              <div className="font-extrabold text-sm uppercase text-slate-900 tracking-wide">
                {settings.venueName || 'KARAOKE LUXURY'}
              </div>
              <div className="text-[10px] text-slate-600">{settings.address || 'Hà Nội'}</div>
              <div className="text-[10px] text-slate-600">Hotline: {settings.phone}</div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            <div className="text-center font-bold text-xs">HÓA ĐƠN THANH TOÁN</div>
            <div className="text-[10px] text-slate-500 flex justify-between">
              <span>Phòng: VIP 01</span>
              <span>15/10/2026 21:30</span>
            </div>

            <div className="border-t border-dashed border-slate-300 my-1"></div>

            {/* Bill Table */}
            <div className="space-y-1">
              <div className="grid grid-cols-12 font-bold text-[10px] text-slate-600 pb-1">
                <span className="col-span-6">TÊN DỊCH VỤ</span>
                <span className="col-span-2 text-right">SL</span>
                <span className="col-span-4 text-right">THÀNH TIỀN</span>
              </div>
              <div className="grid grid-cols-12 text-[10px]">
                <span className="col-span-6 truncate">Giờ hát VIP ({settings.firstBlockMinutes}m)</span>
                <span className="col-span-2 text-right">1.5h</span>
                <span className="col-span-4 text-right font-medium">350.000</span>
              </div>
              <div className="grid grid-cols-12 text-[10px]">
                <span className="col-span-6 truncate">Tiger Crystal (Lon)</span>
                <span className="col-span-2 text-right">8</span>
                <span className="col-span-4 text-right font-medium">280.000</span>
              </div>
              <div className="grid grid-cols-12 text-[10px]">
                <span className="col-span-6 truncate">Tiếp viên: Mai Lan</span>
                <span className="col-span-2 text-right">1.5h</span>
                <span className="col-span-4 text-right font-medium">300.000</span>
              </div>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            {/* Total */}
            <div className="flex justify-between font-bold text-xs text-slate-900">
              <span>TỔNG CỘNG:</span>
              <span className="text-indigo-900 font-extrabold">930.000 đ</span>
            </div>

            <div className="border-t border-dashed border-slate-400 my-2"></div>

            {/* Footer */}
            <div className="text-center text-[10px] text-slate-600 space-y-1">
              <div className="font-semibold text-slate-800 italic">
                {settings.slogan || 'Cảm ơn quý khách & Hẹn gặp lại!'}
              </div>
              <div>
                WiFi: <span className="font-bold text-slate-800">{settings.wifiSsid}</span>
                {' · '}
                MK: <span className="font-bold text-slate-800">{settings.wifiPassword}</span>
              </div>
              <div className="text-[9px] text-slate-400 pt-1">
                VietQR: {settings.bankId} · {settings.bankAccountNo} ({settings.bankAccountName})
              </div>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 italic">
            Mọi hóa đơn tạm tính và hóa đơn thanh toán xuất cho khách đều tự động lấy thông tin từ cấu hình này.
          </p>
        </div>
      </div>
    </div>
  );
};
