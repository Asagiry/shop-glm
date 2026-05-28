import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Cart() {
  const { items, removeItem, updateQuantity, clearCart, total, exportCart, importCart } = useCart();
  const navigate = useNavigate();
  const [importInput, setImportInput] = useState('');
  const [importError, setImportError] = useState('');
  const [exported, setExported] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const handleExport = () => {
    const encoded = exportCart();
    setExported(encoded);
    setShowExport(true);
  };

  const handleImport = () => {
    try {
      importCart(importInput);
      setImportInput('');
      setImportError('');
      setShowImport(false);
    } catch {
      setImportError('Invalid cart data. Please check the string.');
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-dark-700 mb-4">Your cart is empty</h2>
        <div className="flex justify-center gap-4 mb-8">
          <button onClick={() => setShowExport(!showExport)} className="btn-outline text-sm">{showExport ? 'Hide Export' : 'Export Cart'}</button>
          <button onClick={() => setShowImport(!showImport)} className="btn-outline text-sm">{showImport ? 'Hide Import' : 'Import Cart'}</button>
        </div>
        {showImport && (
          <div className="max-w-md mx-auto card p-4">
            <input type="text" value={importInput} onChange={e => setImportInput(e.target.value)} placeholder="Paste base64 cart string..." className="input-field mb-2" />
            {importError && <p className="text-red-500 text-sm mb-2">{importError}</p>}
            <button onClick={handleImport} className="btn-primary w-full">Import</button>
          </div>
        )}
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Browse Products</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-dark-800 mb-8">Shopping Cart</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-4">
          {items.map(item => (
            <div key={`${item.productId}-${item.size}`} className="card p-4 flex items-center gap-4">
              <img src={item.imageUrl} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
              <div className="flex-1">
                <h3 className="font-semibold text-dark-800">{item.name}</h3>
                <p className="text-dark-400 text-sm">Size: {item.size}</p>
                <p className="text-accent-600 font-bold">${item.price.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)} className="w-8 h-8 rounded bg-dark-100 text-dark-600 cursor-pointer border-none flex items-center justify-center">-</button>
                <span className="font-medium w-8 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)} className="w-8 h-8 rounded bg-dark-100 text-dark-600 cursor-pointer border-none flex items-center justify-center">+</button>
              </div>
              <p className="font-bold text-dark-800 w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
              <button onClick={() => removeItem(item.productId, item.size)} className="text-red-400 hover:text-red-600 cursor-pointer border-none bg-transparent text-xl">&times;</button>
            </div>
          ))}
        </div>
        <div className="w-full lg:w-64 space-y-4">
          <div className="card p-4">
            <div className="flex justify-between mb-2"><span className="text-dark-500">Subtotal</span><span className="font-bold">${total.toFixed(2)}</span></div>
            <div className="border-t border-dark-100 my-3"></div>
            <button onClick={() => navigate('/checkout')} className="btn-accent w-full mb-2">Proceed to Checkout</button>
            <button onClick={clearCart} className="btn-outline w-full text-sm !py-1.5">Clear Cart</button>
          </div>
          <div className="card p-4 space-y-2">
            <button onClick={handleExport} className="btn-outline w-full text-sm !py-1.5">Export Cart</button>
            <button onClick={() => setShowImport(!showImport)} className="btn-outline w-full text-sm !py-1.5">Import Cart</button>
            {showExport && exported && (
              <textarea value={exported} readOnly className="input-field text-xs h-20" onClick={e => (e.target as HTMLTextAreaElement).select()} />
            )}
            {showImport && (
              <div>
                <input type="text" value={importInput} onChange={e => setImportInput(e.target.value)} placeholder="Paste cart string..." className="input-field text-sm mb-1" />
                {importError && <p className="text-red-500 text-xs mb-1">{importError}</p>}
                <button onClick={handleImport} className="btn-primary w-full text-sm !py-1">Import</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;