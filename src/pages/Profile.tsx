import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { User, UserCircle, Mail, Phone, MapPin, Store, Truck, Save, LogOut } from 'lucide-react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    storeName: user?.storeName || '',
    bio: user?.bio || '',
    vehicleType: user?.vehicleType || '',
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        storeName: user.storeName || '',
        bio: user.bio || '',
        vehicleType: user.vehicleType || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.id), formData);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <UserCircle size={64} className="text-stone-200" />
      <p className="text-stone-500">{t('loginRequired')}</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-8 pb-20">
      <div className="flex flex-col items-center gap-4 py-6">
        <div className="w-24 h-24 rounded-full bg-gojo-yellow/20 flex items-center justify-center text-stone-800 border-4 border-white shadow-xl relative">
          <UserCircle size={48} strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 bg-gojo-green text-white p-1.5 rounded-full shadow-lg">
            {user.role === 'seller' ? <Store size={14} /> : user.role === 'delivery' ? <Truck size={14} /> : <User size={14} />}
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif italic font-bold text-stone-900">{user.name}</h2>
          <span className="text-[10px] uppercase tracking-widest text-gojo-green font-bold bg-gojo-green/10 px-3 py-1 rounded-full">
            {user.role}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="text" 
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="email" 
                disabled
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm opacity-60 cursor-not-allowed"
                value={formData.email}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="tel" 
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Address</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
              <input 
                type="text" 
                className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          {user.role === 'seller' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Store Name</label>
              <div className="relative">
                <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                  value={formData.storeName}
                  onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                />
              </div>
            </div>
          )}

          {user.role === 'delivery' && (
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Vehicle Type</label>
              <div className="relative">
                <Truck className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                <input 
                  type="text" 
                  className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all"
                  value={formData.vehicleType}
                  onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-stone-400 font-bold ml-1">Bio / Description</label>
          <textarea 
            rows={3}
            className="w-full bg-stone-50 border-2 border-stone-50 rounded-2xl px-4 py-3.5 text-sm focus:outline-none focus:border-stone-900 transition-all resize-none"
            value={formData.bio}
            onChange={(e) => setFormData({...formData, bio: e.target.value})}
          />
        </div>

        <div className="flex flex-col gap-4 mt-4">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button 
            onClick={logout}
            className="w-full bg-white text-gojo-red border-2 border-gojo-red/10 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-gojo-red/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
