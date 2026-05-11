import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { MessageCircle, X, Send, User, ShieldCheck } from "lucide-react";
import Logo from "./Logo";
import { auth, db } from "../lib/firebase";
import { collection, addDoc, onSnapshot, query, orderBy, limit, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "chat_messages"), orderBy("timestamp", "asc"), limit(50));
    const unsubscribe = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (error) => {
      console.error("Chat snapshot error:", error);
    });
    return () => unsubscribe();
  }, [isOpen]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!user) {
      toast.error("Please sign in to chat.");
      return;
    }

    try {
      await addDoc(collection(db, "chat_messages"), {
        text: message,
        uid: user.uid,
        email: user.email,
        photoURL: user.photoURL,
        timestamp: serverTimestamp()
      });
      setMessage("");
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to send message.");
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] glass-dark border-white/10 rounded-3xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 bg-blue-600/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Logo size="sm" showText={false} />
                <div>
                  <h4 className="text-white font-bold text-sm">7Vortex Support</h4>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Online
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 no-scrollbar">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">Start a conversation with us!</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={m.id || i} className={`flex flex-col ${m.uid === user?.uid ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    m.uid === user?.uid ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/10'
                  }`}>
                    <p className="leading-relaxed">{m.text}</p>
                  </div>
                  <span className="text-[10px] text-gray-600 mt-1 px-1">{m.email?.split('@')[0]}</span>
                </div>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
              <input
                type="text"
                placeholder={user ? "Type a message..." : "Sign in to chat"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={!user}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-blue-600/50 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!user || !message.trim()}
                className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-lg shadow-blue-600/20"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-600/40 relative group overflow-hidden"
      >
        {isOpen ? <X className="w-6 h-6 z-10" /> : <Logo size="lg" showText={false} className="z-10" />}
        {!isOpen && (
          <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#050505]">
            1
          </span>
        )}
      </motion.button>
    </div>
  );
}
