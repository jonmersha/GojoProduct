import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { UserRole } from '../types';
import { LogIn, User, ShoppingBag, Truck, Mail, Chrome, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { loginWithGoogle } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>('buyer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    try {
      // Trigger popup as directly as possible to avoid browser blocking
      const loginPromise = loginWithGoogle(role);
      setIsSubmitting(true);
      await loginPromise;
      navigate('/');
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('The sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestBrowse = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-gojo-green/10 via-stone-50 to-gojo-yellow/10">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] border border-stone-200 shadow-2xl p-8 flex flex-col gap-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gojo-green via-gojo-yellow to-primary" />
        
        <div className="text-center flex flex-col gap-2">
          <div className="w-16 h-16 bg-gojo-green rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg rotate-3">G</div>
          <h1 className="text-4xl font-serif italic font-bold text-stone-900 mt-4">{t('appName')}</h1>
          <p className="text-stone-500 text-sm font-medium">{t('tagline')}</p>
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-400 ml-1">{t('chooseRole')}</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'buyer', label: t('buyer'), icon: ShoppingBag, color: 'bg-gojo-green' },
                { id: 'seller', label: t('seller'), icon: User, color: 'bg-gojo-yellow' },
                { id: 'delivery', label: t('delivery'), icon: Truck, color: 'bg-primary' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id as UserRole)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                    role === r.id 
                      ? `border-stone-900 bg-stone-900 text-white shadow-lg scale-105` 
                      : 'bg-white text-stone-500 border-stone-50 hover:border-stone-200'
                  }`}
                >
                  <r.icon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-tighter">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle size={16} />
                {error}
              </div>
            )}
            <button
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full bg-white border-2 border-stone-100 py-4 rounded-2xl font-bold text-stone-700 hover:bg-stone-50 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Chrome size={20} className="text-blue-500" />
              {isSubmitting ? '...' : t('signInWithGoogle')}
            </button>
            
            <button
              type="button"
              onClick={handleGuestBrowse}
              className="w-full bg-transparent text-stone-500 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest hover:text-stone-900 transition-all"
            >
              {t('guestBrowse')}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-stone-400 leading-relaxed px-4">
          By continuing, you agree to Gojo's <span className="underline">Terms</span> and <span className="underline">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
};

export default Login;
