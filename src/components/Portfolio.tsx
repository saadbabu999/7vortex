import { motion } from "motion/react";
import { ExternalLink, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import ScrollReveal from "./ScrollReveal";

interface Project {
  id: string;
  title: string;
  category: string;
  image: string;
  tags: string[];
  link: string;
}

const fallbackProjects: Project[] = [
  {
    id: "1",
    title: "Nexus Dashboard",
    category: "Enterprise SaaS",
    image: "https://picsum.photos/seed/nexus/800/600",
    tags: ["React", "D3.js", "Firebase"],
    link: "#"
  },
  {
    id: "2",
    title: "Aura Mobile",
    category: "Fintech App",
    image: "https://picsum.photos/seed/aura/800/600",
    tags: ["React Native", "Node.js", "PostgreSQL"],
    link: "#"
  }
];

export default function Portfolio({ id }: { id: string }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const q = query(collection(db, "projects"), orderBy("order", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project));
      setProjects(fetched.length > 0 ? fetched : fallbackProjects);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "projects");
      setProjects(fallbackProjects);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredProjects = filter === "All" 
    ? projects 
    : projects.filter(p => p.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <section id={id} className="py-32 bg-[#050505] px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">Dynamic Portfolio</h2>
            <p className="text-gray-400 max-w-xl">Showcasing our latest breakthroughs in digital architecture.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {["All", "Web", "AI", "Mobile"].map((cat) => (
              <button 
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-2 rounded-full border transition-all duration-300 text-sm font-medium ${
                  filter === cat 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'glass text-gray-400 hover:text-white glass-hover'
                }`}
              >
                {cat === "All" ? "All Projects" : `${cat} Solutions`}
              </button>
            ))}
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filteredProjects.map((project, i) => (
            <ScrollReveal
              key={project.id}
              delay={i * 0.1}
              className="group cursor-pointer"
              onClick={() => project.link && window.open(project.link, '_blank')}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl mb-6">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </motion.button>
                </div>
              </div>
              
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-blue-500 uppercase tracking-widest mb-2 block">{project.category}</span>
                  <h3 className="text-2xl font-bold text-white mb-3">{project.title}</h3>
                  <div className="flex gap-2">
                    {project.tags?.map((tag, j) => (
                      <span key={j} className="text-[10px] px-2 py-1 rounded bg-white/5 text-gray-400 border border-white/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <button className="text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-sm font-medium">
                  See Live Demo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
