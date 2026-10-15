import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, CheckCircle, Lock, Shield, Smartphone, Mail, Users } from 'lucide-react';
import { StaffUser, StaffRole } from '../../core/types';

export const StaffRolesView: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('CASHIER');
  const [toast, setToast] = useState<string | null>(null);

  const fetchStaff = () => {
    fetch('/api/staff')
      .then((res) => res.json())
      .then((data) => setStaffList(data))
      .catch((err) => console.error('Failed to load staff list', err));
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !username) return;

    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, phone, role }),
      });

      if (res.ok) {
        setToast(`Đã cấp tài khoản thành công cho ${name}!`);
        setName('');
        setUsername('');
        setPhone('');
        setPassword('');
        fetchStaff();
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to create staff', err);
    }
  };

  const getRoleBadge = (r: StaffRole) => {
    switch (r) {
      case 'MANAGER':
        return (
          <span className="bg-[#5847D9]/10 text-[#5847D9] border border-[#5847D9]/20 font-bold px-2.5 py-0.5 rounded-full text-xs">
            Quản Lý (Toàn quyền)
          </span>
        );
      case 'CASHIER':
        return (
          <span className="bg-sky-100 text-sky-800 border border-sky-200 font-bold px-2.5 py-0.5 rounded-full text-xs">
            Thu Ngân (Bán hàng)
          </span>
        );
      case 'WAITER':
        return (
          <span className="bg-amber-100 text-amber-800 border border-amber-200 font-bold px-2.5 py-0.5 rounded-full text-xs">
            Nhân Viên Phục Vụ
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-[#5847D9]" />
            <span>TÀI KHOẢN & PHÂN QUYỀN TRUY CẬP (ROLES & PERMISSIONS)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Quản lý ai được đăng nhập vào quán và được phép thao tác những tính năng nào
          </p>
        </div>

        <div className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-purple-50 text-[#5847D9] border border-purple-100">
          Tổng cộng: <strong>{staffList.length} nhân sự</strong>
        </div>
      </div>

      {/* Role Permission Descriptions Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Manager Role Card */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm space-y-3 bg-purple-50/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#5847D9] text-white flex items-center justify-center font-bold text-xs">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Quản Lý (Chủ quán & Quản lý ca)</h3>
              <span className="text-[11px] text-purple-700 font-semibold">Quyền hạn tối cao (Full Access)</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toàn quyền xem và thao tác: Sơ đồ phòng, Tiếp viên xoay tua, Hàng hóa & kho, Thống kê doanh thu, Lịch sử kiểm toán và Cấu hình quán.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Phòng', 'Tiếp viên', 'Hàng hóa', 'Thống kê', 'Lịch sử', 'Cấu hình'].map((t) => (
              <span key={t} className="bg-purple-100 text-[#5847D9] text-[10px] font-bold px-2 py-0.5 rounded">
                ✓ {t}
              </span>
            ))}
          </div>
        </div>

        {/* Cashier Role Card */}
        <div className="bg-white p-4 rounded-2xl border border-sky-200 shadow-sm space-y-3 bg-sky-50/20">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">Nhân Viên Thu Ngân (Cashier POS)</h3>
              <span className="text-[11px] text-sky-700 font-semibold">Quyền hạn quầy bán hàng</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Mở phòng, gọi món F&B, điều tiếp viên và in hóa đơn tạm tính/chính thức. Ẩn báo cáo doanh thu, lịch sử kiểm toán và phân quyền.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {['Phòng', 'Gọi món', 'Thanh toán VietQR'].map((t) => (
              <span key={t} className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded">
                ✓ {t}
              </span>
            ))}
            {['Thống kê', 'Cấu hình quán'].map((t) => (
              <span key={t} className="bg-slate-100 text-slate-400 text-[10px] px-2 py-0.5 rounded line-through">
                ✕ {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2-Columns: Create Staff Form (Left) & Staff List (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form: Create new staff */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-4 h-4 text-[#5847D9]" />
            <h3 className="font-extrabold text-sm text-slate-900">THÊM TÀI KHOẢN NHÂN SỰ</h3>
          </div>

          {toast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{toast}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Họ và tên nhân viên</label>
              <input
                type="text"
                placeholder="VD: Nguyễn Thị Mai"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Email hoặc Tên đăng nhập</label>
              <input
                type="text"
                placeholder="thungan2@karaoke.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Số điện thoại</label>
              <input
                type="tel"
                placeholder="0912.xxx.xxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Mật khẩu ban đầu</label>
              <input
                type="password"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5847D9]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Vai trò phân quyền</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StaffRole)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#5847D9] bg-white font-semibold text-slate-800"
              >
                <option value="CASHIER">Nhân viên thu ngân (Mặc định)</option>
                <option value="MANAGER">Đồng quản lý (Toàn quyền)</option>
                <option value="WAITER">Nhân viên phục vụ / Tablet</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#5847D9] hover:bg-[#4736C2] text-white font-extrabold rounded-xl shadow-md shadow-[#5847D9]/20 transition-all flex items-center justify-center space-x-1.5 mt-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Tạo Tài Khoản Mới</span>
            </button>
          </form>
        </div>

        {/* Right (2 spans): Staff list table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900">
              NHÂN SỰ ĐĂNG NHẬP QUÁN NÀY ({staffList.length})
            </h3>
            <span className="text-xs text-slate-400">Tự động gắn mã cơ sở</span>
          </div>

          <div className="divide-y divide-slate-100 flex-1 overflow-y-auto">
            {staffList.map((user) => {
              const initials = user.name
                .split(' ')
                .map((n) => n[0])
                .slice(-2)
                .join('')
                .toUpperCase();

              return (
                <div
                  key={user.id}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#5847D9] to-indigo-500 text-white font-bold text-sm flex items-center justify-center shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-extrabold text-sm text-slate-900">{user.name}</span>
                        {user.id === 'u01' && (
                          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Bạn
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center space-x-3 mt-0.5">
                        <span className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span>{user.username}</span>
                        </span>
                        {user.phone && (
                          <span className="flex items-center space-x-1">
                            <Smartphone className="w-3 h-3" />
                            <span>{user.phone}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div>{getRoleBadge(user.role)}</div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Đang hoạt động" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
