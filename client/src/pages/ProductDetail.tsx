import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useCart } from '../contexts/CartContext';

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

function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (id) api.products.get(Number(id)).then(setProduct);
  }, [id]);

  useEffect(() => {
    if (product?.sizes) setSelectedSize(product.sizes.split(',')[0]);
  }, [product]);

  if (!product) return <div className="max-w-7xl mx-auto px-4 py-16 text-center text-dark-400">Loading...</div>;

  const sizes = product.sizes.split(',');

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      size: selectedSize,
      quantity,
      stock: product.stock,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-dark-400 hover:text-dark-700 mb-6 flex items-center gap-1 bg-transparent border-none cursor-pointer font-medium">
        &larr; Back to catalog
      </button>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <img src={product.imageUrl} alt={product.name} className="w-full rounded-xl shadow-lg" />
        </div>
        <div className="w-full md:w-1/2 space-y-6">
          <span className="badge badge-new bg-primary-100 text-primary-800">{product.category}</span>
          <h1 className="text-3xl font-bold text-dark-800">{product.name}</h1>
          <p className="text-dark-500 leading-relaxed">{product.description}</p>
          <p className="text-3xl font-bold text-accent-600">${product.price.toFixed(2)}</p>
          {product.stock <= 0 ? (
            <div className="text-red-500 font-semibold">Out of Stock</div>
          ) : (
            <div className="text-green-600 font-medium">In Stock ({product.stock} available)</div>
          )}
          {product.stock > 0 && (
            <div className="space-y-4">
              <div>
                <label className="block font-semibold text-dark-700 mb-2">Size</label>
                <div className="flex gap-2">
                  {sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)} className={`px-4 py-2 rounded-lg border-2 cursor-pointer transition-all ${selectedSize === s ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-dark-200 text-dark-500 hover:border-dark-400'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-semibold text-dark-700 mb-2">Quantity</label>
                <input type="number" min={1} max={product.stock} value={quantity} onChange={e => setQuantity(Math.max(1, Number(e.target.value)))} className="input-field w-20" />
              </div>
              <button onClick={handleAddToCart} className="btn-accent w-full" disabled={product.stock <= 0}>
                {added ? 'Added to Cart!' : 'Add to Cart'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;