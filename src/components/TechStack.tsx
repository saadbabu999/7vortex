import { motion } from "motion/react";
import ScrollReveal from "./ScrollReveal";

const logos = [
  { name: "Next.js", url: "https://cdn.worldvectorlogo.com/logos/next-js.svg" },
  { name: "Python", url: "https://cdn.worldvectorlogo.com/logos/python-5.svg" },
  { name: "Supabase", url: "https://cdn.worldvectorlogo.com/logos/supabase.svg" },
  { name: "React", url: "https://cdn.worldvectorlogo.com/logos/react-2.svg" },
  { name: "Tailwind", url: "https://cdn.worldvectorlogo.com/logos/tailwindcss.svg" },
  { name: "TypeScript", url: "https://cdn.worldvectorlogo.com/logos/typescript.svg" },
  { name: "Node.js", url: "https://cdn.worldvectorlogo.com/logos/nodejs-icon.svg" },
  { name: "Firebase", url: "https://cdn.worldvectorlogo.com/logos/firebase-1.svg" },
];

export default function TechStack() {
  return (
    <section className="py-24 bg-[#050505] border-y border-white/5 overflow-hidden">
      <ScrollReveal className="container mx-auto px-6 mb-12 text-center">
        <h2 className="text-sm font-mono text-blue-500 uppercase tracking-widest mb-4">Our Core Stack</h2>
        <p className="text-2xl text-white font-light">Engineered with the world's most powerful tools.</p>
      </ScrollReveal>

      <ScrollReveal direction="none" delay={0.2} className="relative flex overflow-x-hidden">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="flex whitespace-nowrap gap-16 py-8"
        >
          {[...logos, ...logos].map((logo, i) => (
            <div key={i} className="flex items-center gap-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-500 cursor-pointer group glass px-6 py-3 rounded-xl glass-hover">
              <img src={logo.url} alt={logo.name} className="h-8 w-auto" referrerPolicy="no-referrer" />
              <span className="text-white font-mono text-lg group-hover:text-blue-400">{logo.name}</span>
            </div>
          ))}
        </motion.div>
      </ScrollReveal>

      <ScrollReveal className="mt-16 text-center">
        <button 
          onClick={() => document.getElementById('discovery')?.scrollIntoView({ behavior: 'smooth' })}
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors group"
        >
          <span className="text-sm font-medium">Check Compatibility</span>
          <div className="w-8 h-px bg-gray-700 group-hover:bg-blue-400 transition-colors" />
        </button>
      </ScrollReveal>
    </section>
  );
}
