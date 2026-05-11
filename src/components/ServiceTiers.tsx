import { motion } from "motion/react";
import { Rocket, Shield, Cpu, CheckCircle2, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import ScrollReveal from "./ScrollReveal";

interface Service {
  id: string;
  title: string;
  price: string;
  description: string;
  deliverables: string[];
  cta: string;
  color: string;
}

const fallbackTiers: Service[] = [
  {
    id: "1",
    title: "MVP Launch",
    price: "From $5k",
    description: "Perfect for startups needing to validate their idea rapidly.",
    deliverables: ["Product Strategy", "Core Feature Set", "UI/UX Design", "Cloud Deployment"],
    cta: "Start MVP Path",
    color: "blue"
  },
  {
    id: "2",
    title: "Enterprise Scaling",
    price: "Custom",
    description: "Robust systems built for high-traffic and complex workflows.",
    deliverables: ["Microservices Architecture", "Advanced Security", "Performance Audit", "24/7 Support"],
    cta: "Scale Now",
    color: "purple"
  },
  {
    id: "3",
    title: "Custom Systems",
    price: "Quote",
    description: "Bespoke software solutions for unique business challenges.",
    deliverables: ["Custom AI Integration", "Legacy Migration", "IoT Solutions", "Dedicated Team"],
    cta: "Get Custom Quote",
    color: "emerald"
  }
];

const iconMap: Record<string, any> = {
  blue: Rocket,
  purple: Shield,
  emerald: Cpu
};

export default function ServiceTiers({ onSelect, onCustomWizard }: { onSelect: () => void, onCustomWizard: () => void }) {
  const [tiers, setTiers] = useState<Service[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "services"), (snapshot) => {
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Service));
      setTiers(fetched.length > 0 ? fetched : fallbackTiers);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, "services");
      setTiers(fallbackTiers);
    });
    return () => unsubscribe();
  }, []);

  return (
    <section id="services" className="py-32 bg-[#050505] px-6">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">Vortex Service Tiers</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">Select the trajectory that fits your current stage of evolution.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier, i) => {
            const Icon = iconMap[tier.color] || Rocket;
            return (
              <ScrollReveal
                key={tier.id}
                delay={i * 0.1}
                className="relative group p-8 rounded-2xl glass glass-hover transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 glass`} style={{ backgroundColor: `${tier.color === 'blue' ? 'rgba(59, 130, 246, 0.1)' : tier.color === 'purple' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(16, 185, 129, 0.1)'}` }}>
                    <Icon className="w-8 h-8" style={{ color: tier.color === 'blue' ? '#60a5fa' : tier.color === 'purple' ? '#c084fc' : '#34d399' }} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-2">{tier.title}</h3>
                  <div className="text-xl font-mono text-blue-400 mb-4">{tier.price}</div>
                  <p className="text-gray-400 mb-8 text-sm leading-relaxed">{tier.description}</p>
                  
                  <ul className="space-y-4 mb-10">
                    {tier.deliverables?.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  <button 
                    onClick={onSelect}
                    className="w-full py-4 rounded-lg glass text-white font-bold hover:bg-blue-600 transition-all duration-300"
                  >
                    {tier.cta}
                  </button>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal 
          className="p-8 rounded-3xl glass border-blue-600/20 text-center max-w-3xl mx-auto"
        >
          <h3 className="text-2xl font-bold text-white mb-4">Need a Bespoke Solution?</h3>
          <p className="text-gray-400 mb-8">Use our interactive service customizer to build your own package and get an instant price estimate.</p>
          <button 
            onClick={onCustomWizard}
            className="px-10 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 mx-auto"
          >
            Launch Service Customizer <ChevronRight className="w-5 h-5" />
          </button>
        </ScrollReveal>
      </div>
    </section>
  );
}
