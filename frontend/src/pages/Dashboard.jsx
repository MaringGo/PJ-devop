import { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, DollarSign, FileText, PieChart } from 'lucide-react';

const MONTH_NAMES = ['', 'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/summary', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        setData(res.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      }
    };
    fetchData();
  }, []);

  if (!data) return <div className="text-center py-10 text-gray-500">Loading...</div>;

  const budgetUsed = data.monthlyBudget > 0 ? (data.monthlySpending / data.monthlyBudget * 100).toFixed(1) : 0;
  const remaining = data.monthlyBudget - data.monthlySpending;
  const maxByType = Math.max(...data.byType.map(t => parseFloat(t.total)), 1);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">ค่าใช้จ่ายเดือนนี้</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">฿{data.monthlySpending.toLocaleString()}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg"><DollarSign className="text-red-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">งบประมาณเดือนนี้</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">฿{data.monthlyBudget.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg"><TrendingUp className="text-blue-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">คงเหลือ</p>
              <p className={`text-2xl font-bold mt-1 ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ฿{remaining.toLocaleString()}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg"><PieChart className="text-green-600" size={24} /></div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">รายการเดือนนี้</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{data.transactionCount} รายการ</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg"><FileText className="text-purple-600" size={24} /></div>
          </div>
        </div>
      </div>

      {/* Budget Usage Bar */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">การใช้งบประมาณเดือนนี้</h3>
        <div className="w-full bg-gray-200 rounded-full h-6">
          <div
            className={`h-6 rounded-full transition-all ${parseFloat(budgetUsed) > 90 ? 'bg-red-500' : parseFloat(budgetUsed) > 70 ? 'bg-yellow-500' : 'bg-indigo-500'}`}
            style={{ width: `${Math.min(budgetUsed, 100)}%` }}
          >
            <span className="text-white text-sm font-medium pl-3 leading-6">{budgetUsed}%</span>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">ใช้ไป ฿{data.monthlySpending.toLocaleString()} จาก ฿{data.monthlyBudget.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Type - Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">ค่าใช้จ่ายตามประเภท (เดือนนี้)</h3>
          <div className="space-y-3">
            {data.byType.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700 font-medium">{item.name}</span>
                  <span className="text-gray-500">฿{parseFloat(item.total).toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full transition-all"
                    style={{ width: `${(parseFloat(item.total) / maxByType) * 100}%`, backgroundColor: COLORS[i % COLORS.length] }}
                  />
                </div>
              </div>
            ))}
            {data.byType.length === 0 && <p className="text-gray-400 text-center py-4">ไม่มีข้อมูล</p>}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">แนวโน้มรายเดือน</h3>
          <div className="flex items-end space-x-4 h-48">
            {data.trend.map((item, i) => {
              const maxTrend = Math.max(...data.trend.map(t => parseFloat(t.total)), 1);
              const height = (parseFloat(item.total) / maxTrend) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1">
                  <span className="text-xs text-gray-500 mb-1">฿{(parseFloat(item.total) / 1000).toFixed(0)}k</span>
                  <div
                    className="w-full bg-indigo-500 rounded-t-md transition-all hover:bg-indigo-600"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  />
                  <span className="text-xs text-gray-500 mt-2">{MONTH_NAMES[item.month]}</span>
                </div>
              );
            })}
            {data.trend.length === 0 && <p className="text-gray-400 text-center py-4 w-full">ไม่มีข้อมูล</p>}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">รายการล่าสุด</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-sm">
                <th className="p-3">วันที่</th>
                <th className="p-3">ประเภท</th>
                <th className="p-3">รายละเอียด</th>
                <th className="p-3 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3 text-sm">{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                  <td className="p-3 text-sm"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">{tx.expense_type_name}</span></td>
                  <td className="p-3 text-sm text-gray-600">{tx.description}</td>
                  <td className="p-3 text-sm text-right font-semibold text-gray-800">฿{parseFloat(tx.amount).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
