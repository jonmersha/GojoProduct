import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { Truck, MapPin, Package, CheckCircle2, Navigation } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, or } from 'firebase/firestore';

const DeliveryDashboard: React.FC = () => {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'orders'),
        or(
          where('status', '==', 'ready'),
          where('delivery_id', '==', user.id)
        )
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];

        setAvailableOrders(ordersData.filter(o => o.status === 'ready' && !o.delivery_id));
        setMyDeliveries(ordersData.filter(o => o.delivery_id === user.id));
        setIsLoading(false);
      }, (error) => {
        console.error('Firestore Error (list deliveries):', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const acceptDelivery = async (orderId: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'delivering',
        delivery_id: user.id,
        delivery_name: user.name
      });
    } catch (error) {
      console.error('Firestore Error (accept delivery):', error);
    }
  };

  const completeDelivery = async (orderId: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status: 'completed'
      });
    } catch (error) {
      console.error('Firestore Error (complete delivery):', error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-2xl font-serif italic font-bold text-stone-900">Delivery Dashboard</h2>
        <p className="text-stone-500 text-sm">Manage your active deliveries and find new ones</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Active Deliveries</h3>
          <div className="flex flex-col gap-4">
            {myDeliveries.length > 0 ? (
              myDeliveries.filter(o => o.status === 'delivering').map((order) => (
                <div key={order.id} className="bg-stone-900 text-white p-6 rounded-3xl shadow-xl flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">Active Task</span>
                      <span className="text-xl font-serif italic font-bold">Order #{order.id.slice(0, 8)}</span>
                    </div>
                    <div className="bg-white/10 p-3 rounded-2xl">
                      <Navigation size={24} className="text-white" />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Package size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/50 font-bold">Pickup From</span>
                        <span className="text-sm font-bold">{order.seller_name}</span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <MapPin size={16} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase text-white/50 font-bold">Deliver To</span>
                        <span className="text-sm font-bold">{order.buyer_name}</span>
                        <span className="text-[10px] text-white/40 mt-1">{order.delivery_address}</span>
                      </div>
                    </div>
                  </div>

                  {order.items && (
                    <div className="bg-white/5 rounded-2xl p-4 flex flex-col gap-3">
                      <span className="text-[10px] uppercase text-white/50 font-bold">Order Contents</span>
                      <div className="text-xs text-white/80 space-y-2">
                        {JSON.parse(order.items).map((item: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="font-medium">{item.quantity}x {item.name}</span>
                            <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={() => completeDelivery(order.id)}
                    className="w-full bg-white text-stone-900 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-all shadow-lg active:scale-[0.98]"
                  >
                    Mark as Delivered
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white border border-dashed border-stone-200 p-12 rounded-3xl text-center text-stone-400">
                <p className="text-sm italic">No active deliveries at the moment</p>
              </div>
            )}
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-stone-400">Available Near You</h3>
          <div className="flex flex-col gap-4">
            {availableOrders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-stone-900">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full">Ready for Pickup</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
                    <div className="flex items-center gap-1">
                      <Package size={14} className="text-stone-400" />
                      <span className="font-medium">{order.seller_name}</span>
                    </div>
                    <ChevronRight size={12} className="text-stone-300 hidden sm:block" />
                    <div className="flex items-center gap-1">
                      <MapPin size={14} className="text-stone-400" />
                      <span className="font-medium">{order.buyer_name}</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => acceptDelivery(order.id)}
                  className="bg-stone-900 text-white px-6 py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95"
                >
                  Accept Delivery
                </button>
              </div>
            ))}
            {availableOrders.length === 0 && (
              <div className="py-20 text-center text-stone-400 bg-white rounded-3xl border border-stone-100">
                <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck size={32} className="text-stone-200" />
                </div>
                <p className="text-sm italic">Searching for new orders in your area...</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m9 18 6-6-6-6"/>
  </svg>
);

export default DeliveryDashboard;
