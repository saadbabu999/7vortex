import React, { useState } from "react";
import { motion } from "motion/react";
import { Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import ScrollReveal from "./ScrollReveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.endsWith("@gmail.com")) {
      toast.error("Please use a @gmail.com account.");
      return;
    }
    // In a real app, save to Firestore
    setIsSubscribed(true);
    toast.success("Subscribed successfully!");
  };

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-[#050505] to-[#0a0a0a]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="p-12 rounded-3xl glass border-white/10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-12">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />

          <div className="relative z-10 max-w-xl">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Stay Ahead of the Curve</h2>
            <p className="text-gray-500">Subscribe to our newsletter for the latest insights on AI, digital transformation, and identity security.</p>
          </div>

          <div className="relative z-10 w-full max-w-md">
            {isSubscribed ? (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center gap-4 p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              >
                <CheckCircle className="w-8 h-8" />
                <div>
                  <h4 className="font-bold">You're on the list!</h4>
                  <p className="text-sm opacity-80">We'll keep you updated with our best insights.</p>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 p-2 rounded-2xl bg-white/5 border border-white/10">
                <input
                  type="email"
                  required
                  placeholder="tarifgazi9181@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 bg-transparent px-4 py-3 text-white outline-none placeholder:text-gray-600"
                />
                <button
                  type="submit"
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Subscribe
                </button>
              </form>
            )}
            <p className="mt-4 text-[10px] text-gray-600 text-center md:text-left">By subscribing, you agree to our Terms of Service and Privacy Policy.</p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
