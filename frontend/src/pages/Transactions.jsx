import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [budgetCategories, setBudgetCategories] = useState([]);
  const [formData, setFormData] = useState({
    expense_type_id: '', budget_category_id: '', amount: '', date: '', description: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchAll = async () => {
    try {
      const [txRes, etRes, bcRes] = await Promise.all([
        axios.get('http://localhost:5000/api/transactions', { headers }),
        axios.get('http://localhost:5000/api/expense-types', { headers }),
        axios.get('http://localhost:5000/api/budget-categories', { headers })
      ]);
      setTransactions(txRes.data);
      setExpenseTypes(etRes.data);
      setBudgetCategories(bcRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/transactions/${editingId}`, formData, { headers });
      } else {
        await axios.post('http://localhost:5000/api/transactions', formData, { headers });
      }
      setFormData({ expense_type_id: '', budget_category_id: '', amount: '', date: '', description: '' });
      setEditingId(null);
      setShowForm(false);
      fetchAll();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      expense_type_id: item.expense_type_id,
      budget_category_id: item.budget_category_id,
      amount: item.amount,
      date: new Date(item.date).toISOString().split('T')[0],
      description: item.description
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('ต้องการลบรายการนี้หรือไม่?')) {
      try {
        await axios.delete(`http://localhost:5000/api/transactions/${id}`, { headers });
        fetchAll();
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">รายการค่าใช้จ่าย</h2>
        <button
          onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ expense_type_id: '', budget_category_id: '', amount: '', date: '', description: '' }); }}
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={18} /><span>{showForm ? 'ปิดฟอร์ม' : 'เพิ่มรายการ'}</span>
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{editingId ? 'แก้ไข' : 'เพิ่ม'}รายการค่าใช้จ่าย</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ประเภทค่าใช้จ่าย</label>
              <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.expense_type_id} onChange={(e) => setFormData({ ...formData, expense_type_id: e.target.value })}>
                <option value="">-- เลือก --</option>
                {expenseTypes.map(et => <option key={et.id} value={et.id}>{et.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">หมวดงบประมาณ</label>
              <select required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.budget_category_id} onChange={(e) => setFormData({ ...formData, budget_category_id: e.target.value })}>
                <option value="">-- เลือก --</option>
                {budgetCategories.map(bc => <option key={bc.id} value={bc.id}>{bc.name} ({bc.month}/{bc.year})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (฿)</label>
              <input type="number" step="0.01" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">วันที่</label>
              <input type="date" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">รายละเอียด</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="รายละเอียดเพิ่มเติม" />
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-3">
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-gray-600 hover:text-gray-800">ยกเลิก</button>
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
              {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มรายการ'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                <th className="p-4 font-semibold">วันที่</th>
                <th className="p-4 font-semibold">ประเภท</th>
                <th className="p-4 font-semibold">หมวดงบ</th>
                <th className="p-4 font-semibold">รายละเอียด</th>
                <th className="p-4 font-semibold text-right">จำนวนเงิน</th>
                <th className="p-4 font-semibold w-24">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-sm">{new Date(tx.date).toLocaleDateString('th-TH')}</td>
                  <td className="p-4 text-sm"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-xs font-medium">{tx.expense_type_name}</span></td>
                  <td className="p-4 text-sm text-gray-500">{tx.budget_category_name}</td>
                  <td className="p-4 text-sm text-gray-600">{tx.description}</td>
                  <td className="p-4 text-sm text-right font-semibold">฿{parseFloat(tx.amount).toLocaleString()}</td>
                  <td className="p-4 flex space-x-2">
                    <button onClick={() => handleEdit(tx)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(tx.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">ยังไม่มีรายการค่าใช้จ่าย</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;
