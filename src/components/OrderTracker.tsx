import { motion } from "motion/react";
import { Package, Truck, CheckCircle2, Clock, Search, ShieldCheck } from "lucide-react";
import React, { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { useAuth } from "../App";

interface Order {
  id: string;
  status: 'pending' | 'in_progress' | 'quality_check' | 'delivered' | 'completed';
  totalPrice: number;
  currency: string;
  systemType: string;
  createdAt: string;
  uid: string;
}

const statusSteps = [
  { id: 'pending', label: 'Order Placed', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400/10' },
  { id: 'in_progress', label: 'In Progress', icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
  { id: 'quality_check', label: 'Quality Check', icon: ShieldCheck, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'delivered', label: 'Delivered', icon: Truck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { id: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
];

export default function OrderTracker() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState("");
  const [trackedOrder, setTrackedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "orders"), 
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(fetched);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "orders");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const found = orders.find(o => o.id === searchId);
    if (found) {
      setTrackedOrder(found);
    } else {
      // If not in user's orders, maybe show an error or search globally if admin (but this is for users)
      alert("Order not found. Please check the ID.");
    }
  };

  const currentStepIndex = trackedOrder ? statusSteps.findIndex(s => s.id === trackedOrder.status) : -1;

  return (
    <div className="space-y-12">
      {/* Search Bar */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="relative group">
          <input 
            type="text" 
            placeholder="Enter Order ID (e.g. ord_123...)" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-blue-600/50 transition-all duration-300 pr-16"
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 bottom-2 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center"
          >
            <Search className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Tracking Visualization */}
      {trackedOrder && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border-white/10 rounded-3xl p-8 md:p-12 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Package className="w-48 h-48 text-white" />
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12 border-b border-white/5 pb-8">
            <div>
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Tracking Order</p>
              <h3 className="text-2xl font-bold text-white font-mono">{trackedOrder.id}</h3>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-blue-400">{trackedOrder.currency === 'USD' ? '$' : '৳'}{trackedOrder.totalPrice}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 hidden md:block" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 transition-all duration-1000 hidden md:block" 
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            />

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                  <div key={step.id} className="flex flex-col items-center text-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isActive ? `${step.bg} ${step.color} scale-110 shadow-lg` : 'bg-white/5 text-gray-600'
                    } ${isCurrent ? 'ring-2 ring-white/20 ring-offset-4 ring-offset-[#050505]' : ''}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className={`text-sm font-bold transition-colors duration-500 ${isActive ? 'text-white' : 'text-gray-600'}`}>
                        {step.label}
                      </p>
                      {isCurrent && (
                        <motion.span 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-[10px] text-blue-400 font-mono uppercase tracking-tighter animate-pulse"
                        >
                          Current Status
                        </motion.span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* User's Orders List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-3">
          <Clock className="w-5 h-5 text-blue-500" />
          Your Recent Orders
        </h3>
        
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {orders.map((order) => (
              <button 
                key={order.id}
                onClick={() => {
                  setTrackedOrder(order);
                  setSearchId(order.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-6 glass border-white/5 rounded-2xl hover:border-blue-600/30 transition-all duration-300 text-left group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">ID: {order.id.slice(0, 12)}...</p>
                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{order.systemType}</h4>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter ${
                    order.status === 'completed' || order.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' : 
                    order.status === 'pending' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500 font-mono">{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span className="text-blue-400 font-bold">{order.currency === 'USD' ? '$' : '৳'}{order.totalPrice}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass border-white/5 rounded-2xl text-gray-500 italic">
            No orders found. Start your journey with 7Vortex today!
          </div>
        )}
      </div>
    </div>
  );
}
