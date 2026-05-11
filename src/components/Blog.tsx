import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp, where, deleteDoc, doc } from "firebase/firestore";
import { MessageSquare, Send, Trash2, User as UserIcon, X } from "lucide-react";
import { useAuth } from "../App";
import { toast } from "sonner";
import ScrollReveal from "./ScrollReveal";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  category: string;
}

interface Comment {
  id: string;
  postId: string;
  uid: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: any;
}

const fallbackPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Rise of Edge Computing in 2026",
    excerpt: "Exploring how distributed networks are redefining latency and user experience in modern web apps.",
    date: "Mar 20, 2026",
    readTime: "5 min read",
    category: "Architecture"
  },
  {
    id: "2",
    title: "Scaling React for 10M+ Users",
    excerpt: "Lessons learned from building high-concurrency dashboards with real-time data synchronization.",
    date: "Mar 15, 2026",
    readTime: "8 min read",
    category: "Engineering"
  }
];

export default function Blog({ id }: { id: string }) {
  const { user, userProfile } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "blogPosts"), orderBy("date", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BlogPost));
      setPosts(fetched.length > 0 ? fetched : fallbackPosts);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "blogPosts");
      setPosts(fallbackPosts);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedPost) {
      setComments([]);
      return;
    }

    const q = query(
      collection(db, "comments"), 
      where("postId", "==", selectedPost.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      setComments(fetched);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "comments");
    });

    return () => unsubscribe();
  }, [selectedPost]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPost || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        postId: selectedPost.id,
        uid: user.uid,
        userName: user.displayName || user.email?.split('@')[0] || "Anonymous",
        userPhoto: user.photoURL || "",
        text: newComment.trim(),
        createdAt: serverTimestamp()
      });
      setNewComment("");
      toast.success("Comment added!");
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "comments");
      toast.error("Failed to add comment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;
    try {
      await deleteDoc(doc(db, "comments", commentId));
      toast.success("Comment deleted.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, "comments");
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <section id={id} className="py-32 bg-[#050505] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-8">
            <ScrollReveal className="mb-12">
              <h2 className="text-4xl font-bold text-white tracking-tight">Insights & Articles</h2>
            </ScrollReveal>
            <div className="space-y-12">
              {posts.map((post, i) => (
                <ScrollReveal
                  key={post.id}
                  direction="left"
                  delay={i * 0.1}
                  className="group cursor-pointer p-8 rounded-2xl glass glass-hover border-white/5"
                  onClick={() => setSelectedPost(post)}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">{post.category}</span>
                    <span className="text-xs text-gray-600">{post.date}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{post.title}</h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium text-white">
                      Read Article <div className="w-8 h-px bg-blue-600" />
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <MessageSquare className="w-4 h-4" />
                      Join Discussion
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>

          <ScrollReveal direction="right" className="lg:col-span-4">
            <div className="sticky top-32 p-8 rounded-2xl glass border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Vortex Newsletter</h3>
              <p className="text-sm text-gray-400 mb-8">Get technical insights and project updates delivered to your inbox weekly.</p>
              <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-xl mb-8">
                <p className="text-xs text-blue-400 font-medium">Join 5,000+ developers and tech leaders staying ahead of the curve.</p>
              </div>
              <button 
                onClick={() => document.getElementById('newsletter')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-600/20"
              >
                Subscribe Now
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* Article Detail & Comments Modal */}
      <AnimatePresence>
        {selectedPost && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPost(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-4xl glass border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <button 
                onClick={() => setSelectedPost(null)}
                className="absolute top-8 right-8 p-2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="mb-12">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">{selectedPost.category}</span>
                  <span className="text-xs text-gray-600">{selectedPost.date} • {selectedPost.readTime}</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-8 tracking-tight leading-tight">{selectedPost.title}</h2>
                <div className="prose prose-invert max-w-none text-gray-400 text-lg leading-relaxed">
                  <p>{selectedPost.excerpt}</p>
                  <p className="mt-6">Full article content would be rendered here. For this prototype, we are focusing on the community discussion features below.</p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-white/5 pt-12">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                  Community Discussion ({comments.length})
                </h3>

                {user ? (
                  <form onSubmit={handleAddComment} className="mb-12">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0 border border-blue-600/30">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <UserIcon className="w-5 h-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1 space-y-4">
                        <textarea 
                          required
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Share your thoughts on this article..."
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-600/50 transition-colors min-h-[100px] resize-none"
                        />
                        <div className="flex justify-end">
                          <button 
                            disabled={isSubmitting || !newComment.trim()}
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                          >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? "Posting..." : "Post Comment"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="p-8 rounded-2xl bg-blue-600/5 border border-blue-600/10 text-center mb-12">
                    <p className="text-gray-400 mb-4">Sign in to join the conversation and share your insights.</p>
                    <button 
                      onClick={() => { setSelectedPost(null); /* Trigger auth modal in App via some state if needed, or just alert */ alert("Please sign in from the top navigation."); }}
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Sign In to Comment
                    </button>
                  </div>
                )}

                <div className="space-y-8">
                  {comments.length > 0 ? (
                    comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0 border border-white/10 overflow-hidden">
                          {comment.userPhoto ? (
                            <img src={comment.userPhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserIcon className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-white text-sm">{comment.userName}</span>
                              <span className="text-[10px] text-gray-600 font-mono">
                                {comment.createdAt?.toDate ? new Date(comment.createdAt.toDate()).toLocaleDateString() : "Just now"}
                              </span>
                            </div>
                            {(user?.uid === comment.uid || userProfile?.role === 'admin') && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="p-1 text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-gray-600 italic">
                      No comments yet. Be the first to start the discussion!
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
