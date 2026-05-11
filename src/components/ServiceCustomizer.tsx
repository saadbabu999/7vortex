import { motion, AnimatePresence } from "motion/react";
import { Check, ChevronRight, ChevronLeft, Calculator, Rocket, Shield, Zap, Globe, Cpu, Smartphone } from "lucide-react";
import { useState } from "react";

interface Feature {
  id: string;
  label: string;
  price: number;
  icon: any;
  description: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  features: Feature[];
}

const steps: Step[] = [
  {
    id: "platform",
    title: "Choose Your Platform",
    description: "Where will your solution live?",
    features: [
      { id: "web", label: "Web Application", price: 2500, icon: Globe, description: "Scalable SaaS or enterprise portal" },
      { id: "mobile", label: "Mobile App", price: 3500, icon: Smartphone, description: "Native iOS & Android experience" },
      { id: "ai", label: "AI Integration", price: 4500, icon: Cpu, description: "Custom LLM or predictive analytics" },
    ]
  },
  {
    id: "performance",
    title: "Performance & Scale",
    description: "How fast do you need to go?",
    features: [
      { id: "standard", label: "Standard", price: 0, icon: Zap, description: "Optimized for initial growth" },
      { id: "high", label: "High Performance", price: 1200, icon: Rocket, description: "Edge computing & global CDN" },
      { id: "enterprise", label: "Enterprise Grade", price: 2800, icon: Shield, description: "Multi-region redundancy & 99.9% SLA" },
    ]
  },
  {
    id: "security",
    title: "Security & Compliance",
    description: "Protecting your digital assets.",
    features: [
      { id: "basic", label: "Essential Security", price: 0, icon: Shield, description: "SSL, basic firewall & encryption" },
      { id: "advanced", label: "Advanced Protection", price: 800, icon: Shield, description: "DDoS protection & regular audits" },
      { id: "compliance", label: "Full Compliance", price: 2000, icon: Shield, description: "HIPAA, GDPR or SOC2 readiness" },
    ]
  }
];

export default function ServiceCustomizer({ onComplete }: { onComplete: (total: number, config: any) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const handleSelect = (stepId: string, featureId: string) => {
    setSelections(prev => ({ ...prev, [stepId]: featureId }));
  };

  const calculateTotal = () => {
    return Object.entries(selections).reduce((total, [stepId, featureId]) => {
      const step = steps.find(s => s.id === stepId);
      const feature = step?.features.find(f => f.id === featureId);
      return total + (feature?.price || 0);
    }, 0);
  };

  const isStepComplete = (stepIndex: number) => {
    return !!selections[steps[stepIndex].id];
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete(calculateTotal(), selections);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const total = calculateTotal();

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Header */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center gap-4">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 ${
              index === currentStep ? 'bg-blue-600 text-white scale-110 shadow-lg shadow-blue-600/20' : 
              index < currentStep ? 'bg-emerald-500 text-white' : 'bg-white/5 text-gray-600'
            }`}>
              {index < currentStep ? <Check className="w-4 h-4" /> : index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-px hidden md:block ${index < currentStep ? 'bg-emerald-500' : 'bg-white/5'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">{steps[currentStep].title}</h3>
                <p className="text-gray-400">{steps[currentStep].description}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {steps[currentStep].features.map((feature) => {
                  const Icon = feature.icon;
                  const isSelected = selections[steps[currentStep].id] === feature.id;

                  return (
                    <button
                      key={feature.id}
                      onClick={() => handleSelect(steps[currentStep].id, feature.id)}
                      className={`p-6 rounded-2xl border text-left transition-all duration-300 flex items-center gap-6 group ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-600 shadow-lg shadow-blue-600/10' 
                          : 'glass border-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-white">{feature.label}</span>
                          <span className="text-sm font-mono text-blue-400">
                            {feature.price === 0 ? "Included" : `+$${feature.price}`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-white/10'
                      }`}>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between mt-12 pt-8 border-t border-white/5">
            <button
              onClick={handleBack}
              disabled={currentStep === 0}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors disabled:opacity-0"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
            <button
              onClick={handleNext}
              disabled={!isStepComplete(currentStep)}
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
            >
              {currentStep === steps.length - 1 ? "Get Final Quote" : "Continue"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-4">
          <div className="sticky top-32 p-8 rounded-3xl glass border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Calculator className="w-32 h-32 text-white" />
            </div>
            
            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-500" />
              Instant Estimate
            </h4>

            <div className="space-y-4 mb-8">
              {steps.map((step) => {
                const selection = selections[step.id];
                const feature = step.features.find(f => f.id === selection);
                
                return (
                  <div key={step.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-500">{step.title.split(' ').pop()}</span>
                    <span className={feature ? "text-white font-medium" : "text-gray-700 italic"}>
                      {feature ? feature.label : "Not selected"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex justify-between items-end">
                <span className="text-xs text-gray-500 uppercase tracking-widest font-mono">Estimated Total</span>
                <span className="text-3xl font-bold text-white tracking-tighter">${total}</span>
              </div>
              <p className="text-[10px] text-gray-600 mt-4 italic leading-relaxed">
                * This is an automated estimate. Final pricing may vary based on specific technical requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
