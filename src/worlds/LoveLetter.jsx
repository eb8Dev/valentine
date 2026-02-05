import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, X } from "lucide-react";
import confetti from "canvas-confetti";

function TypewriterText({ text, speed = 30, onComplete, className }) {
  const [displayed, setDisplayed] = useState("");
  
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);
    return () => clearInterval(timer);
  }, [text, speed, onComplete]);

  return <p className={className}>{displayed}</p>;
}

export default function LoveLetter({ from, to, msg, reasons, about, whyValentine, template, onBack }) {
  const [step, setStep] = useState(0); // 0: Envelope, 1: Letter Open (About), 2: Reasons, 3: Why Val, 4: Final

  // Step logic
  const steps = [
    { id: 'envelope' },
    ...(about ? [{ id: 'about', content: about }] : []),
    ...(reasons.length > 0 ? [{ id: 'reasons', content: reasons }] : []),
    ...(whyValentine ? [{ id: 'whyValentine', content: whyValentine }] : []),
    { id: 'final', content: msg }
  ];

  const currentStepData = steps[step] || steps[0];
  const accentColor = template?.accent || '#991b1b'; // Default to deep red

  useEffect(() => {
    if (step === steps.length - 1) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: [accentColor, '#ffffff']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: [accentColor, '#ffffff']
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [step, steps.length, accentColor]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] flex flex-col items-center justify-center p-4 relative overflow-hidden font-courier text-[#333]">
      {/* Wood/Desk Texture Background */}
      <div className="absolute inset-0 bg-[#d4c4a8] opacity-100" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/wood-pattern.png")' }}></div>
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="absolute top-6 left-6 z-50">
         <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity text-black">
           <X size={16} /> Close Letter
         </button>
      </div>

      <AnimatePresence mode="wait">
        {step === 0 ? (
          <motion.div
            key="envelope"
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.5, opacity: 0, rotate: 10 }}
            className="cursor-pointer group relative"
            onClick={() => setStep(1)}
          >
             <div className="w-80 h-52 bg-[#fdfbf7] shadow-2xl rounded-lg flex items-center justify-center relative overflow-hidden border border-gray-200">
               {/* Envelope Flap */}
               <div className="absolute top-0 left-0 w-full h-full border-l-[160px] border-r-[160px] border-t-[140px] border-l-transparent border-r-transparent border-t-red-50/50 z-10"></div>
               <div className="absolute bottom-0 left-0 w-full h-full border-l-[160px] border-r-[160px] border-b-[140px] border-l-transparent border-r-transparent border-b-[#fdfbf7] z-20 shadow-sm"></div>
               
               {/* Wax Seal */}
               <motion.div 
                 whileHover={{ scale: 1.1 }}
                 className="absolute z-30 w-16 h-16 rounded-full flex items-center justify-center shadow-lg border-4 border-black/10"
                 style={{ backgroundColor: accentColor }}
               >
                 <Heart className="text-white/90 fill-white/20" size={24} />
               </motion.div>
               
               <p className="absolute bottom-6 z-30 text-xs font-bold tracking-widest uppercase opacity-40">For {to}</p>
             </div>
             <p className="text-center mt-8 font-dancing text-2xl text-white drop-shadow-md animate-bounce">Tap to open</p>
          </motion.div>
        ) : (
          <motion.div
            key="letter"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-lg bg-[#fdfbf7] shadow-2xl p-8 md:p-12 relative min-h-[60vh] flex flex-col"
            style={{ 
              boxShadow: "0 0 50px rgba(0,0,0,0.1), inset 0 0 60px rgba(0,0,0,0.02)"
            }}
          >
            {/* Paper texture noise overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            <div className="flex-1 space-y-6 relative z-10">
              <div className="flex justify-between items-start border-b border-gray-200 pb-4 mb-6">
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Date: {new Date().toLocaleDateString()}</p>
                 <p className="text-xs font-bold uppercase tracking-widest text-gray-400">To: {to}</p>
              </div>

              <div className="min-h-[200px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {currentStepData.id === 'about' && (
                      <div className="space-y-4">
                        <p className="font-playfair text-3xl italic text-gray-800">My Dearest {to},</p>
                        <TypewriterText text={currentStepData.content} className="text-lg leading-relaxed text-gray-700" />
                      </div>
                    )}

                    {currentStepData.id === 'reasons' && (
                      <div className="space-y-4">
                        <p className="text-sm font-bold uppercase tracking-widest opacity-60 mb-4" style={{ color: accentColor }}>Reasons I Adore You</p>
                        <ul className="space-y-4">
                          {currentStepData.content.map((r, i) => (
                            <motion.li 
                              key={i}
                              initial={{ x: -10, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: i * 0.5 }}
                              className="flex gap-3 text-lg leading-snug text-gray-700"
                            >
                              <span className="font-bold" style={{ color: accentColor }}>—</span> {r}
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {currentStepData.id === 'whyValentine' && (
                      <div className="space-y-6">
                        <p className="font-playfair text-2xl italic text-gray-800 text-center">"{template.question}"</p>
                        <div 
                          className="p-6 border-l-2 italic text-gray-700 leading-relaxed text-lg"
                          style={{ backgroundColor: `${accentColor}10`, borderColor: `${accentColor}40` }}
                        >
                           {currentStepData.content}
                        </div>
                      </div>
                    )}

                    {currentStepData.id === 'final' && (
                      <div className="text-center space-y-8 py-8">
                        <p className="font-playfair text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                          {currentStepData.content}
                        </p>
                        <div className="pt-12">
                          <p className="font-dancing text-2xl text-gray-500">Forever yours,</p>
                          <p className="font-dancing text-5xl mt-2 rotate-[-2deg]" style={{ color: accentColor }}>{from}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {step < steps.length - 1 && (
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setStep(s => s + 1)}
                  className="group flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors"
                  style={{ color: accentColor }}
                >
                  Next Page <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}