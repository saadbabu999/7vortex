import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Hero from "./components/Hero";
import TechStack from "./components/TechStack";
import ServiceTiers from "./components/ServiceTiers";
import Portfolio from "./components/Portfolio";
import Blog from "./components/Blog";
import DiscoveryPortal from "./components/DiscoveryPortal";
import AdminDashboard from "./components/AdminDashboard";
import AuthModal from "./components/AuthModal";
import OrderForm from "./components/OrderForm";
import VisitorTracker from "./components/VisitorTracker";
import Testimonials from "./components/Testimonials";
import Newsletter from "./components/Newsletter";
import LiveChat from "./components/LiveChat";
import OrderTracker from "./components/OrderTracker";
import ServiceCustomizer from "./components/ServiceCustomizer";
import Logo from "./components/Logo";
import { auth, db, onAuthStateChanged } from "./lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { Toaster, toast } from "sonner";
import { User, LogOut, ShoppingBag, Menu, X as CloseIcon, Eye, EyeOff, Calculator } from "lucide-react";

// Export useAuth hook for other components
import { createContext, useContext } from "react";
const AuthContext = createContext<{ user: any; userProfile: any }>({ user: null, userProfile: null });
export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === "#admin");
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showOrderTracker, setShowOrderTracker] = useState(false);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  const ADMIN_EMAIL = "tarifgazi9181@gmail.com";

  useEffect(() => {
    const handleHashChange = () => {
      const isHashAdmin = window.location.hash === "#admin";
      // Only allow admin to see the dashboard via hash if they are logged in as admin
      if (isHashAdmin && auth.currentUser?.email !== ADMIN_EMAIL) {
        window.location.hash = "";
        setIsAdmin(false);
        toast.error("Access denied. Admin only.");
      } else {
        setIsAdmin(isHashAdmin);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    
    const unsubscribeAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (u) {
        // Listen to user profile
        const unsubscribeProfile = onSnapshot(doc(db, "users", u.uid), (snap) => {
          setUserProfile(snap.data());
        }, (error) => {
          // Silent fail for profile if not found or permission denied
          console.warn("Profile snapshot error:", error);
        });
        return () => unsubscribeProfile();
      } else {
        setUserProfile(null);
      }
    });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      unsubscribeAuth();
    };
  }, []);

  const handleOrderClick = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      toast.error("Please sign in to place an order.");
    } else {
      setIsOrderFormOpen(true);
    }
  };

  if (isAdmin && user?.email === ADMIN_EMAIL) {
    return <AdminDashboard />;
  }

  return (
    <AuthContext.Provider value={{ user, userProfile }}>
      <main className={`bg-[#050505] min-h-screen selection:bg-blue-500/30 selection:text-blue-200 ${highContrast ? 'high-contrast' : ''}`}>
      <Toaster position="top-center" theme="dark" />
      <VisitorTracker />
      
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-7xl z-50 px-6 md:px-8 py-4 flex items-center justify-between glass rounded-2xl">
        <Logo size="md" />

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Services
          </button>
          <button 
            onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Portfolio
          </button>
          <button 
            onClick={() => document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Insights
          </button>
          
          <button 
            onClick={() => setHighContrast(!highContrast)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Toggle High Contrast"
          >
            {highContrast ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>

          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <button 
                onClick={() => setShowOrderTracker(true)}
                className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
              >
                <ShoppingBag className="w-4 h-4" /> My Orders
              </button>
              <button 
                onClick={handleOrderClick}
                className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-white transition-colors"
              >
                New Order
              </button>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                    alt="User" 
                    className="w-8 h-8 rounded-full border border-white/10"
                  />
                </div>
                <button 
                  onClick={() => auth.signOut()}
                  className="p-2 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2 rounded-full bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
            >
              Sign In
            </button>
          )}

          {user?.email === ADMIN_EMAIL && (
            <button 
              onClick={() => window.location.hash = "#admin"}
              className="px-5 py-2 rounded-full glass border-white/10 text-white text-sm font-bold hover:bg-white/10 transition-all"
            >
              CMS
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex md:hidden items-center gap-4">
          {user && (
            <button 
              onClick={handleOrderClick}
              className="p-2 text-blue-400"
            >
              <ShoppingBag className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-white"
          >
            {isMobileMenuOpen ? <CloseIcon className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 mt-4 mx-0 glass border-white/10 rounded-2xl p-6 flex flex-col gap-6 md:hidden z-[60]"
            >
              <button 
                onClick={() => { setIsMobileMenuOpen(false); document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-left text-lg font-medium text-gray-400 hover:text-white"
              >
                Services
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-left text-lg font-medium text-gray-400 hover:text-white"
              >
                Portfolio
              </button>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); document.getElementById('blog')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="text-left text-lg font-medium text-gray-400 hover:text-white"
              >
                Insights
              </button>
              
              <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
                {user ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img 
                          src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
                          alt="User" 
                          className="w-10 h-10 rounded-full border border-white/10"
                        />
                        <div className="flex flex-col">
                          <span className="text-white font-bold text-sm truncate max-w-[150px]">{user.email}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => auth.signOut()}
                        className="p-2 text-red-400"
                      >
                        <LogOut className="w-5 h-5" />
                      </button>
                    </div>
                    {user?.email === ADMIN_EMAIL ? (
                      <button 
                        onClick={() => { setIsMobileMenuOpen(false); window.location.hash = "#admin"; }}
                        className="w-full py-3 rounded-xl bg-white/5 text-white font-bold text-center"
                      >
                        Admin CMS
                      </button>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <button 
                          onClick={() => { setIsMobileMenuOpen(false); toast.info("Order tracking coming soon!"); }}
                          className="w-full py-3 rounded-xl bg-white/5 text-white font-bold text-center flex items-center justify-center gap-2"
                        >
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); setIsAuthModalOpen(true); }}
                    className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl"
                  >
                    Sign In
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      <Hero onLaunch={handleOrderClick} />
      <TechStack />
      <ServiceTiers onSelect={handleOrderClick} onCustomWizard={() => setShowCustomizer(true)} />
      <Portfolio id="portfolio" />
      <Blog id="blog" />
      <Testimonials />
      <Newsletter />
      <DiscoveryPortal id="discovery" />

      {/* Modals */}
      <AnimatePresence>
        {showOrderTracker && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOrderTracker(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl glass border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-bold text-white tracking-tight">Order Tracking</h3>
                <button 
                  onClick={() => setShowOrderTracker(false)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <OrderTracker />
            </motion.div>
          </div>
        )}

        {showCustomizer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCustomizer(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl glass border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <Calculator className="w-8 h-8 text-blue-500" />
                  <h3 className="text-3xl font-bold text-white tracking-tight">Service Customizer</h3>
                </div>
                <button 
                  onClick={() => setShowCustomizer(false)}
                  className="p-2 text-gray-500 hover:text-white transition-colors"
                >
                  <CloseIcon className="w-6 h-6" />
                </button>
              </div>
              <ServiceCustomizer onComplete={(total) => {
                toast.success(`Estimate generated: $${total}`);
                setShowCustomizer(false);
                handleOrderClick(); // Open order form after estimate
              }} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      
      {isOrderFormOpen && <OrderForm onClose={() => setIsOrderFormOpen(false)} />}

      <LiveChat />

      <footer className="py-20 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <Logo size="sm" />
          <p className="text-gray-600 text-sm">© 2026 7Vortex Digital. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors">LinkedIn</a>
            <a href="#" className="text-gray-600 hover:text-white transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </main>
    </AuthContext.Provider>
  );
}
