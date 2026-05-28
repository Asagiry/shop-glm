import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  sizes: string;
  imageUrl: string;
  stock: number;
}

interface OrderItem {
  id: number;
  product: { id: number; name: string; imageUrl: string };
  size: string;
  quantity: number;
  price: number;
}

interface AdminOrder {
  id: number;
  name: string;
  address: string;
  phone: string;
  paymentMethod: string;
  status: string;
  total: number;
  createdAt: string;
  user: { id: number; name: string; email: string };
  items: OrderItem[];
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', category: 'T-Shirts', sizes: 'S,M,L,XL', stock: '', imageUrl: '' });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/login');
  }, [user, isAdmin, loading]);

  useEffect(() => {
    if (isAdmin) {
      api.admin.products().then(setProducts);
      api.admin.orders().then(setOrders);
    }
  }, [isAdmin]);

  const resetForm = () => setFormData({ name: '', description: '', price: '', category: 'T-Shirts', sizes: 'S,M,L,XL', stock: '', imageUrl: '' });
  const startEdit = (p: Product) => {
    setEditProduct(p);
    setFormData({ name: p.name, description: p.description, price: String(p.price), category: p.category, sizes: p.sizes, stock: String(p.stock), imageUrl: p.imageUrl });
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(formData).forEach(([k, v]) => fd.append(k, v));
    const created = await api.admin.createProduct(fd);
    setProducts(prev => [...prev, created]);
    resetForm();
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    const updated = await api.admin.updateProduct(editProduct.id, {
      name: formData.name, description: formData.description, price: Number(formData.price),
      category: formData.category, sizes: formData.sizes, stock: Number(formData.stock), imageUrl: formData.imageUrl,
    });
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    setEditProduct(null);
    resetForm();
  };

  const handleDeleteProduct = async (id: number) => {
    await api.admin.deleteProduct(id);
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleStatusChange = async (orderId: number, status: string) => {
    const updated = await api.admin.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
  };

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-dark-400">Loading...</div>;
  if (!isAdmin) return null;

  const statusBadge = (status: string) => {
    const map: Record<string, string> = { New: 'badge-new', Confirmed: 'badge-confirmed', Shipped: 'badge-shipped', Delivered: 'badge-delivered' };
    return map[status] || 'badge-new';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-800 mb-6">Admin Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('products')} className={tab === 'products' ? 'btn-primary' : 'btn-outline'}>Products</button>
        <button onClick={() => setTab('orders')} className={tab === 'orders' ? 'btn-primary' : 'btn-outline'}>Orders</button>
      </div>

      {tab === 'products' && (
        <div>
          <div className="card p-6 mb-8">
            <h2 className="font-semibold text-dark-700 mb-4">{editProduct ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={editProduct ? handleUpdateProduct : handleCreateProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="block font-medium text-dark-600 mb-1">Name</label><input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" required /></div>
              <div><label className="block font-medium text-dark-600 mb-1">Price</label><input type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="input-field" required /></div>
              <div className="md:col-span-2"><label className="block font-medium text-dark-600 mb-1">Description</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field" rows={3} required /></div>
              <div><label className="block font-medium text-dark-600 mb-1">Category</label><select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field"><option>T-Shirts</option><option>Posters</option></select></div>
              <div><label className="block font-medium text-dark-600 mb-1">Sizes (comma-separated)</label><input value={formData.sizes} onChange={e => setFormData({...formData, sizes: e.target.value})} className="input-field" required /></div>
              <div><label className="block font-medium text-dark-600 mb-1">Stock</label><input type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="input-field" required /></div>
              <div><label className="block font-medium text-dark-600 mb-1">Image URL</label><input value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="input-field" placeholder="External URL or leave blank" /></div>
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" className="btn-accent">{editProduct ? 'Update' : 'Create'} Product</button>
                {editProduct && <button type="button" onClick={() => { setEditProduct(null); resetForm(); }} className="btn-outline">Cancel</button>}
              </div>
            </form>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map(p => (
              <div key={p.id} className="card p-4">
                <img src={p.imageUrl} alt={p.name} className="w-full h-32 object-cover rounded mb-2" />
                <h3 className="font-semibold text-dark-800">{p.name}</h3>
                <p className="text-accent-600 font-bold">${p.price.toFixed(2)}</p>
                <p className="text-dark-400 text-sm">Stock: {p.stock} | Sizes: {p.sizes}</p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => startEdit(p)} className="btn-outline text-sm !py-1 !px-3">Edit</button>
                  <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm cursor-pointer border-none">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'orders' && (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="card p-6">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">Order #{o.id}</span>
                  <span className={`badge ${statusBadge(o.status)}`}>{o.status}</span>
                </div>
                <span className="text-dark-400 text-sm">{new Date(o.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-dark-600 text-sm mb-2">Customer: {o.user?.name} ({o.user?.email})</p>
              <div className="text-sm text-dark-400 mb-2">{o.name} | {o.address} | {o.phone}</div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-dark-400">Status:</span>
                <select value={o.status} onChange={e => handleStatusChange(o.id, e.target.value)} className="input-field !w-auto !py-1 text-sm">
                  <option>New</option><option>Confirmed</option><option>Shipped</option><option>Delivered</option>
                </select>
              </div>
              <div className="flex items-center gap-4">
                {o.items.map(item => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <img src={item.product.imageUrl} alt={item.product.name} className="w-8 h-8 rounded" />
                    <span>{item.product.name} ({item.size}) x{item.quantity}</span>
                  </div>
                ))}
                <span className="font-bold text-accent-600 ml-auto">${o.total.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Admin;