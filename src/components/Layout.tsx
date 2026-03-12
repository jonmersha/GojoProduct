import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, MessageSquare, User, Package, Truck, Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Language } from '../translations';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { icon: Home, label: t('home'), path: '/' },
    { icon: ShoppingBag, label: t('orders'), path: '/orders' },
    { icon: Package, label: t('sell'), path: '/seller' },
    { icon: MessageSquare, label: t('chat'), path: '/chat' },
    { icon: User, label: t('profile'), path: '/profile' },
  ];

  if (user?.role === 'delivery') {
    navItems.splice(1, 1, { icon: Truck, label: t('deliveries'), path: '/delivery' });
  }

  const languages: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'am', label: 'አማርኛ' },
    { id: 'om', label: 'Oromoo' },
    { id: 'ti', label: 'ትግርኛ' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <NavLink to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gojo-green rounded-lg flex items-center justify-center text-white font-bold shadow-md">G</div>
                <h1 className="text-xl font-serif italic text-stone-900 font-bold tracking-tight hidden sm:block">{t('appName')}</h1>
              </NavLink>

              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2",
                        isActive 
                          ? "text-gojo-green bg-gojo-green/5" 
                          : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                      )}
                    >
                      <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                      {item.label}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-stone-100 transition-colors text-stone-600"
                >
                  <Globe size={18} />
                  <span className="text-[10px] font-bold uppercase hidden sm:inline">{language}</span>
                  <ChevronDown size={14} className={cn("transition-transform", showLangMenu && "rotate-180")} />
                </button>
                
                {showLangMenu && (
                  <div className="absolute right-0 mt-2 w-32 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          setLanguage(lang.id);
                          setShowLangMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-medium hover:bg-stone-50 transition-colors",
                          language === lang.id ? "text-gojo-green bg-gojo-green/5 font-bold" : "text-stone-600"
                        )}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {user ? (
                <NavLink to="/profile" className="flex items-center gap-2 pl-2 border-l border-stone-100">
                  <div className="w-8 h-8 rounded-full bg-gojo-yellow flex items-center justify-center text-stone-800 font-bold text-sm shadow-inner">
                    {user.name?.[0] || 'U'}
                  </div>
                  <span className="text-xs font-bold text-stone-700 hidden lg:block">{user.name}</span>
                </NavLink>
              ) : (
                <NavLink to="/login" className="text-xs font-bold uppercase tracking-widest text-gojo-green hover:text-gojo-green/80 transition-colors">
                  {t('signIn')}
                </NavLink>
              )}

              {/* Mobile menu button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
              >
                <ChevronDown size={24} className={cn("transition-transform", isMenuOpen && "rotate-180")} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white animate-in slide-in-from-top duration-300">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all",
                      isActive 
                        ? "text-gojo-green bg-gojo-green/5" 
                        : "text-stone-500 hover:text-stone-900 hover:bg-stone-50"
                    )}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {children}
      </main>

      <footer className="bg-white border-t border-stone-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">
            © 2026 {t('appName')} — Homemade with Love
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
