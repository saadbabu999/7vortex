import React from "react";
import { motion } from "motion/react";
import { Quote } from "lucide-react";
import ScrollReveal from "./ScrollReveal";

const testimonials = [
  {
    name: "Alex Thompson",
    role: "CEO, TechFlow",
    content: "7Vortex transformed our digital presence. Their attention to detail and technical expertise is unmatched.",
    avatar: "https://i.pravatar.cc/150?u=alex"
  },
  {
    name: "Sarah Chen",
    role: "Product Manager, Innovate",
    content: "The identity verification system they built for us is seamless and secure. Highly recommend their services.",
    avatar: "https://i.pravatar.cc/150?u=sarah"
  },
  {
    name: "Michael Ross",
    role: "Founder, Ross Digital",
    content: "Fast, reliable, and incredibly professional. They delivered our project ahead of schedule with zero issues.",
    avatar: "https://i.pravatar.cc/150?u=michael"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tight">Client Success Stories</h2>
          <p className="text-gray-500 max-w-2xl mx-auto">Don't just take our word for it. Here's what our partners have to say about working with 7Vortex.</p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <ScrollReveal
              key={i}
              delay={i * 0.1}
              className="p-8 rounded-2xl glass glass-hover border-white/10 flex flex-col gap-6"
            >
              <Quote className="w-10 h-10 text-blue-600/40" />
              <p className="text-gray-300 italic leading-relaxed">"{t.content}"</p>
              <div className="flex items-center gap-4 mt-auto">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border border-white/10" />
                <div>
                  <h4 className="text-white font-bold">{t.name}</h4>
                  <p className="text-gray-500 text-xs">{t.role}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
