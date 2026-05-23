import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import { SEED_PRODUCTS } from '../services/seed';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/Skeleton';
import SEO from '../components/SEO';
import { SlidersHorizontal, Search, RotateCcw } from 'lucide-react';
import { SORT_OPTIONS } from '../utils/constants';
import { useCategories } from '../context/CategoryContext';
import { formatPrice } from '../utils/formatters';

const Shop = () => {
  const { categories } = useCategories();
  const { categorySlug } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQ = searchParams.get('q') || ''; // Standardize query parameter key to 'q'

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(categorySlug || 'all');
  const [sortBy, setSortBy] = useState('featured');
  const [priceRange, setPriceRange] = useState(2500);
  const [searchVal, setSearchVal] = useState(searchQ);

  // Sync category selected if URL changes
  useEffect(() => {
    setSelectedCategory(categorySlug || 'all');
  }, [categorySlug]);

  // Sync search input if URL query changes
  useEffect(() => {
    setSearchVal(searchQ);
  }, [searchQ]);

  useEffect(() => {
    const fetchShopProducts = async () => {
      setLoading(true);
      try {
        // Fetch all products matching category and sort via service
        const result = await getProducts({
          category: selectedCategory,
          sort: sortBy,
          pageSize: 100 // Fetch a larger batch for client-side search & range filtering
        });
        
        if (result.products.length === 0) {
          // Fallback to local seed products if db is empty
          const fallback = SEED_PRODUCTS.map((p, idx) => ({ ...p, id: `demo-${idx}` }));
          setProducts(fallback);
        } else {
          setProducts(result.products);
        }
      } catch (error) {
        console.warn("Error in Shop, falling back to seed data:", error);
        const fallback = SEED_PRODUCTS.map((p, idx) => ({ ...p, id: `demo-${idx}` }));
        setProducts(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchShopProducts();
  }, [selectedCategory, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(searchVal.trim() ? { q: searchVal.trim() } : {});
  };

  const handleReset = () => {
    setSearchVal('');
    setSearchParams({});
    setSelectedCategory('all');
    setPriceRange(2500);
    setSortBy('featured');
  };

  // Filter and sort items locally
  const filteredProducts = products
    .filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchesSearch = !searchQ || 
        item.name.toLowerCase().includes(searchQ.toLowerCase()) || 
        (item.description && item.description.toLowerCase().includes(searchQ.toLowerCase()));
      const matchesPrice = item.price <= priceRange;

      return matchesCategory && matchesSearch && matchesPrice;
    });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO 
        title={selectedCategory === 'all' ? 'Shop All Gifts' : `Shop ${selectedCategory.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`}
        description="Filter products, select customized engraving text, order direct to WhatsApp or secure COD. Beautifully packaged items."
      />

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Filter Side Panel - Desktop */}
        <aside className="w-full md:w-64 flex-shrink-0 bg-white rounded-2xl p-6 border border-brand-100/50 shadow-soft h-fit sticky top-24 hidden md:block">
          <div className="flex items-center justify-between border-b border-brand-50 pb-4 mb-6">
            <span className="font-bold text-pastel-navy flex items-center gap-1.5">
              <SlidersHorizontal size={16} /> Filters
            </span>
            <button 
              onClick={handleReset}
              className="text-xs font-semibold text-brand-500 hover:text-brand-600 flex items-center gap-1 focus:outline-none"
            >
              <RotateCcw size={12} /> Reset
            </button>
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Categories</h3>
            <div className="space-y-2 text-sm">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`block w-full text-left py-1 hover:text-brand-500 transition-colors font-medium ${selectedCategory === 'all' ? 'text-brand-500 pl-1 border-l-2 border-brand-500' : 'text-pastel-navy'}`}
              >
                All Gifts
              </button>
              {categories.map(cat => (
                <button
                  key={cat.slug}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`block w-full text-left py-1 hover:text-brand-500 transition-colors font-medium ${selectedCategory === cat.slug ? 'text-brand-500 pl-1 border-l-2 border-brand-500' : 'text-pastel-navy'}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range */}
          <div className="mb-6 border-t border-brand-50 pt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400">Max Price</h3>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
                {formatPrice(priceRange)}
              </span>
            </div>
            <input
              type="range"
              min="200"
              max="3000"
              step="50"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-500 h-1 bg-brand-100 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
              <span>₹200</span>
              <span>₹3,000</span>
            </div>
          </div>

          {/* Sort Selection */}
          <div className="border-t border-brand-50 pt-6">
            <h3 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Sort By</h3>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-pastel-pink/50 text-sm border border-brand-100 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-brand-300"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </aside>

        {/* Catalog Main section */}
        <section className="flex-grow">
          {/* Header & Controls bar */}
          <div className="bg-white border border-brand-100/50 rounded-2xl p-4 md:p-6 mb-6 shadow-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-extrabold text-pastel-navy">
                {selectedCategory === 'all' 
                  ? 'All Gifts Catalog' 
                  : categories.find(c => c.slug === selectedCategory)?.label || 'Category Shop'}
              </h2>
              <p className="text-xs text-gray-400 font-medium mt-1">
                Showing {filteredProducts.length} cute results
              </p>
            </div>
            
            {/* Mobile Filters and Search bar */}
            <div className="flex flex-wrap items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="relative flex-grow sm:flex-grow-0">
                <input
                  type="text"
                  placeholder="Filter name..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="bg-pastel-pink/50 text-xs border border-brand-100 rounded-full pl-4 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:bg-white"
                />
                <button type="submit" className="absolute right-2.5 top-2.5 text-brand-500">
                  <Search size={14} />
                </button>
              </form>

              {/* Mobile Filter select details */}
              <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="md:hidden flex-grow bg-pastel-pink/50 text-xs border border-brand-100 rounded-full py-2 px-3 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.label}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex-grow bg-pastel-pink/50 text-xs border border-brand-100 rounded-full py-2 px-3 focus:outline-none"
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {Array(6).fill(0).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-brand-100/50 shadow-soft">
              <span className="text-4xl">🔎</span>
              <h3 className="mt-4 text-lg font-bold text-pastel-navy">No products found</h3>
              <p className="text-gray-400 text-sm mt-2">Try adjusting your filters or search keywords.</p>
              <button
                onClick={handleReset}
                className="mt-6 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-soft focus:outline-none"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
