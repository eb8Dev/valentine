import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Quote, Sparkles, Plus } from "lucide-react";
import confetti from "canvas-confetti";
import Tilt from 'react-parallax-tilt';
import { vibes } from "../data/config";
import VibeParticles from "../components/VibeParticles";

function HeartTrail() {
  const [points, setPoints] = useState([]);
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const newPoint = { x: e.clientX, y: e.clientY, id: Date.now() };
      setPoints(prev => [...prev.slice(-10), newPoint]);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100]">
      {points.map((p, i) => (
        <motion.div
          key={p.id}
          className="absolute text-rose-400/40"
          initial={{ scale: 1, opacity: 0.4 }}
          animate={{ scale: 0, opacity: 0 }}
          style={{ left: p.x, top: p.y }}
          transition={{ duration: 0.6 }}
        >
          <Heart size={8 + i} fill="currentColor" />
        </motion.div>
      ))}
    </div>
  );
}

export default function ClassicCards({ from, to, msg, vibe, template, reasons, about, whyValentine, onBack }) {
  const [step, setStep] = useState(0);

  const currentVibe = useMemo(() => {
    const base = vibes[vibe] || vibes.soft;
    // Allow template to override colors/theme if present
    if (template?.theme) {
      return {
        ...base,
        // Override accent color (used for icons/highlights)
        accent: template.theme.primary || base.accent, 
        // Override button style
        button: template.theme.button || base.button,
        // Optional: Override background if specified in template (requires care with text colors)
        // For now, we keep the vibe's background/text to ensure contrast, 
        // unless we want to map template.bg to replace base.className's bg.
        // Let's stick to accents for high impact with low risk.
      };
    }
    return base;
  }, [vibe, template]);
  
  const journeySteps = useMemo(() => {
    const steps = [{ type: 'intro' }];
    if (about) steps.push({ type: 'about' });
    if (reasons && reasons.length > 0) steps.push({ type: 'reasons' });
    if (whyValentine) steps.push({ type: 'whyValentine' });
    steps.push({ type: 'final' });
    return steps;
  }, [about, reasons, whyValentine]);

  const triggerConfetti = useCallback(() => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const colors = [currentVibe.particleColor, '#ffffff', '#ffd1dc'];

    (function frame() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return;
      confetti({ 
        particleCount: 2, 
        spread: 80, 
        origin: { x: Math.random(), y: Math.random() - 0.2 }, 
        colors,
        shapes: ['circle', 'heart'],
        scalar: 1
      });
      requestAnimationFrame(frame);
    }());
  }, [currentVibe.particleColor]);

  useEffect(() => {
    if (step === journeySteps.length - 1) {
      triggerConfetti();
    }
  }, [step, journeySteps.length, triggerConfetti]);

  const currentJourneyStep = journeySteps[step];
  const Icon = template.icon || Heart;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-1000 overflow-hidden relative ${currentVibe.className}`}
    >
      <VibeParticles type={currentVibe.animationType} color={currentVibe.particleColor} />
      <HeartTrail />
      
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-[60]">
        <motion.div 
          className={`h-full ${currentVibe.accent.replace('text', 'bg')}`}
          initial={{ width: "0%" }}
          animate={{ width: `${((step + 1) / journeySteps.length) * 100}%` }}
          transition={{ type: "spring", stiffness: 50 }}
        />
      </div>

      <div className="absolute top-6 left-6 z-50">
         <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity">
           <Plus className="rotate-45" size={12} /> New Journey
         </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.8, rotateX: -10 }}
          animate={{ opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ opacity: 0, scale: 1.1, rotateX: 10 }}
          transition={{ type: "spring", damping: 20 }}
          className="perspective-1000"
        >
          <Tilt
            tiltMaxAngleX={5}
            tiltMaxAngleY={5}
            perspective={1000}
            transitionSpeed={1500}
            scale={1.02}
            className={`max-w-xl w-full p-8 md:p-12 rounded-[32px] border shadow-xl text-center space-y-8 relative overflow-hidden transform-style-3d ${currentVibe.cardClass}`}
          >
            {currentJourneyStep.type === 'intro' && (
              <div className="space-y-6">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }} 
                  transition={{ repeat: Infinity, duration: 3 }} 
                  className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${currentVibe.accent} bg-current/10`}
                >
                  <Icon size={48} strokeWidth={1.5} />
                </motion.div>
                <div className="space-y-3">
                  <p className="uppercase tracking-[0.4em] text-[10px] font-black opacity-40">For {to}</p>
                  <h1 className={`text-4xl md:text-5xl font-black tracking-tight leading-tight ${currentVibe.font}`}>{template.title}</h1>
                  <p className="text-xl md:text-2xl font-light italic opacity-80 leading-relaxed">"{template.description}"</p>
                </div>
              </div>
            )}

            {currentJourneyStep.type === 'about' && (
              <div className="space-y-6">
                <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center bg-white/10 ${currentVibe.accent}`}>
                  <Quote size={24} />
                </div>
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center">Our Story</h2>
                  <p className="text-xl md:text-2xl font-serif italic leading-relaxed px-4">"{about}"</p>
                </div>
              </div>
            )}

            {currentJourneyStep.type === 'reasons' && (
              <div className="space-y-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center">Why You're Special</h2>
                <div className="grid gap-3 text-left max-w-sm mx-auto">
                  {reasons.map((reason, i) => (
                    <motion.div 
                      initial={{ x: -20, opacity: 0 }} 
                      animate={{ x: 0, opacity: 1 }} 
                      transition={{ delay: i * 0.2 + 0.3 }}
                      key={i} 
                      className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5 shadow-sm backdrop-blur-md hover:bg-white/10 transition-colors"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-white/10 ${currentVibe.accent}`}>
                        <Heart size={14} fill="currentColor" />
                      </div>
                      <span className="text-lg font-medium tracking-tight leading-tight">{reason}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {currentJourneyStep.type === 'whyValentine' && (
              <div className="space-y-6">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className={`mx-auto w-16 h-16 flex items-center justify-center ${currentVibe.accent}`}>
                  <Sparkles size={48} />
                </motion.div>
                <div className="space-y-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 text-center">The Question</h2>
                  <p className={`text-xl md:text-3xl font-serif italic leading-snug ${currentVibe.accent}`}>"{template.question}"</p>
                  {whyValentine && <p className="text-base opacity-70 mt-4">"{whyValentine}"</p>}
                </div>
              </div>
            )}

            {currentJourneyStep.type === 'final' && (
              <div className="space-y-8">
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 2 }} 
                  className={`mx-auto w-20 h-20 flex items-center justify-center ${currentVibe.accent}`}
                >
                  <Heart size={80} fill="currentColor" />
                </motion.div>
                <div className="space-y-4">
                  <h1 className={`text-5xl md:text-6xl font-black tracking-tight leading-none ${currentVibe.font}`}>{to}</h1>
                  <p className={`text-xl md:text-3xl leading-relaxed ${currentVibe.finalMsgFont}`}>"{msg || "You are my forever."}"</p>
                </div>
                <div className="pt-8 border-t border-white/10">
                  <p className="opacity-40 italic text-base font-light">With all my love,</p>
                  <p className={`text-3xl md:text-4xl font-black ${currentVibe.accent} ${currentVibe.font} mt-2`}>{from}</p>
                </div>
              </div>
            )}

            <button 
              onClick={(e) => {
                e.stopPropagation(); // Prevent tilt click issues
                setStep(s => Math.min(s + 1, journeySteps.length - 1));
              }}
              className={`w-full py-4 rounded-2xl font-black text-lg transition-all active:scale-95 flex items-center justify-center gap-3 ${currentVibe.button} ${step === journeySteps.length - 1 ? 'hidden' : ''}`}
            >
              {step === 0 ? "Open Surprise" : "Continue"} <ArrowRight size={18} />
            </button>
          </Tilt>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}