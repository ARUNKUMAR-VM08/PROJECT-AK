import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { Trash2, Edit3, ArrowLeft, Sparkles, UploadCloud, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { db } from '../services/firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import { SEED_PRODUCTS as mockProducts } from '../services/seed';
import { useCategories } from '../context/CategoryContext';
import SEO from '../components/SEO';

const ManageProducts = () => {
  const { categories, loading: categoriesLoading } = useCategories();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImageUrls, setExistingImageUrls] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Form states
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '20',
    isFeatured: false,
    isBestSeller: false,
    customizationPrompt: '',
    imageUrlInput: '',
    deliveryTime: '3–5 Days'
  });

  // Set default category when categories list loads
  useEffect(() => {
    if (categories.length > 0 && !form.category && !editingId) {
      setForm(prev => ({ ...prev, category: categories[0].slug }));
    }
  }, [categories, form.category, editingId]);

  const fetchProductsList = async () => {
    setLoading(true);
    try {
      const productsCol = collection(db, 'products');
      const snap = await getDocs(productsCol);
      let list = [];
      snap.forEach(d => {
        list.push({ id: d.id, ...d.data() });
      });
      if (list.length === 0) {
        setProducts(mockProducts);
      } else {
        setProducts(list);
      }
    } catch (e) {
      console.warn("Could not query Firestore products, using local mock items:", e);
      setProducts(mockProducts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsList();
  }, []);

  const handleChange = (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleImageFileChange = (e) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeSelectedImage = (idxToRemove) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== idxToRemove));
    URL.revokeObjectURL(imagePreviews[idxToRemove]);
    setImagePreviews(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const removeExistingImage = (idxToRemove) => {
    setExistingImageUrls(prev => prev.filter((_, idx) => idx !== idxToRemove));
  };

  const clearSelectedImages = () => {
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImageFiles([]);
    setImagePreviews([]);
  };

  // Clean up object URLs when component unmounts to prevent memory leaks
  useEffect(() => {
    return () => {
      imagePreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.description) {
      toast.error("Please fill in required fields");
      return;
    }

    setUploadingImage(true);
    try {
      let uploadedUrls = [];
      for (let i = 0; i < imageFiles.length; i++) {
        setUploadProgress(Math.round((i * 100) / imageFiles.length));
        const url = await uploadToCloudinary(imageFiles[i], (percent) => {
          const totalPercent = Math.round(((i * 100) + percent) / imageFiles.length);
          setUploadProgress(totalPercent);
        });
        if (url) {
          uploadedUrls.push(url);
        }
      }

      // Check if there are manually inputted image URLs
      let manualUrls = [];
      if (form.imageUrlInput.trim()) {
        manualUrls = form.imageUrlInput
          .split(',')
          .map(url => url.trim())
          .filter(url => url.length > 0);
      }

      // Combine existing (retained) images + newly uploaded + manually typed
      let finalImageUrls = [...existingImageUrls, ...uploadedUrls, ...manualUrls];

      if (finalImageUrls.length === 0) {
        // Fallback placeholder
        finalImageUrls.push('https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=600&auto=format&fit=crop');
      }

      const productData = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        stock: Number(form.stock),
        isFeatured: form.isFeatured,
        isBestSeller: form.isBestSeller,
        customizationPrompt: form.customizationPrompt || '',
        deliveryTime: form.deliveryTime || '3–5 Days',
        imageUrls: finalImageUrls,
        imageUrl: finalImageUrls[0], // fallback for older code referencing single image
        rating: editingId ? (products.find(p => p.id === editingId)?.rating || 4.5) : 4.5,
        createdAt: new Date().toISOString()
      };

      const productsCol = collection(db, 'products');

      if (editingId) {
        const docRef = doc(productsCol, editingId);
        await setDoc(docRef, productData, { merge: true });
        toast.success("Product updated successfully! 📝");
      } else {
        const docRef = await addDoc(productsCol, productData);
        toast.success("Product created successfully! 📦");
      }

      setForm({
        name: '',
        description: '',
        price: '',
        category: categories[0]?.slug || 'customized-gifts',
        stock: '20',
        isFeatured: false,
        isBestSeller: false,
        customizationPrompt: '',
        imageUrlInput: '',
        deliveryTime: '3–5 Days'
      });
      clearSelectedImages();
      setExistingImageUrls([]);
      setEditingId(null);
      fetchProductsList();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save product in Firebase. Check console log.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleEditInit = (product) => {
    setEditingId(product.id);
    clearSelectedImages();
    setExistingImageUrls(product.imageUrls || (product.imageUrl ? [product.imageUrl] : []));
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock || 20,
      isFeatured: product.isFeatured || false,
      isBestSeller: product.isBestSeller || false,
      customizationPrompt: product.customizationPrompt || '',
      imageUrlInput: '',
      deliveryTime: product.deliveryTime || '3–5 Days'
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      const docRef = doc(db, 'products', productId);
      await deleteDoc(docRef);
      toast.success("Product deleted successfully.");
      fetchProductsList();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete product. Enable database rules.");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 page-transition">
      <SEO title="Manage Products" description="Add, edit, delete catalog items and upload photos." />

      <div className="flex items-center gap-3 mb-8">
        <Link to="/admin" className="text-gray-400 hover:text-brand-500">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-black text-pastel-navy">Manage Products Catalog</h1>
          <p className="text-xs text-gray-500">Add custom details, assign categories, and modify pricing</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Add/Edit Product Form */}
        <div className="bg-white border border-brand-100 rounded-3xl p-6 shadow-soft h-fit">
          <h2 className="font-bold text-pastel-navy text-base border-b border-brand-50 pb-3 mb-4">
            {editingId ? 'Edit Product Details' : 'Add New Product'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Product Name *</label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Preserved Rose Hamper"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Description *</label>
              <textarea
                name="description"
                required
                value={form.description}
                onChange={handleChange}
                placeholder="Product descriptions, dimensions, packaging details..."
                rows={4}
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Price (INR) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={form.price}
                  onChange={handleChange}
                  placeholder="699"
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Stock Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  placeholder="20"
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none"
              >
                {categoriesLoading ? (
                  <option>Loading categories...</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.slug} value={cat.slug}>{cat.label}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Estimated Delivery Time *</label>
              <input
                type="text"
                name="deliveryTime"
                required
                value={form.deliveryTime}
                onChange={handleChange}
                placeholder="e.g. 3–5 Days, 1–2 Days"
                className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
            </div>

            {/* Customization Prompt */}
            <div className="space-y-1 border border-brand-100/40 p-3 rounded-2xl bg-pastel-peach/30">
              <label className="text-[10px] font-extrabold text-pastel-navy uppercase tracking-wider block flex items-center gap-1">
                <Sparkles size={12} className="text-brand-500" />
                Customization Prompt (Optional)
              </label>
              <input
                type="text"
                name="customizationPrompt"
                value={form.customizationPrompt}
                onChange={handleChange}
                placeholder="e.g. Enter name to engrave"
                className="w-full bg-white text-xs border border-brand-100 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-300"
              />
              <p className="text-[9px] text-gray-400 mt-1">Leaves a text box on the product details page if set.</p>
            </div>

            {/* Image Files selection / url */}
            <div className="space-y-3">
              {/* Existing Images */}
              {existingImageUrls.length > 0 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Existing Images</label>
                  <div className="grid grid-cols-3 gap-2 border border-brand-100 rounded-2xl bg-pastel-pink/10 p-2.5">
                    {existingImageUrls.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-brand-50 shadow-sm">
                        <img src={url} alt="Existing product" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(idx)}
                          className="absolute top-1 right-1 bg-white/90 hover:bg-white text-pastel-navy hover:text-red-500 p-1 rounded-full shadow transition-all focus:outline-none"
                          title="Remove existing image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Files Preview */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Upload Photo Files</label>
                
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 border border-brand-100 rounded-2xl bg-pastel-pink/10 p-2.5 mb-2">
                    {imagePreviews.map((url, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-white border border-brand-50 shadow-sm">
                        <img src={url} alt="Selected preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeSelectedImage(idx)}
                          className="absolute top-1 right-1 bg-white/90 hover:bg-white text-pastel-navy hover:text-red-500 p-1 rounded-full shadow transition-all focus:outline-none"
                          title="Remove selected image"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <label className="flex flex-col items-center justify-center border-2 border-dashed border-brand-200 hover:border-brand-400 rounded-2xl p-6 bg-pastel-pink/5 cursor-pointer transition-colors group mt-1">
                  <UploadCloud size={24} className="text-brand-400 group-hover:text-brand-600 mb-2 transition-colors" />
                  <span className="text-[11px] font-bold text-pastel-navy group-hover:text-brand-700">Choose image file(s)</span>
                  <span className="text-[9px] text-gray-400 mt-1">PNG, JPG, WebP up to 10MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Progress bar when uploading */}
              {uploadingImage && imageFiles.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-bold text-brand-600">
                    <span className="flex items-center gap-1.5">
                      <Loader2 size={12} className="animate-spin" />
                      Uploading images to Cloudinary...
                    </span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-brand-500 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-brand-50"></div>
                <span className="flex-shrink mx-3 text-[9px] text-gray-400 font-extrabold uppercase">or</span>
                <div className="flex-grow border-t border-brand-50"></div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Photo URLs (Comma-separated, optional)</label>
                <input
                  type="text"
                  name="imageUrlInput"
                  value={form.imageUrlInput}
                  onChange={handleChange}
                  placeholder="https://images.unsplash.com/photo1, https://images.unsplash.com/photo2"
                  className="w-full bg-pastel-pink/30 text-xs border border-brand-100 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-brand-300"
                />
                <p className="text-[9px] text-gray-400 mt-1">Paste multiple image URLs separated by commas.</p>
              </div>
            </div>

            <div className="flex gap-4 py-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                  className="accent-brand-500"
                />
                <span className="font-bold text-pastel-navy">Featured List</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={form.isBestSeller}
                  onChange={handleChange}
                  className="accent-brand-500"
                />
                <span className="font-bold text-pastel-navy">Best Seller</span>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploadingImage}
                className="flex-grow bg-brand-500 hover:bg-brand-600 text-white font-bold py-3 rounded-xl shadow-premium text-xs disabled:opacity-50 focus:outline-none"
              >
                {uploadingImage ? "Saving..." : (editingId ? "Update Product" : "Publish Product")}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setForm({
                      name: '',
                      description: '',
                      price: '',
                      category: categories[0]?.slug || 'customized-gifts',
                      stock: '20',
                      isFeatured: false,
                      isBestSeller: false,
                      customizationPrompt: '',
                      imageUrlInput: '',
                      deliveryTime: '3–5 Days'
                    });
                    clearSelectedImages();
                    setExistingImageUrls([]);
                  }}
                  className="bg-white border border-brand-100 hover:bg-brand-50 text-pastel-navy font-semibold px-4 rounded-xl text-xs focus:outline-none"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Catalog Table view */}
        <div className="lg:col-span-2 bg-white border border-brand-100 rounded-3xl p-6 shadow-soft overflow-hidden h-fit">
          <h2 className="font-bold text-pastel-navy text-base border-b border-brand-50 pb-3 mb-4">Published Items Queue</h2>
          
          {loading ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">Loading items...</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs font-semibold">No items cataloged. Add details to start.</div>
          ) : (
            <div className="divide-y divide-brand-50 max-h-[600px] overflow-y-auto pr-1">
              {products.map(prod => (
                <div key={prod.id} className="py-4 flex gap-4 items-center justify-between">
                  <div className="flex gap-4 items-center min-w-0">
                    <div className="w-10 h-12 bg-pastel-pink/30 rounded-xl overflow-hidden flex-shrink-0 border border-brand-50">
                      <img 
                        src={prod.imageUrls && prod.imageUrls.length > 0 ? prod.imageUrls[0] : (prod.imageUrl || '')} 
                        alt={prod.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-xs text-pastel-navy truncate max-w-[220px]">{prod.name}</h4>
                      <p className="text-[10px] text-gray-400 font-semibold">{prod.category?.replace('-', ' ')} • {formatPrice(prod.price)}</p>
                      <div className="flex gap-1.5 mt-1">
                        {prod.isFeatured && <span className="text-[8px] bg-pastel-peach text-pastel-gold font-bold px-1.5 py-0.5 rounded">Featured</span>}
                        {prod.isBestSeller && <span className="text-[8px] bg-brand-50 text-brand-600 font-bold px-1.5 py-0.5 rounded">Best Seller</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditInit(prod)}
                      className="p-2 text-gray-400 hover:text-brand-500 hover:bg-brand-50 rounded-lg transition-colors focus:outline-none"
                      title="Edit Item"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors focus:outline-none"
                      title="Delete Item"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageProducts;
