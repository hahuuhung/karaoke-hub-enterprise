import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Clock, Users, Utensils, Calendar } from 'lucide-react';

interface RevenueData {
  summary: {
    totalRevenue: number;
    totalInvoicesCount: number;
    totalRoom: number;
    roomPercentage: number;
    totalHostess: number;
    hostessPercentage: number;
    totalFnb: number;
    fnbPercentage: number;
  };
  revenueByRoom: Array<{ name: string; value: number }>;
  topSellingItems: Array<{ name: string; qty: number; revenue: number }>;
  hostessRanking: Array<{ id: string; name: string; teamName: string; turnsToday: number; hourlyRate: number; estimatedRevenue: number }>;
  dailyBreakdown: Array<{ day: string; label: string; revenue: number }>;
}

export const RevenueReportView: React.FC = () => {
  const [data, setData] = useState<RevenueData | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');

  useEffect(() => {
    fetch('/api/reports/revenue')
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load revenue report', err));
  }, [period]);

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (!data) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Đang tải báo cáo thống kê doanh thu...
      </div>
    );
  }

  const { summary, revenueByRoom, topSellingItems, hostessRanking, dailyBreakdown } = data;
  const maxDayRevenue = Math.max(...dailyBreakdown.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6">
      {/* Top Header & Period Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#5847D9]" />
            <span>THỐNG KÊ DOANH THU & HIỆU SUẤT HOẠT ĐỘNG</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Phân tích chi tiết tiền giờ, tiền dịch vụ tiếp viên và doanh số bán hàng F&B
          </p>
        </div>

        {/* Period Filter Buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'today' ? 'bg-white text-[#5847D9] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hôm nay
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'week' ? 'bg-white text-[#5847D9] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tuần này
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              period === 'month' ? 'bg-white text-[#5847D9] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tháng này
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tổng Doanh Thu</span>
            <div className="p-2 rounded-xl bg-purple-50 text-[#5847D9]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-slate-900 font-mono">
            {formatVND(summary.totalRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{summary.totalInvoicesCount} hóa đơn đã hoàn tất</span>
          </div>
        </div>

        {/* Room Hourly Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Tiền Giờ Hát</span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-sky-700 font-mono">
            {formatVND(summary.totalRoom)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Chiếm <strong className="text-slate-800">{summary.roomPercentage}%</strong> tổng doanh thu
          </div>
        </div>

        {/* Hostess Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Phí Tiếp Viên</span>
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-pink-600 font-mono">
            {formatVND(summary.totalHostess)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Chiếm <strong className="text-slate-800">{summary.hostessPercentage}%</strong> tổng doanh thu
          </div>
        </div>

        {/* F&B Revenue */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Đồ Uống & Món Ăn (F&B)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Utensils className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-amber-600 font-mono">
            {formatVND(summary.totalFnb)}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Chiếm <strong className="text-slate-800">{summary.fnbPercentage}%</strong> tổng doanh thu
          </div>
        </div>
      </div>

      {/* Main Charts & Rankings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Daily Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#5847D9]" />
              <span>DOANH THU THEO NGÀY (7 NGÀY GẦN NHẤT)</span>
            </h3>
            <span className="text-xs text-slate-400">Đơn vị: VNĐ</span>
          </div>

          <div className="pt-4 flex items-end justify-between gap-3 h-56 border-b border-slate-100 pb-2">
            {dailyBreakdown.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.revenue / maxDayRevenue) * 100));
              const isToday = idx === dailyBreakdown.length - 1;

              return (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-mono font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {Math.round(item.revenue / 1000000)}tr
                  </span>
                  <div className="w-full bg-slate-100 rounded-t-xl overflow-hidden flex items-end h-40">
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-[#5847D9] to-indigo-400 shadow-md shadow-[#5847D9]/20'
                          : 'bg-slate-300 hover:bg-[#5847D9]/70'
                      }`}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold truncate ${
                      isToday ? 'text-[#5847D9] font-extrabold' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Revenue by Room breakdown */}
          <div className="space-y-3 pt-2">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Doanh Thu Theo Phòng Hát
            </h4>
            <div className="space-y-2">
              {revenueByRoom.length === 0 ? (
                <div className="text-xs text-slate-400 italic">Chưa có dữ liệu phòng</div>
              ) : (
                revenueByRoom.map((r) => (
                  <div key={r.name} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{r.name}</span>
                    <span className="font-extrabold text-slate-900 font-mono">{formatVND(r.value)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 span): Top Selling F&B & Top Hostesses */}
        <div className="space-y-6">
          {/* Top Selling Items */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Utensils className="w-4 h-4 text-amber-500" />
              <span>HÀNG HÓA BÁN CHẠY (TOP F&B)</span>
            </h3>

            <div className="space-y-2.5">
              {topSellingItems.map((item, idx) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-slate-200 font-bold text-slate-700 text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-slate-800 truncate max-w-[130px]">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sky-700">{item.qty} xuất</span>
                    <div className="text-[10px] text-slate-400">{formatVND(item.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Hostesses Ranking */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center space-x-2">
              <Users className="w-4 h-4 text-pink-500" />
              <span>XẾP HẠNG TIẾP VIÊN (HÔM NAY)</span>
            </h3>

            <div className="space-y-2">
              {hostessRanking.slice(0, 5).map((h, idx) => (
                <div
                  key={h.id}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-xl border border-slate-100 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-800 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="font-bold text-slate-900">{h.name}</span>
                      <span className="text-[10px] text-slate-400 block">{h.teamName}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="bg-pink-100 text-pink-800 font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                      {h.turnsToday} ca
                    </span>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      ~ {formatVND(h.estimatedRevenue)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
