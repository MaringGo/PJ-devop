import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Plus, Edit2, Trash2 } from 'lucide-react';

const ExpenseTypes = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchExpenseTypes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/expense-types', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setExpenseTypes(res.data);
    } catch (error) {
      console.error('Error fetching expense types:', error);
    }
  };

  useEffect(() => {
    fetchExpenseTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
      if (editingId) {
        await axios.put(`http://localhost:5000/api/expense-types/${editingId}`, formData, config);
      } else {
        await axios.post('http://localhost:5000/api/expense-types', formData, config);
      }
      setFormData({ name: '', description: '' });
      setEditingId(null);
      fetchExpenseTypes();
    } catch (error) {
      console.error('Error saving expense type:', error);
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, description: item.description });
    setEditingId(item.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this?')) {
      try {
        await axios.delete(`http://localhost:5000/api/expense-types/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        fetchExpenseTypes();
      } catch (error) {
        console.error('Error deleting expense type:', error);
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Expense Types</h2>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">{editingId ? 'Edit' : 'Add New'} Expense Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Electricity, Water"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Optional description"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setFormData({ name: '', description: '' }); }}
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
            <span>{editingId ? 'Update' : 'Add'} Type</span>
          </button>
        </div>
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenseTypes.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium text-gray-800">{item.name}</td>
                <td className="p-4 text-gray-500">{item.description}</td>
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
            {expenseTypes.length === 0 && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-gray-500">No expense types found. Add one above.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExpenseTypes;
