import { useContext } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Settings, PieChart, Wallet } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-wider">e-Utilities</h1>
          <p className="text-indigo-200 text-sm mt-1">Cost Management</p>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors">
            <Home size={20} />
            <span>Dashboard</span>
          </Link>
          <Link to="/transactions" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors">
            <Wallet size={20} />
            <span>Transactions</span>
          </Link>
          <Link to="/reports" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors">
            <PieChart size={20} />
            <span>Reports</span>
          </Link>
          <div className="pt-6 pb-2">
            <p className="px-3 text-xs font-semibold text-indigo-300 uppercase tracking-wider">Master Data</p>
          </div>
          <Link to="/expense-types" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors">
            <Settings size={20} />
            <span>Expense Types</span>
          </Link>
          <Link to="/budget-categories" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-indigo-600 transition-colors">
            <Settings size={20} />
            <span>Budgets</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-indigo-600">
          <div className="flex items-center justify-between">
            <span className="text-sm">{user?.username}</span>
            <button onClick={handleLogout} className="p-2 bg-indigo-800 rounded-md hover:bg-indigo-900 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm h-16 flex items-center px-8">
          <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
        </header>
        <div className="p-8 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
