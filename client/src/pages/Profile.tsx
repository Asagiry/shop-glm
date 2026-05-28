import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

interface OrderItem {
  id: number;
  productId: number;
  size: string;
  quantity: number;
  price: number;
  product: { id: number; name: string; imageUrl: string };
}

interface Order {
  id: number;
  name: string;
  address: string;
  phone: string;
  paymentMethod: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!loading && !user) navigate('/login');
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      api.auth.me().then(data => setOrders(data.orders || []));
    }
  }, [user]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-dark-400">Loading...</div>;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { New: 'badge-new', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', Delivered: 'badge-delivered' };
    return map[status] || 'badge-new';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-800 mb-8">My Profile</h1>
      <div className="card p-6 mb-8">
        <h2 className="font-semibold text-dark-700 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><span className="text-dark-400 text-sm">Name</span><p className="font-medium text-dark-800">{user?.name}</p></div>
          <div><span className="text-dark-400 text-sm">Email</span><p className="font-medium text-dark-800">{user?.email}</p></div>
          <div><span className="text-dark-400 text-sm">Role</span><p className="font-medium text-dark-800 capitalize">{user?.role}</p></div>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-dark-800 mb-4">Order History</h2>
      {orders.length === 0 ? (
        <p className="text-dark-400">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="card p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-dark-800">Order #{order.id}</span>
                  <span className={`badge ${statusBadge(order.status)}`}>{order.status}</span>
                </div>
                <span className="text-dark-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                <div><span className="text-dark-400">Name:</span> {order.name}</div>
                <div><span className="text-dark-400">Address:</span> {order.address}</div>
                <div><span className="text-dark-400">Phone:</span> {order.phone}</div>
                <div><span className="text-dark-400">Payment:</span> {order.paymentMethod}</div>
              </div>
              <div className="space-y-2">
                {order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-3 text-sm">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                    <span className="text-dark-600">{item.product.name}</span>
                    <span className="text-dark-400">({item.size}) x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-dark-100 mt-3 pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-accent-600">${order.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Profile;