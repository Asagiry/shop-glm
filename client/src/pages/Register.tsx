import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register(email, password, name);
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-dark-800 mb-6 text-center">Sign Up</h1>
        {error && <p className="text-red-500 font-medium mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input-field" required />
          </div>
          <button type="submit" className="btn-primary w-full">Create Account</button>
        </form>
        <p className="text-center text-dark-400 text-sm mt-4">Already have an account? <Link to="/login" className="text-primary-600 no-underline">Login</Link></p>
      </div>
    </div>
  );
}

export default Register;