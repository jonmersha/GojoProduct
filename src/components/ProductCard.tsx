import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Tag, Eye, EyeOff } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  isOwner?: boolean;
  onAddToCart?: (product: Product) => void;
  onToggleAvailability?: (productId: string, currentStatus: boolean) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  isOwner, 
  onAddToCart, 
  onToggleAvailability 
}) => {
  const { t } = useLanguage();
  const isAvailable = product.availability !== false;

  return (
    <div className={`bg-white rounded-3xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 group ${!isAvailable ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="aspect-[4/5] bg-stone-50 relative overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <Tag size={48} strokeWidth={1} />
          </div>
        )}
        
        <div className="absolute top-4 left-4">
          <span className="text-[9px] uppercase tracking-[0.2em] text-white font-bold bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg whitespace-nowrap">
            {t(product.category as any) || product.category}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-bold text-stone-900 shadow-xl border border-white/20">
          ${product.price.toFixed(2)}
        </div>
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 px-5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] text-stone-900 shadow-2xl">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h3 className="font-serif italic text-2xl text-stone-900 leading-tight">{product.name}</h3>
          <p className="text-stone-400 text-xs line-clamp-2 leading-relaxed font-medium">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center gap-3 pt-4 border-t border-stone-50">
          <div className="w-9 h-9 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 text-xs font-bold border border-stone-100 group-hover:border-stone-200 transition-colors">
            {product.seller_name?.[0] || 'S'}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase text-stone-400 font-bold tracking-widest">Artisan</span>
            <span className="text-xs text-stone-700 font-bold">{product.seller_name || 'Seller'}</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => onToggleAvailability?.(product.id, isAvailable)}
                className={`p-2.5 rounded-xl transition-all ${
                  isAvailable 
                    ? 'text-stone-400 hover:text-stone-900 hover:bg-stone-50' 
                    : 'text-stone-900 bg-stone-50'
                }`}
                title={isAvailable ? 'Disable product' : 'Enable product'}
              >
                {isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
            
            <button 
              onClick={() => isAvailable && onAddToCart?.(product)}
              disabled={!isAvailable}
              className={`p-3.5 rounded-2xl transition-all active:scale-90 ${
                isAvailable 
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/10' 
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              }`}
            >
              <ShoppingCart size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
