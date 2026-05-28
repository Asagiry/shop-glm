import React from 'react';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
}

function ProductCard({ id, name, price, imageUrl, category, stock }: ProductCardProps) {
  return (
    <Link to={`/product/${id}`} className="card group no-underline">
      <div className="relative overflow-hidden">
        <img src={imageUrl} alt={name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500" />
        {stock <= 0 && (
          <div className="absolute inset-0 bg-dark-900/70 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        <span className="absolute top-3 left-3 badge badge-new bg-primary-100 text-primary-800">{category}</span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-dark-800 group-hover:text-primary-600 transition-colors">{name}</h3>
        <p className="text-accent-600 font-bold text-lg mt-1">${price.toFixed(2)}</p>
      </div>
    </Link>
  );
}

export default ProductCard;