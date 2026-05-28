import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-dark-800 mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full">Login</button>
        </form>
        <div className="text-center mt-4 space-y-2">
          <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 no-underline text-sm">Forgot Password?</Link>
          <p className="text-dark-400 text-sm">Don't have an account? <Link to="/register" className="text-primary-600 hover:text-primary-700 no-underline">Sign Up</Link></p>
        </div>
        <div className="border-t border-dark-100 my-4"></div>
        <div className="text-center text-sm text-dark-400">
          <p>Admin: <strong>admin@shop.com</strong> / <strong>admin</strong></p>
          <p>User: <strong>john@example.com</strong> / <strong>user123</strong></p>
        </div>
      </div>
    </div>
  );
}

export default Login;