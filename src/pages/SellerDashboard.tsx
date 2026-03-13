import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Product, User } from '../types';
import { Plus, Package, DollarSign, Trash2, Edit3, Image as ImageIcon, Truck, Star, Upload, X } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';

const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<User[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: 'food',
    image: ''
  });

  useEffect(() => {
    if (user && user.role === 'seller') {
      const q = query(collection(db, 'products'), where('seller_id', '==', user.id));
      const unsubscribeProducts = onSnapshot(q, (snapshot) => {
        setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
      });

      const qPartners = query(collection(db, 'users'), where('role', '==', 'delivery'));
      const unsubscribePartners = onSnapshot(qPartners, (snapshot) => {
        setDeliveryPartners(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as User[]);
      });

      return () => {
        unsubscribeProducts();
        unsubscribePartners();
      };
    }
  }, [user]);

  const handleBecomeSeller = async () => {
    if (!user) return;
    setIsUpgrading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { role: 'seller' });
    } catch (error) {
      console.error('Failed to upgrade to seller:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 500KB for Firestore base64 storage)
    if (file.size > 500 * 1024) {
      alert('Image size must be less than 500KB');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewProduct({ ...newProduct, image: reader.result as string });
      setIsUploading(false);
    };
    reader.onerror = () => {
      console.error('Failed to read file');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  if (user?.role === 'buyer') {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-8 text-center">
        <div className="w-24 h-24 rounded-full bg-gojo-yellow/20 flex items-center justify-center text-stone-800 shadow-inner">
          <Package size={48} strokeWidth={1.5} />
        </div>
        <div className="flex flex-col gap-2 max-w-sm">
          <h2 className="text-3xl font-serif italic font-bold text-stone-900">Start Selling on Gojo</h2>
          <p className="text-stone-500">Turn your homemade goods into a business. Reach your community and grow your store.</p>
        </div>
        <button 
          onClick={handleBecomeSeller}
          disabled={isUpgrading}
          className="bg-stone-900 text-white px-10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl active:scale-95 disabled:opacity-50"
        >
          {isUpgrading ? 'Upgrading...' : 'Become a Seller'}
        </button>
      </div>
    );
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await addDoc(collection(db, 'products'), {
        ...newProduct,
        price: parseFloat(newProduct.price),
        seller_id: user.id,
        seller_name: user.name,
        availability: true,
        created_at: new Date().toISOString()
      });
      setIsAdding(false);
      setNewProduct({ name: '', description: '', price: '', category: 'food', image: '' });
    } catch (error) {
      console.error('Firestore Error (add product):', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      console.error('Firestore Error (delete product):', error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-serif italic font-bold text-stone-900">My Store</h2>
          <p className="text-stone-500 text-sm">Manage your homemade products</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-stone-900 text-white p-3 rounded-2xl shadow-lg hover:bg-stone-800 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-4 rounded-2xl border border-stone-200 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
            <div className="w-full aspect-square bg-stone-100 rounded-xl overflow-hidden flex-shrink-0 relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-300">
                  <ImageIcon size={48} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-stone-400 hover:text-stone-900 transition-colors shadow-sm"><Edit3 size={18} /></button>
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-xl text-stone-400 hover:text-red-500 transition-colors shadow-sm"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <h3 className="font-serif italic font-bold text-stone-900">{product.name}</h3>
                <span className="text-sm font-bold text-stone-900">${product.price.toFixed(2)}</span>
              </div>
              <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{product.description}</p>
              <div className="mt-2">
                <span className="text-[10px] uppercase tracking-widest text-stone-400 font-bold bg-stone-50 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 mt-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Available Delivery Partners</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
          {deliveryPartners.map((partner) => (
            <div key={partner.id} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex flex-col gap-3 min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gojo-green/10 flex items-center justify-center text-gojo-green">
                  <Truck size={20} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900">{partner.name}</span>
                  <span className="text-[10px] text-stone-400 uppercase font-bold">{partner.vehicleType || 'Courier'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-stone-50">
                <div className="flex items-center gap-1 text-gojo-yellow">
                  <Star size={12} fill="currentColor" />
                  <span className="text-xs font-bold text-stone-700">{partner.rating || '5.0'}</span>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-widest text-gojo-green hover:underline">
                  Contact
                </button>
              </div>
            </div>
          ))}
          {deliveryPartners.length === 0 && (
            <p className="text-sm italic text-stone-400 py-4">No delivery partners available right now.</p>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 flex flex-col gap-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif italic font-bold text-stone-900">Add New Product</h3>
              <button onClick={() => setIsAdding(false)} className="text-stone-400 hover:text-stone-900">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Product Image</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-stone-900 transition-all overflow-hidden group relative"
                >
                  {newProduct.image ? (
                    <>
                      <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Upload className="text-white" size={24} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-stone-400 shadow-sm">
                        <Upload size={20} />
                      </div>
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <div className="flex items-center gap-2 px-1">
                  <div className="h-[1px] flex-1 bg-stone-100"></div>
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">or use URL</span>
                  <div className="h-[1px] flex-1 bg-stone-100"></div>
                </div>
                <input 
                  type="url" 
                  placeholder="Paste image URL" 
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                  value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Product Details</label>
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  required
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
                <textarea 
                  placeholder="Description" 
                  rows={3}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="Price" 
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                  />
                  <select 
                    className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/5"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                  >
                    <option value="food">Food</option>
                    <option value="drinks">Drinks</option>
                    <option value="clothing">Clothing</option>
                    <option value="crafts">Crafts</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit"
                disabled={!newProduct.image || isUploading}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-lg mt-2 disabled:opacity-50"
              >
                List Product
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;
