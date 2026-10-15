import fs from 'fs';

function extractText(str) {
  return str.replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<svg[\s\S]*?<\/svg>/gi, '')
            .replace(/<[^>]+>/g, '\n')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 0);
}

const screens = [
  { name: '08_So_do_phong_Sang', title: 'Sơ đồ phòng (Light)' },
  { name: '09_Danh_sach_tiep_vien_Sang', title: 'Danh sách tiếp viên (Light)' },
  { name: '10_Hang_hoa_Thuc_don_Sang', title: 'Hàng hóa & Thực đơn (Light)' },
  { name: '11_Tai_khoan_Phan_quyen_Sang', title: 'Tài khoản & Phân quyền (Light)' },
  { name: '05_Lich_su_hoat_dong', title: 'Lịch sử hoạt động (Activity Audit)' },
  { name: '06_Thong_ke_doanh_thu', title: 'Thống kê doanh thu (Analytics)' },
  { name: '07_Cau_hinh_quan', title: 'Cấu hình quán (Settings)' },
];

screens.forEach(s => {
  const tpl = fs.readFileSync(`unbundled_screens/${s.name}_template.html`, 'utf-8');
  const texts = extractText(tpl);
  console.log(`\n============================================================`);
  console.log(`PAGE: ${s.title}`);
  console.log(`============================================================`);
  console.log(texts.slice(0, 40).join('  |  '));
});
