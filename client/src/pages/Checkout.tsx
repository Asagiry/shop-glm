import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

function Checkout() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name || '');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setLoading(true);
    setError('');

    try {
      await api.orders.create({
        items: items.map(i => ({ productId: i.productId, size: i.size, quantity: i.quantity })),
        name, address, phone, paymentMethod,
      });
      clearCart();
      navigate('/profile');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-dark-700">Cart is empty</h2><button onClick={() => navigate('/')} className="btn-primary mt-4">Browse Products</button></div>;
  }

  if (!user) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center"><h2 className="text-2xl font-bold text-dark-700">Please login to checkout</h2><button onClick={() => navigate('/login')} className="btn-primary mt-4">Login</button></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-800 mb-8">Checkout</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <form onSubmit={handleSubmit} className="flex-1 space-y-4 card p-6">
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Address</label>
            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="input-field" required />
          </div>
          <div>
            <label className="block font-semibold text-dark-700 mb-1">Payment Method</label>
            <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="input-field">
              <option value="card">Credit Card (Mock)</option>
              <option value="paypal">PayPal (Mock)</option>
              <option value="crypto">Cryptocurrency (Mock)</option>
            </select>
          </div>
          {error && <p className="text-red-500 font-medium">{error}</p>}
          <button type="submit" disabled={loading} className="btn-accent w-full">{loading ? 'Processing...' : 'Place Order'}</button>
        </form>
        <div className="w-full lg:w-64">
          <div className="card p-4">
            <h3 className="font-semibold text-dark-700 mb-3">Order Summary</h3>
            {items.map(i => (
              <div key={`${i.productId}-${i.size}`} className="flex justify-between text-sm mb-1">
                <span className="text-dark-500">{i.name} ({i.size}) x{i.quantity}</span>
                <span className="font-medium">${(i.price * i.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-dark-100 my-3"></div>
            <div className="flex justify-between font-bold"><span>Total</span><span>${total.toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;