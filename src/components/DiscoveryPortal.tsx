import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import ScrollReveal from "./ScrollReveal";

const steps = [
  {
    id: "type",
    title: "What are we building?",
    options: ["Web Application", "Mobile App", "Enterprise System", "AI Integration"]
  },
  {
    id: "budget",
    title: "Estimated Budget",
    options: ["$5k - $15k", "$15k - $50k", "$50k - $150k", "$150k+"]
  },
  {
    id: "timeline",
    title: "Launch Timeline",
    options: ["ASAP", "1-3 Months", "3-6 Months", "6+ Months"]
  }
];

export default function DiscoveryPortal({ id }: { id: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelect = (option: string) => {
    setAnswers({ ...answers, [steps[currentStep].id]: option });
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmit = async () => {
    if (!email) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "leads"), {
        ...answers,
        email,
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "leads");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id={id} className="py-32 bg-[#0a0a0a] px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="max-w-3xl mx-auto relative z-10">
        <ScrollReveal className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Discovery Portal</h2>
          <p className="text-gray-400">Let's qualify your project and find the optimal vortex path.</p>
        </ScrollReveal>

        <ScrollReveal direction="none" delay={0.2} className="glass rounded-3xl p-8 md:p-12 min-h-[400px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            {!isSubmitted ? (
              <motion.div
                key={currentStep === steps.length ? "final" : currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep < steps.length ? (
                  <>
                    <div className="flex items-center justify-between mb-8">
                      <span className="text-xs font-mono text-blue-500 uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</span>
                      {currentStep > 0 && (
                        <button 
                          onClick={() => setCurrentStep(currentStep - 1)}
                          className="text-gray-500 hover:text-white flex items-center gap-1 text-sm transition-colors"
                        >
                          <ArrowLeft className="w-4 h-4" /> Back
                        </button>
                      )}
                    </div>

                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-10">{steps[currentStep].title}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {steps[currentStep].options.map((option, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleSelect(option)}
                          className={`p-6 rounded-xl border text-left transition-all duration-300 ${
                            answers[steps[currentStep].id] === option 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'glass glass-hover text-gray-300 hover:border-blue-500/50'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <h3 className="text-3xl font-bold text-white mb-4">Final Step</h3>
                    <p className="text-gray-400 mb-10 leading-relaxed">
                      Enter your email to receive your custom project roadmap.
                    </p>
                    <div className="flex flex-col gap-4">
                      <div className="p-4 rounded-xl glass border-white/10 text-left">
                        <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Work Email</label>
                        <input 
                          type="email" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@company.com" 
                          className="w-full bg-transparent border-none text-white focus:ring-0 p-0 placeholder:text-gray-700 outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleSubmit}
                        disabled={isSubmitting || !email}
                        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-600/20 transition-all duration-300"
                      >
                        {isSubmitting ? "Submitting..." : "Submit Project"} <ArrowRight className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setCurrentStep(steps.length - 1)}
                        className="text-gray-500 hover:text-white text-sm"
                      >
                        Go Back
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-8 glass">
                  <CheckCircle2 className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-4">Discovery Complete</h3>
                <p className="text-gray-400 mb-10 leading-relaxed">
                  We've received your project details. Our architects are reviewing your {answers.type} requirements for a {answers.budget} budget.
                </p>
                <button 
                  onClick={() => {
                    setIsSubmitted(false);
                    setCurrentStep(0);
                    setAnswers({});
                    setEmail("");
                  }}
                  className="px-8 py-3 rounded-full glass text-white glass-hover transition-all duration-300"
                >
                  Start New Discovery
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollReveal>
      </div>
    </section>
  );
}
