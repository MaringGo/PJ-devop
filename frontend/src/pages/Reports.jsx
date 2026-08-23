import { useState, useEffect } from 'react';
import axios from 'axios';

const MONTH_NAMES = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const Reports = () => {
  const now = new Date();
  const [startMonth, setStartMonth] = useState(7);
  const [startYear, setStartYear] = useState(now.getFullYear());
  const [endMonth, setEndMonth] = useState(now.getMonth() + 1);
  const [endYear, setEndYear] = useState(now.getFullYear());
  const [reportData, setReportData] = useState(null);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchReport = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/dashboard/report', {
        headers,
        params: { startMonth, startYear, endMonth, endYear }
      });
      setReportData(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  // Group monthly data for comparison chart
  const getMonthlyComparison = () => {
    if (!reportData) return [];
    const grouped = {};
    reportData.monthly.forEach(item => {
      const key = `${item.year}-${item.month}`;
      if (!grouped[key]) grouped[key] = { month: item.month, year: item.year, types: {} };
      grouped[key].types[item.expense_type] = parseFloat(item.total);
    });
    return Object.values(grouped);
  };

  const comparison = getMonthlyComparison();
  const allTypes = [...new Set(reportData?.monthly?.map(m => m.expense_type) || [])];
  const maxMonthly = Math.max(...comparison.map(c => Object.values(c.types).reduce((a, b) => a + b, 0)), 1);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">รายงานย้อนหลัง / เปรียบเทียบ</h2>

      {/* Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">เลือกช่วงเวลา</h3>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">เดือนเริ่มต้น</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg" value={startMonth} onChange={e => setStartMonth(e.target.value)}>
              {MONTH_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ปี</label>
            <input type="number" className="px-3 py-2 border border-gray-300 rounded-lg w-24" value={startYear} onChange={e => setStartYear(e.target.value)} />
          </div>
          <span className="text-gray-400 pb-2">ถึง</span>
          <div>
            <label className="block text-sm text-gray-600 mb-1">เดือนสิ้นสุด</label>
            <select className="px-3 py-2 border border-gray-300 rounded-lg" value={endMonth} onChange={e => setEndMonth(e.target.value)}>
              {MONTH_NAMES.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">ปี</label>
            <input type="number" className="px-3 py-2 border border-gray-300 rounded-lg w-24" value={endYear} onChange={e => setEndYear(e.target.value)} />
          </div>
          <button onClick={fetchReport} className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            ค้นหา
          </button>
        </div>
      </div>

      {reportData && (
        <>
          {/* Stacked Bar Chart Comparison */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">เปรียบเทียบค่าใช้จ่ายรายเดือน</h3>
            <div className="flex items-end space-x-6 h-64 mb-4">
              {comparison.map((item, i) => {
                const total = Object.values(item.types).reduce((a, b) => a + b, 0);
                const height = (total / maxMonthly) * 100;
                return (
                  <div key={i} className="flex flex-col items-center flex-1">
                    <span className="text-xs text-gray-500 mb-1">฿{(total / 1000).toFixed(1)}k</span>
                    <div className="w-full rounded-t-md overflow-hidden" style={{ height: `${Math.max(height, 5)}%` }}>
                      {allTypes.map((type, ti) => {
                        const val = item.types[type] || 0;
                        const pct = total > 0 ? (val / total) * 100 : 0;
                        return <div key={ti} style={{ height: `${pct}%`, backgroundColor: COLORS[ti % COLORS.length] }} />;
                      })}
                    </div>
                    <span className="text-xs text-gray-600 mt-2 font-medium">{MONTH_NAMES[item.month]} {item.year}</span>
                  </div>
                );
              })}
              {comparison.length === 0 && <p className="text-gray-400 text-center py-4 w-full">ไม่มีข้อมูลในช่วงที่เลือก</p>}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-2">
              {allTypes.map((type, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-sm text-gray-600">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Budget vs Actual Table */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">งบประมาณ vs ค่าใช้จ่ายจริง</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                    <th className="p-4 font-semibold">เดือน/ปี</th>
                    <th className="p-4 font-semibold">หมวดงบ</th>
                    <th className="p-4 font-semibold text-right">งบประมาณ</th>
                    <th className="p-4 font-semibold text-right">ใช้จ่ายจริง</th>
                    <th className="p-4 font-semibold text-right">คงเหลือ</th>
                    <th className="p-4 font-semibold">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.budgetVsActual.map((row, i) => {
                    const budget = parseFloat(row.budget_amount);
                    const actual = parseFloat(row.actual_amount);
                    const remaining = budget - actual;
                    const pct = budget > 0 ? (actual / budget * 100).toFixed(0) : 0;
                    return (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-4 text-sm">{MONTH_NAMES[row.month]} {row.year}</td>
                        <td className="p-4 text-sm font-medium">{row.budget_name}</td>
                        <td className="p-4 text-sm text-right">฿{budget.toLocaleString()}</td>
                        <td className="p-4 text-sm text-right">฿{actual.toLocaleString()}</td>
                        <td className={`p-4 text-sm text-right font-semibold ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          ฿{remaining.toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${pct > 90 ? 'bg-red-100 text-red-700' : pct > 70 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {reportData.budgetVsActual.length === 0 && (
                    <tr><td colSpan="6" className="p-8 text-center text-gray-500">ไม่มีข้อมูลในช่วงที่เลือก</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
