import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const BudgetCategories = () => {
  const [budgets, setBudgets] = useState([]);
  const [formData, setFormData] = useState({ name: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [editingId, setEditingId] = useState(null);

  const fetchBudgets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/budget-categories', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBudgets(res.data);
    } catch (error) {
      console.error('Error fetching budget categories:', error);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/budget-categories/${editingId}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/budget-categories', formData, config);
      }
      setFormData({ name: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      setEditingId(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget category:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, amount: item.amount, month: item.month, year: item.year });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await axios.delete(`http://localhost:5000/api/budget-categories/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget category:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Budget Categories</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">{editingId ? 'Edit' : 'Add New'} Budget</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Monthly Electricity Budget"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              required
              step="0.01"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="0.00"
            />
          </div>
          <div className="flex space-x-2">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <input
                type="number"
                min="1" max="12"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              />
            </div>
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setFormData({ name: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() }); }}
              className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus size={18} />
            <span>{editingId ? 'Update' : 'Add'} Budget</span>
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold">Period</th>
              <th className="p-4 font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                <td className="p-4 text-gray-800">${parseFloat(item.amount).toFixed(2)}</td>
                <td className="p-4 text-gray-500">{item.month}/{item.year}</td>
                <td className="p-4 flex space-x-2">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {budgets.length === 0 && (
              <tr>
                <td colSpan="4" className="p-8 text-center text-gray-500">No budget categories found. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BudgetCategories;
