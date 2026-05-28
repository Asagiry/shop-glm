import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const data = await api.auth.forgotPassword(email);
      setToken(data.token);
      setMessage('Reset token generated. Use the link below to reset your password.');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-dark-800 mb-6 text-center">Forgot Password</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {!token ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-semibold text-dark-700 mb-1">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input-field" required />
            </div>
            <button type="submit" className="btn-primary w-full">Request Reset</button>
          </form>
        ) : (
          <div className="text-center">
            <Link to={`/reset-password/${token}`} className="btn-accent no-underline">Go to Reset Password</Link>
          </div>
        )}
        <p className="text-center text-dark-400 text-sm mt-4"><Link to="/login" className="text-primary-600 no-underline">Back to Login</Link></p>
      </div>
    </div>
  );
}

export default ForgotPassword;