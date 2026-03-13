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
    <div className={`bg-white rounded-[2rem] border border-stone-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group ${!isAvailable ? 'opacity-60 grayscale-[0.5]' : ''}`}>
      <div className="aspect-square bg-stone-50 relative overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-stone-200">
            <Tag size={64} strokeWidth={1} />
          </div>
        )}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-2xl text-sm font-bold text-stone-900 shadow-lg border border-white/20">
          ${product.price.toFixed(2)}
        </div>
        
        {!isAvailable && (
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-white/90 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-900 shadow-xl">
              Unavailable
            </span>
          </div>
        )}
      </div>
      
      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif italic text-xl text-stone-900 leading-tight font-bold">{product.name}</h3>
          <span className="text-[9px] uppercase tracking-widest text-gojo-green font-bold bg-gojo-green/10 px-2.5 py-1 rounded-full whitespace-nowrap">
            {t(product.category as any) || product.category}
          </span>
        </div>
        
        <p className="text-stone-500 text-sm line-clamp-2 leading-relaxed font-medium">
          {product.description}
        </p>
        
        <div className="flex items-center gap-3 mt-2 pt-4 border-t border-stone-50">
          <div className="w-8 h-8 rounded-full bg-gojo-yellow/20 flex items-center justify-center text-stone-800 text-xs font-bold border border-gojo-yellow/30">
            {product.seller_name?.[0] || 'S'}
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase text-stone-400 font-bold tracking-tighter">Seller</span>
            <span className="text-xs text-stone-700 font-bold">{product.seller_name || 'Seller'}</span>
          </div>
          
          <div className="ml-auto flex items-center gap-2">
            {isOwner && (
              <button
                onClick={() => onToggleAvailability?.(product.id, isAvailable)}
                className={`p-2.5 rounded-xl transition-all shadow-sm ${
                  isAvailable 
                    ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
                title={isAvailable ? 'Disable product' : 'Enable product'}
              >
                {isAvailable ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            )}
            
            <button 
              onClick={() => isAvailable && onAddToCart?.(product)}
              disabled={!isAvailable}
              className={`p-3 rounded-2xl transition-all shadow-md active:scale-90 ${
                isAvailable 
                  ? 'bg-stone-900 text-white hover:bg-gojo-green' 
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
