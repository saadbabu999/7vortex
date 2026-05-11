import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight } from "lucide-react";
import { useRef } from "react";

export default function Hero({ onLaunch }: { onLaunch: () => void }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center justify-center bg-[#050505] overflow-hidden px-6">
      {/* Background Grid/Vortex Effect */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <motion.div style={{ y: y1 }} className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
        <motion.div style={{ y: y2 }} className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <motion.div style={{ opacity }} className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.21, 0.47, 0.32, 0.98] }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-widest uppercase glass border-blue-500/30 rounded-full text-blue-400">
            The Future of Digital
          </span>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-8 leading-[0.9]">
            Accelerating <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
              Digital Evolution.
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
            We build high-performance digital ecosystems that scale with your vision. 
            From MVP launches to enterprise-grade systems, 7Vortex is your technical architect.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)" }}
              whileTap={{ scale: 0.95 }}
              onClick={onLaunch}
              className="px-8 py-4 bg-blue-600 text-white font-bold rounded-lg flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-600/20"
            >
              Launch Your Project <ArrowRight className="w-5 h-5" />
            </motion.button>
            <button 
              onClick={() => document.getElementById('portfolio')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 text-gray-400 hover:text-white transition-all font-medium glass rounded-lg glass-hover"
            >
              Explore Our Tech
            </button>
          </div>
        </motion.div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div 
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-1/2 -translate-x-1/2 text-gray-600"
      >
        <div className="w-px h-24 bg-gradient-to-b from-transparent via-gray-600 to-transparent" />
      </motion.div>
    </section>
  );
}
