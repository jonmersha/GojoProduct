import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, Order } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, Coffee, Utensils, Shirt, Palette, Home as HomeIcon, X, MapPin, ShoppingBag } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, onSnapshot, orderBy, updateDoc, doc } from 'firebase/firestore';

const Home: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const categories = [
    { id: 'all', label: t('all'), icon: HomeIcon },
    { id: 'food', label: t('food'), icon: Utensils },
    { id: 'drinks', label: t('drinks'), icon: Coffee },
    { id: 'clothing', label: t('clothing'), icon: Shirt },
    { id: 'crafts', label: t('crafts'), icon: Palette },
  ];

  useEffect(() => {
    setIsLoading(true);
    let q = query(collection(db, 'products'));
    
    if (selectedCategory !== 'all') {
      q = query(collection(db, 'products'), where('category', '==', selectedCategory));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setIsLoading(false);
    }, (error) => {
      console.error('Firestore Error (list products):', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedCategory]);

  const handlePlaceOrder = async () => {
    if (!user || !selectedProduct || !deliveryAddress) return;
    setIsPlacingOrder(true);

    try {
      const orderData = {
        buyer_id: user.id,
        seller_id: selectedProduct.seller_id,
        buyer_name: user.name,
        seller_name: selectedProduct.seller_name || 'Seller',
        items: JSON.stringify([{
          product_id: selectedProduct.id,
          name: selectedProduct.name,
          price: selectedProduct.price,
          quantity: 1
        }]),
        total_amount: selectedProduct.price,
        delivery_address: deliveryAddress,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      setSelectedProduct(null);
      setDeliveryAddress('');
      // Success feedback could be a toast
    } catch (error) {
      console.error('Firestore Error (create order):', error);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleToggleAvailability = async (productId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'products', productId), {
        availability: !currentStatus
      });
    } catch (error) {
      console.error('Firestore Error (toggle availability):', error);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-gojo-green transition-colors" size={20} />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            className="w-full bg-white border-2 border-stone-100 rounded-[1.5rem] pl-12 pr-4 py-4 text-sm focus:outline-none focus:border-gojo-green transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                selectedCategory === cat.id 
                  ? 'bg-stone-900 text-white border-stone-900 shadow-xl scale-105' 
                  : 'bg-white text-stone-500 border-stone-50 hover:border-stone-200'
              }`}
            >
              <cat.icon size={16} />
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[2rem] shadow-sm border border-stone-100 aspect-[4/5] animate-pulse" />
          ))
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              isOwner={user?.id === product.seller_id}
              onAddToCart={(p) => {
                if (!user) {
                  alert(t('loginToOrder'));
                } else {
                  setSelectedProduct(p);
                }
              }}
              onToggleAvailability={handleToggleAvailability}
            />
          ))
        ) : (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-stone-400 gap-6">
            <div className="w-24 h-24 rounded-full bg-stone-100 flex items-center justify-center shadow-inner">
              <Search size={40} className="text-stone-300" />
            </div>
            <div className="text-center flex flex-col gap-1">
              <p className="font-serif italic text-2xl text-stone-900">{t('noProducts')}</p>
              <p className="text-sm font-medium">Try adjusting your search or category</p>
            </div>
          </div>
        )}
      </div>

      {selectedProduct && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-3xl p-8 flex flex-col gap-6 animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif italic font-bold text-stone-900">Checkout</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-400 hover:text-stone-900">
                <X size={24} />
              </button>
            </div>

            <div className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-100">
              <div className="w-16 h-16 bg-white rounded-xl overflow-hidden flex-shrink-0">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-stone-900">{selectedProduct.name}</span>
                <span className="text-sm text-stone-500">${selectedProduct.price.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">Delivery Address</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Enter your address"
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-4 border-t border-stone-100">
              <div className="flex items-center justify-between px-1">
                <span className="text-stone-500 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-stone-900">${selectedProduct.price.toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={!deliveryAddress || isPlacingOrder}
                className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {isPlacingOrder ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
