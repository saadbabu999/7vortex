import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { auth, db, signInWithGoogle, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, query, orderBy, writeBatch, updateDoc, setDoc, getDoc } from "firebase/firestore";
import { LogIn, Plus, Trash2, Layout, FileText, Users, LogOut, X, Save, GripVertical, ShoppingCart, Edit, Eye, Search, Sparkles, Download, Image as ImageIcon, Loader2, Settings as SettingsIcon } from "lucide-react";
import Logo from "./Logo";
import { generateImage } from "../lib/gemini";
import { toast } from "sonner";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableItem({ id, item, onDelete, onEdit, activeTab }: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="p-6 rounded-xl glass glass-hover border-white/10 flex items-center justify-between group"
    >
      <div className="flex items-center gap-4">
        {activeTab === 'projects' && (
          <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing p-1 text-gray-500 hover:text-white transition-colors">
            <GripVertical className="w-5 h-5" />
          </div>
        )}
        <div>
          <h4 className="text-white font-bold mb-1">{item.title || item.email || item.id}</h4>
          <p className="text-sm text-gray-500">{item.category || item.type || item.price || 'No details'}</p>
        </div>
      </div>
      <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(item)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          Edit
        </button>
        <button 
          onClick={() => onDelete(item.id)}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [user, setUser] = useState(auth.currentUser);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("projects");
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Form state for adding projects
  const [isAdding, setIsAdding] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const AIToolsSection = () => {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);

    const handleGenerate = async () => {
      if (!prompt.trim()) {
        toast.error("Please enter a prompt");
        return;
      }

      setIsGenerating(true);
      try {
        const imageUrl = await generateImage(prompt);
        setGeneratedImage(imageUrl);
        toast.success("Image generated successfully!");
      } catch (error) {
        toast.error("Failed to generate image.");
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-dark border-white/10 rounded-3xl p-8 md:p-12 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">AI Image Generator</h3>
              <p className="text-gray-400">Generate high-quality visual assets using Gemini Imagen.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to generate... (e.g., A futuristic digital vortex in deep space, hyper-realistic, 8k)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-600/50 transition-colors min-h-[120px] resize-none"
              />
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </button>
          </div>

          {generatedImage && (
            <div className="mt-12">
              <div className="relative group rounded-2xl overflow-hidden border border-white/10 aspect-square max-w-lg mx-auto">
                <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                  <a 
                    href={generatedImage}
                    download={`vortex-ai-${Date.now()}.png`}
                    className="p-4 bg-white text-black rounded-full hover:scale-110 transition-transform"
                    title="Download Image"
                  >
                    <Download className="w-6 h-6" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-8 rounded-3xl glass border-white/10">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-400" /> Tips for better results
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Be specific about the style (e.g., "digital art", "oil painting", "3D render").
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Describe lighting and mood (e.g., "cinematic lighting", "moody", "vibrant").
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Mention technical details (e.g., "high resolution", "detailed textures", "8k").
              </li>
            </ul>
          </div>
          <div className="p-8 rounded-3xl glass border-white/10">
            <h4 className="text-white font-bold mb-4 flex items-center gap-2">
              <Layout className="w-5 h-5 text-blue-400" /> Usage Ideas
            </h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Generate placeholder images for new portfolio projects.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Create unique header images for blog posts.
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                Design custom social media assets for 7Vortex.
              </li>
            </ul>
          </div>
        </div>
      </div>
    );
  };

  const SiteSettingsSection = () => {
    const [logoFileUrl, setLogoFileUrl] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
      const getSettings = async () => {
        try {
          const snap = await getDoc(doc(db, "settings", "global"));
          if (snap.exists() && snap.data().logoDataUrl) {
            setLogoFileUrl(snap.data().logoDataUrl);
          }
        } catch (e) {
          console.error("Error fetching settings:", e);
        }
      }
      getSettings();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 1024 * 1024) { // 1MB limit for firestore document
          toast.error("File size must be under 1MB");
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setLogoFileUrl(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    const handleSave = async () => {
      setIsSaving(true);
      try {
        await setDoc(doc(db, "settings", "global"), { logoDataUrl: logoFileUrl }, { merge: true });
        toast.success("Settings saved securely!");
      } catch (err) {
        toast.error("Failed to save settings");
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="max-w-4xl mx-auto">
        <div className="glass-dark border-white/10 rounded-3xl p-8 md:p-12 mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-blue-600/20 rounded-2xl flex items-center justify-center text-blue-400">
              <SettingsIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">System Settings</h3>
              <p className="text-gray-400">Secure configuration panel for your platform.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload Site Logo (SVG or PNG format)</label>
              <div className="flex items-center gap-6">
                {logoFileUrl && (
                  <div className="w-24 h-24 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center p-2">
                    <img src={logoFileUrl} alt="Logo Preview" className="max-w-full max-h-full object-contain" />
                  </div>
                )}
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/png, image/svg+xml"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400
                      file:mr-4 file:py-3 file:px-6
                      file:rounded-xl file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-600/20 file:text-blue-400
                      hover:file:bg-blue-600/30 transition-all cursor-pointer bg-white/5 border border-white/10 rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">Max. file size: 1MB. Data is encrypted and stored securely over HTTPS.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isSaving ? "Saving Configuration..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      // Check if user is the specific admin email
      setIsAdmin(user?.email === "tarifgazi9181@gmail.com");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    // Sort projects by 'order' field
    const q = activeTab === 'projects' 
      ? query(collection(db, activeTab), orderBy("order", "asc"))
      : collection(db, activeTab);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, activeTab);
    });
    return () => unsubscribe();
  }, [user, activeTab]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = data.findIndex((item) => item.id === active.id);
      const newIndex = data.findIndex((item) => item.id === over.id);
      
      const newData = arrayMove(data, oldIndex, newIndex);
      setData(newData);

      // Update Firestore with new order
      try {
        const batch = writeBatch(db);
        newData.forEach((item: any, index: number) => {
          const docRef = doc(db, activeTab, item.id);
          batch.update(docRef, { order: index });
        });
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, activeTab);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      await deleteDoc(doc(db, activeTab, id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `${activeTab}/${id}`);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole });
      toast.success(`User role updated to ${newRole}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
      toast.error("Failed to update user role.");
    }
  };

  const handleUpdateStatus = async (id: string, updates: any) => {
    try {
      await updateDoc(doc(db, activeTab, id), updates);
      toast.success(`${activeTab.slice(0, -1)} updated!`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `${activeTab}/${id}`);
      toast.error("Failed to update status.");
    }
  };

  const filteredData = data.filter(item => {
    const searchStr = searchTerm.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(searchStr)) ||
      (item.email && item.email.toLowerCase().includes(searchStr)) ||
      (item.category && item.category.toLowerCase().includes(searchStr)) ||
      (item.status && item.status.toLowerCase().includes(searchStr)) ||
      (item.id && item.id.toLowerCase().includes(searchStr))
    );
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalData = { 
        ...formData, 
        createdAt: serverTimestamp(),
        order: data.length // Add order for projects
      };
      
      // Special handling for tags (array of strings)
      if (activeTab === 'projects' && typeof formData.tags === 'string') {
        finalData.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t !== "");
      }

      await addDoc(collection(db, activeTab), finalData);
      setIsAdding(false);
      setFormData({});
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, activeTab);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setIsSubmitting(true);
    try {
      let finalData = { ...formData };
      
      // Special handling for tags (array of strings)
      if (activeTab === 'projects' && typeof formData.tags === 'string') {
        finalData.tags = formData.tags.split(',').map(t => t.trim()).filter(t => t !== "");
      }

      await updateDoc(doc(db, activeTab, editingItem.id), finalData);
      setEditingItem(null);
      setFormData({});
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, activeTab);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEdit = (item: any) => {
    setEditingItem(item);
    // Pre-fill form data
    const { id, createdAt, order, ...rest } = item;
    const prefilledData = { ...rest };
    if (activeTab === 'projects' && Array.isArray(item.tags)) {
      prefilledData.tags = item.tags.join(', ');
    }
    setFormData(prefilledData);
  };

  const seedData = async () => {
    if (!confirm("This will add sample data to all collections. Continue?")) return;
    try {
      // Seed Projects
      const projects = [
        { title: "Nexus Dashboard", category: "Enterprise SaaS", image: "https://picsum.photos/seed/nexus/800/600", tags: ["React", "D3.js", "Firebase"], link: "#", createdAt: serverTimestamp() },
        { title: "Aura Mobile", category: "Fintech App", image: "https://picsum.photos/seed/aura/800/600", tags: ["React Native", "Node.js", "PostgreSQL"], link: "#", createdAt: serverTimestamp() }
      ];
      for (const p of projects) await addDoc(collection(db, "projects"), p);

      // Seed Services
      const services = [
        { title: "MVP Launch", price: "From $5k", description: "Perfect for startups needing to validate their idea rapidly.", deliverables: ["Product Strategy", "Core Feature Set", "UI/UX Design", "Cloud Deployment"], cta: "Start MVP Path", color: "blue" },
        { title: "Enterprise Scaling", price: "Custom", description: "Robust systems built for high-traffic and complex workflows.", deliverables: ["Microservices Architecture", "Advanced Security", "Performance Audit", "24/7 Support"], cta: "Scale Now", color: "purple" }
      ];
      for (const s of services) await addDoc(collection(db, "services"), s);

      // Seed Blog
      const blogs = [
        { title: "The Rise of Edge Computing in 2026", excerpt: "Exploring how distributed networks are redefining latency and user experience.", content: "Full content here...", category: "Architecture", date: "2026-03-20", readTime: "5 min read" }
      ];
      for (const b of blogs) await addDoc(collection(db, "blogPosts"), b);

      alert("Seed data added successfully!");
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "seed");
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <Logo size="xl" className="justify-center mb-8" showText={false} />
          <h1 className="text-3xl font-bold text-white mb-4">Vortex CMS</h1>
          {!user ? (
            <>
              <p className="text-gray-400 mb-8">Sign in with your authorized account to manage the digital evolution.</p>
              <button 
                onClick={signInWithGoogle}
                className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors"
              >
                <LogIn className="w-5 h-5" /> Sign in with Google
              </button>
            </>
          ) : (
            <>
              <p className="text-red-400 mb-8">Access Denied. Your account ({user.email}) is not authorized to access this dashboard.</p>
              <button 
                onClick={() => auth.signOut()}
                className="w-full py-4 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 p-4 md:p-6 flex flex-row md:flex-col items-center md:items-stretch gap-4 md:gap-0 glass-dark z-50 sticky top-0 md:relative">
        <div className="flex items-center gap-2 md:mb-12">
          <Logo size="sm" textClassName="hidden md:inline" />
        </div>

        <nav className="flex-1 flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar pb-2 md:pb-0">
          {[
            { id: "projects", label: "Portfolio", icon: Layout },
            { id: "services", label: "Services", icon: FileText },
            { id: "blogPosts", label: "Insights", icon: FileText },
            { id: "users", label: "Users", icon: Users },
            { id: "orders", label: "Orders", icon: ShoppingCart },
            { id: "leads", label: "Leads", icon: Users },
            { id: "visitors", label: "Visitors", icon: Eye },
            { id: "aiTools", label: "AI Tools", icon: Sparkles },
            { id: "settings", label: "Settings", icon: SettingsIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap flex items-center gap-3 px-4 py-2 md:py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>

        <button 
          onClick={() => auth.signOut()}
          className="flex items-center gap-3 px-4 py-2 md:py-3 rounded-lg text-sm font-medium text-gray-500 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" /> <span className="hidden md:inline">Sign Out</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto bg-gradient-to-br from-[#050505] to-[#0a0a0a]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white capitalize tracking-tight">{activeTab}</h2>
            <button 
              onClick={seedData}
              className="text-xs text-gray-500 hover:text-blue-400 transition-colors"
            >
              Seed Sample Data
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl glass border-white/10 text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
            {activeTab !== 'leads' && activeTab !== 'visitors' && activeTab !== 'users' && (
              <button 
                onClick={() => setIsAdding(!isAdding)}
                className={`w-full md:w-auto px-6 py-3 font-bold rounded-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  isAdding ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20'
                }`}
              >
                {isAdding ? <><X className="w-4 h-4" /> Cancel</> : <><Plus className="w-4 h-4" /> Add {activeTab.slice(0, -1)}</>}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Form for Adding Items */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
              <form onSubmit={handleAdd} className="p-8 rounded-2xl glass border-white/10 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {activeTab === 'projects' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Project Title *</label>
                        <input
                          required
                          type="text"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. Nexus Dashboard"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Category *</label>
                        <input
                          required
                          type="text"
                          value={formData.category || ""}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Enterprise SaaS"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Image URL *</label>
                        <input
                          required
                          type="url"
                          value={formData.image || ""}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          placeholder="https://picsum.photos/..."
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Demo Link</label>
                        <input
                          type="url"
                          value={formData.link || ""}
                          onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                          placeholder="https://..."
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Tags (comma separated)</label>
                        <input
                          type="text"
                          value={formData.tags || ""}
                          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                          placeholder="React, Tailwind, Firebase"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}
                  {activeTab === 'blogPosts' && (
                    <>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Post Title *</label>
                        <input
                          required
                          type="text"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. The Future of AI"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Excerpt *</label>
                        <textarea
                          required
                          value={formData.excerpt || ""}
                          onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                          placeholder="A short summary of the post..."
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors min-h-[80px]"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Content *</label>
                        <textarea
                          required
                          value={formData.content || ""}
                          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                          placeholder="Full content of the post..."
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors min-h-[200px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Category</label>
                        <input
                          type="text"
                          value={formData.category || ""}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          placeholder="e.g. Technology"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Read Time</label>
                        <input
                          type="text"
                          value={formData.readTime || ""}
                          onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                          placeholder="e.g. 5 min read"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </>
                  )}
                  {activeTab === 'services' && (
                    <>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Service Title *</label>
                        <input
                          required
                          type="text"
                          value={formData.title || ""}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          placeholder="e.g. MVP Launch"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Price *</label>
                        <input
                          required
                          type="text"
                          value={formData.price || ""}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="e.g. From $5k"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Description *</label>
                        <textarea
                          required
                          value={formData.description || ""}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Detailed description of the service..."
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">CTA Text</label>
                        <input
                          type="text"
                          value={formData.cta || ""}
                          onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                          placeholder="e.g. Start MVP Path"
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-mono text-gray-500 uppercase">Color Theme</label>
                        <select
                          value={formData.color || "blue"}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                        >
                          <option value="blue">Blue</option>
                          <option value="purple">Purple</option>
                          <option value="emerald">Emerald</option>
                        </select>
                      </div>
                    </>
                  )}
                  {/* Fallback for other tabs if needed later */}
                  {(activeTab === 'users' || activeTab === 'orders' || activeTab === 'leads') && (
                    <div className="md:col-span-2 text-center py-4 text-gray-500 italic">
                      Management only for {activeTab}. Use list view to update status.
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end">
                  <button
                    disabled={isSubmitting}
                    type="submit"
                    className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" /> {isSubmitting ? "Saving..." : "Save Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === 'aiTools' ? (
          <AIToolsSection />
        ) : activeTab === 'settings' ? (
          <SiteSettingsSection />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeTab === 'projects' ? (
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext 
                  items={filteredData.map(item => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {filteredData.map((item) => (
                    <SortableItem 
                      key={item.id} 
                      id={item.id as string} 
                      item={item} 
                      onDelete={handleDelete}
                      onEdit={openEdit}
                      activeTab={activeTab}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item) => (
                  <div key={item.id} className="p-6 rounded-xl glass glass-hover border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      {activeTab === 'users' && (
                        <div className="relative">
                          <img 
                            src={item.photoURL || `https://ui-avatars.com/api/?name=${item.email}`} 
                            alt="User" 
                            className="w-12 h-12 rounded-full border border-white/10"
                          />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-bold mb-1 flex items-center gap-2">
                          {item.title || item.email || item.id}
                          {activeTab === 'orders' && (
                            <span className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              item.status === 'completed' || item.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-400' :
                              item.status === 'pending' ? 'bg-amber-500/20 text-amber-400' :
                              'bg-blue-500/20 text-blue-400'
                            }`}>
                              {item.status || 'new'}
                            </span>
                          )}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {activeTab === 'orders' ? (
                            `${item.systemType} • ${item.currency === 'USD' ? '$' : '৳'}${item.totalPrice}`
                          ) : activeTab === 'users' ? (
                            `${item.role || 'user'}`
                          ) : activeTab === 'visitors' ? (
                            `${item.ip} • ${item.location?.city}, ${item.location?.country} • ${item.deviceInfo?.os?.name} ${item.deviceInfo?.os?.version}`
                          ) : (
                            item.category || item.type || 'No details'
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity mt-4 md:mt-0">
                      {activeTab === 'users' && (
                        <select 
                          value={item.role || 'user'}
                          onChange={(e) => handleUpdateRole(item.id, e.target.value)}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="user" className="bg-[#050505]">User</option>
                          <option value="admin" className="bg-[#050505]">Admin</option>
                        </select>
                      )}
                      {activeTab === 'orders' && (
                        <select 
                          value={item.status || 'pending'}
                          onChange={(e) => handleUpdateStatus(item.id, { status: e.target.value })}
                          className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[10px] text-white outline-none focus:border-blue-500 transition-colors"
                        >
                          <option value="pending" className="bg-[#050505]">Pending</option>
                          <option value="in_progress" className="bg-[#050505]">In Progress</option>
                          <option value="quality_check" className="bg-[#050505]">Quality Check</option>
                          <option value="delivered" className="bg-[#050505]">Delivered</option>
                          <option value="completed" className="bg-[#050505]">Completed</option>
                        </select>
                      )}
                      {activeTab === 'visitors' && (
                        <div className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">
                          {item.deviceInfo?.device?.model || 'PC'} • {item.deviceInfo?.browser?.name}
                        </div>
                      )}
                      {activeTab === 'orders' && item.status !== 'completed' && (
                        <button 
                          onClick={() => handleUpdateStatus(item.id, { status: 'completed' })}
                          className="px-4 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
                        >
                          Mark Done
                        </button>
                      )}
                      <button 
                        onClick={() => openEdit(item)}
                        className="p-3 md:p-2 bg-white/5 md:bg-transparent rounded-lg text-gray-400 hover:text-white transition-colors"
                      >
                        <Edit className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 md:p-2 bg-white/5 md:bg-transparent rounded-lg text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {filteredData.length === 0 && (
              <div className="text-center py-20 text-gray-600 italic">No items found in {activeTab}.</div>
            )}
          </div>
        )}

        {/* Edit Modal */}
        <AnimatePresence>
          {editingItem && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingItem(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl glass border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white">Edit {activeTab.slice(0, -1)}</h3>
                  <button 
                    onClick={() => setEditingItem(null)}
                    className="p-2 text-gray-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeTab === 'projects' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Project Title *</label>
                          <input
                            required
                            type="text"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Category *</label>
                          <input
                            required
                            type="text"
                            value={formData.category || ""}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Image URL *</label>
                          <input
                            required
                            type="url"
                            value={formData.image || ""}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Demo Link</label>
                          <input
                            type="url"
                            value={formData.link || ""}
                            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Tags (comma separated)</label>
                          <input
                            type="text"
                            value={formData.tags || ""}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                      </>
                    )}
                    {activeTab === 'services' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Title *</label>
                          <input
                            required
                            type="text"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Price *</label>
                          <input
                            required
                            type="text"
                            value={formData.price || ""}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Description *</label>
                          <textarea
                            required
                            value={formData.description || ""}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                          />
                        </div>
                      </>
                    )}
                    {activeTab === 'blogPosts' && (
                      <>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Title *</label>
                          <input
                            required
                            type="text"
                            value={formData.title || ""}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Excerpt *</label>
                          <textarea
                            required
                            value={formData.excerpt || ""}
                            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-white focus:border-blue-500 outline-none transition-colors min-h-[100px]"
                          />
                        </div>
                      </>
                    )}
                    {activeTab === 'leads' && (
                      <>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Email</label>
                          <input
                            readOnly
                            type="text"
                            value={formData.email || ""}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-gray-500 outline-none"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-mono text-gray-500 uppercase">Type</label>
                          <input
                            readOnly
                            type="text"
                            value={formData.type || ""}
                            className="w-full px-4 py-3 rounded-lg glass border-white/10 text-gray-500 outline-none"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex justify-end gap-4">
                    <button
                      type="button"
                      onClick={() => setEditingItem(null)}
                      className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      disabled={isSubmitting}
                      type="submit"
                      className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" /> {isSubmitting ? "Updating..." : "Update Item"}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

// Helper for auth state
import { onAuthStateChanged } from "firebase/auth";
