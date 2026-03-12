import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Order, OrderStatus } from '../types';
import { Package, Clock, CheckCircle2, Truck, AlertCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, or, orderBy } from 'firebase/firestore';

const statusConfig: Record<OrderStatus, { icon: any, color: string, label: string }> = {
  pending: { icon: Clock, color: 'text-amber-500 bg-amber-50', label: 'Pending' },
  accepted: { icon: CheckCircle2, color: 'text-blue-500 bg-blue-50', label: 'Accepted' },
  preparing: { icon: Package, color: 'text-indigo-500 bg-indigo-50', label: 'Preparing' },
  ready: { icon: AlertCircle, color: 'text-emerald-500 bg-emerald-50', label: 'Ready for Pickup' },
  delivering: { icon: Truck, color: 'text-purple-500 bg-purple-50', label: 'On the Way' },
  completed: { icon: CheckCircle2, color: 'text-stone-500 bg-stone-50', label: 'Completed' },
  cancelled: { icon: AlertCircle, color: 'text-red-500 bg-red-50', label: 'Cancelled' },
};

const OrderHistory: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const q = query(
        collection(db, 'orders'),
        or(where('buyer_id', '==', user.id), where('seller_id', '==', user.id))
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Order[];
        // Sort by date manually if needed, or use orderBy if index is created
        ordersData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setOrders(ordersData);
        setIsLoading(false);
      }, (error) => {
        console.error('Firestore Error (list orders):', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    }
  }, [user]);

  const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
    } catch (error) {
      console.error('Firestore Error (update order status):', error);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col">
        <h2 className="text-2xl font-serif italic font-bold text-stone-900">Order History</h2>
        <p className="text-stone-500 text-sm">Track your purchases and sales</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 bg-stone-100 animate-pulse rounded-3xl" />
          ))
        ) : orders.length > 0 ? (
          orders.map((order) => {
            const config = statusConfig[order.status];
            return (
              <div key={order.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Order #{order.id.slice(0, 8)}</span>
                    <span className="text-xs text-stone-500 font-medium">{format(new Date(order.created_at), 'MMM d, yyyy • h:mm a')}</span>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${config.color}`}>
                    <config.icon size={12} />
                    {config.label}
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-stone-100 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">
                      {user?.role === 'buyer' ? 'Seller' : 'Buyer'}
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      {user?.role === 'buyer' ? order.seller_name : order.buyer_name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Total Amount</span>
                    <div className="text-xl font-bold text-stone-900">${order.total_amount.toFixed(2)}</div>
                  </div>
                </div>

                {order.delivery_address && (
                  <div className="flex flex-col gap-1.5 text-xs text-stone-500 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Delivery Address</span>
                    <span className="font-medium leading-relaxed">{order.delivery_address}</span>
                  </div>
                )}

                {order.items && (
                  <div className="flex flex-col gap-3">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-widest">Order Items</span>
                    <div className="text-xs text-stone-600 flex flex-col gap-2">
                      {JSON.parse(order.items).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="font-medium">{item.quantity}x {item.name}</span>
                          <span className="font-bold text-stone-900">${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  {user?.role === 'seller' && order.status === 'pending' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'accepted')}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95"
                    >
                      Accept Order
                    </button>
                  )}
                  
                  {user?.role === 'seller' && order.status === 'accepted' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'preparing')}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95"
                    >
                      Start Preparing
                    </button>
                  )}

                  {user?.role === 'seller' && order.status === 'preparing' && (
                    <button 
                      onClick={() => updateStatus(order.id, 'ready')}
                      className="w-full bg-stone-900 text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-md active:scale-95"
                    >
                      Mark as Ready
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-32 flex flex-col items-center justify-center text-stone-400 gap-6 bg-white rounded-3xl border border-stone-100 border-dashed">
            <div className="w-20 h-20 rounded-full bg-stone-50 flex items-center justify-center">
              <Package size={40} className="text-stone-200" />
            </div>
            <div className="text-center">
              <p className="font-serif italic text-2xl text-stone-900">No orders yet</p>
              <p className="text-sm mt-1">Your order history will appear here once you start trading</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
