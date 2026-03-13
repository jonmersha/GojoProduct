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
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h2 className="text-3xl font-serif italic font-bold text-stone-900">My Store</h2>
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Manage your homemade products</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-stone-900 text-white p-4 rounded-2xl shadow-xl hover:bg-stone-800 transition-all active:scale-95"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <div key={product.id} className="bg-white p-5 rounded-3xl border border-stone-100 flex flex-col gap-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group">
            <div className="w-full aspect-square bg-stone-50 rounded-2xl overflow-hidden flex-shrink-0 relative">
              {product.image ? (
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" referrerPolicy="no-referrer" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-200">
                  <ImageIcon size={48} strokeWidth={1} />
                </div>
              )}
              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl text-stone-400 hover:text-stone-900 transition-colors shadow-lg border border-white/20"><Edit3 size={18} /></button>
                <button 
                  onClick={() => handleDeleteProduct(product.id)}
                  className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl text-stone-400 hover:text-red-500 transition-colors shadow-lg border border-white/20"
                >
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-stone-900 shadow-lg border border-white/20">
                ${product.price.toFixed(2)}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <h3 className="font-serif italic text-2xl text-stone-900 leading-tight">{product.name}</h3>
                <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed font-medium">{product.description}</p>
              </div>
              <div className="mt-auto pt-4 border-t border-stone-50">
                <span className="text-[9px] uppercase tracking-[0.2em] text-stone-400 font-bold bg-stone-50 px-3 py-1 rounded-lg">
                  {product.category}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-6 mt-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-stone-400">Available Delivery Partners</h3>
          <p className="font-serif italic text-xl text-stone-900">Logistics Network</p>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide -mx-4 px-4">
          {deliveryPartners.map((partner) => (
            <div key={partner.id} className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm flex flex-col gap-4 min-w-[240px] hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-100">
                  <Truck size={24} strokeWidth={1.5} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-stone-900">{partner.name}</span>
                  <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">{partner.vehicleType || 'Courier'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-stone-50">
                <div className="flex items-center gap-1.5 text-gojo-yellow">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold text-stone-900">{partner.rating || '5.0'}</span>
                </div>
                <button className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 hover:bg-stone-50 px-3 py-2 rounded-lg transition-colors">
                  Contact
                </button>
              </div>
            </div>
          ))}
          {deliveryPartners.length === 0 && (
            <div className="w-full py-12 flex flex-col items-center justify-center text-stone-300 gap-4 bg-white rounded-3xl border border-stone-100 border-dashed">
              <Truck size={32} strokeWidth={1} />
              <p className="text-xs font-bold uppercase tracking-widest">No delivery partners available</p>
            </div>
          )}
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-[2.5rem] sm:rounded-[2.5rem] p-10 flex flex-col gap-8 animate-in slide-in-from-bottom duration-500">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-serif italic font-bold text-stone-900">Add Product</h3>
                <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">List your creation</p>
              </div>
              <button onClick={() => setIsAdding(false)} className="w-10 h-10 rounded-full hover:bg-stone-50 flex items-center justify-center text-stone-400 hover:text-stone-900 transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Visual Representation</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-video bg-stone-50 border-2 border-dashed border-stone-100 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-stone-900 transition-all overflow-hidden group relative"
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
                      <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-stone-300 shadow-sm group-hover:scale-110 transition-transform duration-500">
                        <Upload size={24} strokeWidth={1.5} />
                      </div>
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">
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
                <div className="flex items-center gap-3 px-1">
                  <div className="h-[1px] flex-1 bg-stone-100"></div>
                  <span className="text-[9px] font-bold text-stone-300 uppercase tracking-widest">or use URL</span>
                  <div className="h-[1px] flex-1 bg-stone-100"></div>
                </div>
                <input 
                  type="url" 
                  placeholder="Paste image URL" 
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                  value={newProduct.image.startsWith('data:') ? '' : newProduct.image}
                  onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                />
              </div>

              <div className="flex flex-col gap-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400 ml-1">Product Specifications</label>
                <input 
                  type="text" 
                  placeholder="Product Name" 
                  required
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                />
                <textarea 
                  placeholder="Description" 
                  rows={3}
                  className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all resize-none"
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                    <input 
                      type="number" 
                      step="0.01"
                      placeholder="0.00" 
                      required
                      className="w-full bg-white border border-stone-200 rounded-xl pl-10 pr-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                    />
                  </div>
                  <select 
                    className="w-full bg-white border border-stone-200 rounded-xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-stone-900/5 focus:border-stone-900 transition-all appearance-none"
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
                className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-2xl mt-2 disabled:opacity-50 active:scale-[0.98]"
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
