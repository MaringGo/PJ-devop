import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<div className="bg-white p-6 rounded-lg shadow-sm"><h2>Dashboard Placeholder</h2></div>} />
          <Route path="transactions" element={<div className="bg-white p-6 rounded-lg shadow-sm"><h2>Transactions Placeholder</h2></div>} />
          <Route path="reports" element={<div className="bg-white p-6 rounded-lg shadow-sm"><h2>Reports Placeholder</h2></div>} />
          <Route path="expense-types" element={<div className="bg-white p-6 rounded-lg shadow-sm"><h2>Expense Types Placeholder</h2></div>} />
          <Route path="budget-categories" element={<div className="bg-white p-6 rounded-lg shadow-sm"><h2>Budgets Placeholder</h2></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
