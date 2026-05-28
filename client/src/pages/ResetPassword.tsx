import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.auth.resetPassword(token!, newPassword);
      setMessage('Password updated successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <div className="card p-8">
        <h1 className="text-2xl font-bold text-dark-800 mb-6 text-center">Reset Password</h1>
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-semibold text-dark-700 mb-1">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" required minLength={6} />
          </div>
          <button type="submit" className="btn-primary w-full">Reset Password</button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;