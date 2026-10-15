import React from 'react';
import { MenuItem } from '../../core/types';
import { Package, Plus, Search } from 'lucide-react';

interface InventoryViewProps {
  menuItems: MenuItem[];
}

export const InventoryView: React.FC<InventoryViewProps> = ({ menuItems }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('ALL');

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <Package className="w-5 h-5 text-sky-600" />
            <span>THỰC ĐƠN & QUẢN LÝ KHO HÀNG F&B</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tự động trừ kho khi xuất vào phòng và tự động hoàn kho khi 'Kiểm đồ trả lại'
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên hoặc mã món..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 w-56 text-slate-800"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl text-xs py-1.5 px-3 text-slate-700 focus:outline-none focus:ring-1 focus:ring-sky-500"
          >
            <option value="ALL">Tất cả danh mục</option>
            <option value="BEVERAGE">Đồ Uống / Bia / Nước</option>
            <option value="FOOD">Món Ăn / Trái Cây</option>
            <option value="SNACK">Đồ Khô / Snack</option>
            <option value="OTHER">Khăn & Khác</option>
          </select>
        </div>
      </div>

      {/* Table of items */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3.5 px-4">Mã Món</th>
              <th className="py-3.5 px-4">Tên Sản Phẩm</th>
              <th className="py-3.5 px-4">Phân Loại</th>
              <th className="py-3.5 px-4">Đơn Vị</th>
              <th className="py-3.5 px-4 text-right">Đơn Giá</th>
              <th className="py-3.5 px-4 text-center">Tồn Kho Hiện Tại</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item) => {
              const isLowStock = item.stockQuantity <= 30;
              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-xs text-sky-700">{item.code}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{item.name}</td>
                  <td className="py-3 px-4 text-xs">
                    <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-slate-500">{item.unit}</td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-800">
                    {formatVND(item.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block font-extrabold text-xs px-2.5 py-0.5 rounded-full ${
                        isLowStock
                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.stockQuantity} {item.unit}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
