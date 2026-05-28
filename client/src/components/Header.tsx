import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-dark-800 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-white no-underline">
          <span className="text-2xl font-bold tracking-tight">Vibe Miner</span>
          <span className="text-accent-400 font-medium">Shop</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className="text-dark-200 hover:text-white transition-colors no-underline font-medium">Catalog</Link>
          <Link to="/cart" className="text-dark-200 hover:text-white transition-colors no-underline font-medium flex items-center gap-1">
            Cart
            {items.length > 0 && (
              <span className="bg-accent-500 text-white text-xs px-2 py-0.5 rounded-full">{items.length}</span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Link to="/profile" className="text-dark-200 hover:text-white transition-colors no-underline font-medium">Profile</Link>
              {isAdmin && <Link to="/admin" className="text-accent-400 hover:text-accent-300 no-underline font-medium">Admin</Link>}
              <button onClick={handleLogout} className="text-dark-300 hover:text-white transition-colors font-medium bg-transparent border-none cursor-pointer">Logout</button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-dark-200 hover:text-white transition-colors no-underline font-medium">Login</Link>
              <Link to="/register" className="btn-primary !py-1.5 !px-4 text-sm no-underline">Sign Up</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;