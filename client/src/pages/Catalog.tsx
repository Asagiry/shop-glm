import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { api } from '../api/client';

interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
  description: string;
  sizes: string;
  stock: number;
}

function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.products.categories().then(setCategories);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory) params.set('category', selectedCategory);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (search) params.set('search', search);
    if (sort) params.set('sort', sort);
    params.set('page', String(page));
    api.products.list(params.toString()).then(data => {
      setProducts(data.products);
      setTotal(data.total);
    });
  }, [selectedCategory, minPrice, maxPrice, search, sort, page]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-dark-800 mb-2">Indie Game Merchandise</h1>
        <p className="text-dark-400">Discover unique apparel and posters from your favorite indie games</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-64 space-y-4">
          <div className="card p-4">
            <h3 className="font-semibold text-dark-700 mb-3">Search</h3>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="input-field" />
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-dark-700 mb-3">Category</h3>
            <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className="input-field">
              <option value="">All Categories</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-dark-700 mb-3">Price Range</h3>
            <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="input-field mb-2" />
            <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="input-field" />
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-dark-700 mb-3">Sort By</h3>
            <select value={sort} onChange={e => setSort(e.target.value)} className="input-field">
              <option value="">Newest</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => <ProductCard key={p.id} {...p} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)} className={`px-3 py-1 rounded ${p === page ? 'bg-primary-600 text-white' : 'bg-dark-100 text-dark-600 hover:bg-dark-200'} transition-colors cursor-pointer`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalog;