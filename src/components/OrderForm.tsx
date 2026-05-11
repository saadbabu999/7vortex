import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Check, CreditCard, DollarSign, Globe, Smartphone, Laptop, Zap, ShieldCheck, ShoppingCart, ArrowRight, X } from "lucide-react";
import { auth, db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Logo from "./Logo";
import { toast } from "sonner";

const SYSTEM_TYPES = [
  { id: "website", label: "Custom Website", icon: Globe, basePrice: 500, description: "Responsive, SEO-optimized personal or business site." },
  { id: "webapp", label: "Web Application", icon: Laptop, basePrice: 1500, description: "Full-stack application with database and user auth." },
  { id: "mobile", label: "Mobile App", icon: Smartphone, basePrice: 2500, description: "Cross-platform iOS and Android app." }
];

const OPTIONS = [
  { id: "auth", label: "User Authentication", price: 300, icon: ShieldCheck },
  { id: "payment", label: "Payment Integration", price: 500, icon: CreditCard },
  { id: "cms", label: "Content Management", price: 400, icon: Zap },
  { id: "seo", label: "Advanced SEO", price: 200, icon: Globe },
  { id: "support", label: "24/7 Support", price: 1000, icon: ShieldCheck }
];

const CURRENCIES = [
  { id: "USD", label: "USD ($)", rate: 1 },
  { id: "BDT", label: "BDT (৳)", rate: 110 }
];

export default function OrderForm({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(false);

  const currentType = SYSTEM_TYPES.find(t => t.id === selectedType);
  const currentCurrency = CURRENCIES.find(c => c.id === currency)!;

  const calculateTotal = () => {
    let total = currentType?.basePrice || 0;
    selectedOptions.forEach(optId => {
      const opt = OPTIONS.find(o => o.id === optId);
      if (opt) total += opt.price;
    });
    return total * currentCurrency.rate;
  };

  const toggleOption = (id: string) => {
    setSelectedOptions(prev => 
      prev.includes(id) ? prev.filter(o => o !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!auth.currentUser || !selectedType) return;
    setLoading(true);
    try {
      await addDoc(collection(db, "orders"), {
        userId: auth.currentUser.uid,
        systemType: selectedType,
        options: selectedOptions,
        totalPrice: calculateTotal(),
        currency: currency,
        status: "pending",
        createdAt: serverTimestamp()
      });
      toast.success("Order placed successfully! We will contact you soon.");
      onClose();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "orders");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl glass border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors">
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-12">
          <Logo size="lg" showText={false} />
          <div>
            <h2 className="text-2xl font-bold text-white">Place Your Order</h2>
            <p className="text-gray-400 text-sm">Configure your custom digital system.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Step 1: System Type */}
            <section className="space-y-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs">1</span>
                Select System Type
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {SYSTEM_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-6 rounded-2xl border transition-all text-left group ${
                      selectedType === type.id ? 'glass border-blue-500 bg-blue-500/10' : 'glass border-white/10 hover:border-white/20'
                    }`}
                  >
                    <type.icon className={`w-8 h-8 mb-4 transition-colors ${selectedType === type.id ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                    <h4 className="text-white font-bold mb-1">{type.label}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{type.description}</p>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Options */}
            <section className={`space-y-6 transition-opacity ${!selectedType ? 'opacity-30 pointer-events-none' : ''}`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs">2</span>
                Add Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className={`p-4 rounded-xl border transition-all flex items-center justify-between group ${
                      selectedOptions.includes(opt.id) ? 'glass border-blue-500 bg-blue-500/10' : 'glass border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <opt.icon className={`w-5 h-5 ${selectedOptions.includes(opt.id) ? 'text-blue-400' : 'text-gray-500'}`} />
                      <span className="text-sm font-medium text-white">{opt.label}</span>
                    </div>
                    <span className="text-xs font-mono text-blue-400">+{opt.price} USD</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Step 3: Currency & Payment */}
            <section className={`space-y-6 transition-opacity ${!selectedType ? 'opacity-30 pointer-events-none' : ''}`}>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 bg-blue-600/20 text-blue-400 rounded-full flex items-center justify-center text-xs">3</span>
                Currency & Payment
              </h3>
              <div className="flex gap-4">
                {CURRENCIES.map(curr => (
                  <button
                    key={curr.id}
                    onClick={() => setCurrency(curr.id)}
                    className={`px-6 py-3 rounded-xl border transition-all font-bold text-sm ${
                      currency === curr.id ? 'bg-blue-600 text-white border-blue-600' : 'glass border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    {curr.label}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="p-8 rounded-3xl glass border-white/10 sticky top-0 space-y-8">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-blue-400" />
                Order Summary
              </h3>

              <div className="space-y-4">
                {currentType ? (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">{currentType.label}</span>
                    <span className="text-white font-mono">{currentType.basePrice * currentCurrency.rate} {currency}</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600 italic">Select a system type to see pricing.</p>
                )}

                {selectedOptions.map(optId => {
                  const opt = OPTIONS.find(o => o.id === optId)!;
                  return (
                    <div key={optId} className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">{opt.label}</span>
                      <span className="text-white font-mono">+{opt.price * currentCurrency.rate} {currency}</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-mono mb-1">Total Price</p>
                  <p className="text-3xl font-bold text-white tracking-tighter">
                    {calculateTotal().toLocaleString()} <span className="text-sm text-blue-400">{currency}</span>
                  </p>
                </div>
              </div>

              <button
                disabled={!selectedType || loading}
                onClick={handleSubmit}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Processing..." : "Confirm Order"}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="space-y-4">
                <p className="text-[10px] text-gray-600 uppercase font-mono text-center">Supported Payments</p>
                <div className="grid grid-cols-4 gap-2 opacity-30 grayscale">
                  <div className="h-6 glass rounded flex items-center justify-center text-[8px] text-white">VISA</div>
                  <div className="h-6 glass rounded flex items-center justify-center text-[8px] text-white">MC</div>
                  <div className="h-6 glass rounded flex items-center justify-center text-[8px] text-white">BKASH</div>
                  <div className="h-6 glass rounded flex items-center justify-center text-[8px] text-white">NAGAD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
