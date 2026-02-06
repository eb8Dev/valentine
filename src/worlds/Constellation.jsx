import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Star, Heart, ArrowRight, Sparkles } from "lucide-react";
import confetti from "canvas-confetti";

function StarField() {
  const [stars] = useState(() => Array.from({ length: 50 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 3 + 2,
    delay: Math.random() * 2
  })));

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {stars.map(s => (
        <motion.div
          key={s.id}
          className="absolute bg-white rounded-full"
          style={{ 
            left: `${s.x}%`, 
            top: `${s.y}%`, 
            width: s.size, 
            height: s.size 
          }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.duration, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function ConstellationLine({ from, to, visible }) {
  if (!from || !to) return null;
  
  // Calculate angle and length
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * 180 / Math.PI;

  return (
    <div 
      className="absolute bg-white/20 origin-left transition-all duration-1000 ease-in-out"
      style={{
        left: `calc(50% + ${from.x}px)`,
        top: `calc(50% + ${from.y}px)`,
        width: visible ? `${length}px` : '0px',
        height: '1px',
        transform: `rotate(${angle}deg)`,
        opacity: visible ? 1 : 0
      }}
    />
  );
}

export default function Constellation({ from, to, msg, reasons = [], moments = [], photos = [], about, template, onBack }) {
  const [step, setStep] = useState(0);
  
  // Consolidate reasons, moments, and photos for the "Stars" journey
  const starsContent = useMemo(() => {
    let items = [];

    // 1. Add Moments
    if (moments && moments.length > 0) {
      items = moments.map(m => ({
        text: m.title ? `${m.title}: ${m.description}` : m.description,
        photo: m.photo
      }));
    } else if (reasons && reasons.length > 0) {
       // Fallback to reasons if no moments
       items = reasons.map(r => ({ text: r, photo: null }));
    }

    // 2. Add orphan Photos (photos not used in moments, or just all photos as extra stars)
    // To avoid duplicates if moments already used the photos, we could filter, 
    // but simpler to just add them as "Memory" stars if we want to ensure they are seen.
    // Let's add independent photos that likely aren't in the moments.
    // Or simpler: Just append all photos from the 'photos' prop as extra stars.
    // To avoid overwhelming, we can check if the photo is already used? 
    // No, standard behavior: Show 'moments' then show 'photos' (Memories).
    
    if (photos && photos.length > 0) {
       const photoStars = photos.map(p => ({
          text: "A beautiful memory...",
          photo: p
       }));
       items = [...items, ...photoStars];
    }

    return items;
  }, [reasons, moments, photos]);

  // Define the journey: Intro -> About -> Stars (one by one) -> Final
  const journey = useMemo(() => {
    const steps = [
      { type: 'intro' },
      ...(about ? [{ type: 'about' }] : []),
      ...starsContent.map((item, i) => ({ type: 'star', content: item.text, photo: item.photo, index: i })),
      { type: 'final' }
    ];
    return steps;
  }, [about, starsContent]);

  const [starPositions] = useState(() => {
    return Array.from({ length: 20 }).map(() => ({
      x: (Math.random() - 0.5) * 600,
      y: (Math.random() - 0.5) * 400
    }));
  });

  const currentStep = journey[step];
  const isFinal = step === journey.length - 1;

  useEffect(() => {
    if (isFinal) {
      const duration = 3000;
      const end = Date.now() + duration;
      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#fbbf24', '#ffffff']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#fbbf24', '#ffffff']
        });
        requestAnimationFrame(frame);
      };
      frame();
    }
  }, [isFinal]);

  const nextStep = () => {
    if (step < journey.length - 1) setStep(s => s + 1);
  };

  return (
    <div className="min-h-screen bg-[#050b14] text-white font-cinzel overflow-hidden relative flex flex-col items-center justify-center p-6 selection:bg-amber-500/30">
      <StarField />
      
      {/* Background radial gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-indigo-950/40 via-[#050b14] to-[#050b14] -z-20"></div>

      {/* Constellation Lines */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center">
        {starPositions.map((pos, i) => {
          if (i >= starPositions.length - 1) return null;
          return (
            <ConstellationLine 
              key={i} 
              from={pos} 
              to={starPositions[i+1]} 
              visible={step > i} 
            />
          );
        })}
      </div>

      <div className="fixed top-8 left-8 z-50">
         <button onClick={onBack} className="text-white/40 hover:text-white transition-colors text-xs uppercase tracking-[0.2em] flex items-center gap-2">
           <ArrowRight className="rotate-180" size={14} /> Back to Earth
         </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.8, filter: "blur(10px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "anticipate" }}
          className="relative z-10 max-w-2xl text-center space-y-8"
        >
          {currentStep.type === 'intro' && (
            <div className="space-y-6">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
                className="w-px h-px shadow-[0_0_100px_40px_rgba(251,191,36,0.2)] rounded-full mx-auto"
              ></motion.div>
              <h2 className="text-amber-200/60 text-sm tracking-[0.5em] uppercase">{template?.title || "A Journey For"}</h2>
              <h1 className="text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-linear-to-b from-amber-100 to-amber-500/50 filter drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                {to}
              </h1>
              <p className="text-lg text-white/60 font-sans font-light max-w-md mx-auto leading-relaxed">
                "{template?.description || "Look at the stars. Look how they shine for you."}"
              </p>
              <button onClick={nextStep} className="group relative px-8 py-3 bg-transparent overflow-hidden rounded-full border border-amber-500/30 hover:border-amber-500/80 transition-all mt-8">
                <div className="absolute inset-0 bg-amber-500/10 group-hover:bg-amber-500/20 transition-all"></div>
                <span className="relative flex items-center gap-3 text-amber-100 uppercase tracking-widest text-xs font-bold">
                  Begin Journey <Star size={12} className="fill-amber-100" />
                </span>
              </button>
            </div>
          )}

          {currentStep.type === 'about' && (
            <div className="space-y-6 bg-black/40 p-10 rounded-[40px] border border-white/5 backdrop-blur-md shadow-2xl">
              <Sparkles className="w-8 h-8 text-amber-300 mx-auto opacity-80" />
              <h3 className="text-amber-200/40 text-xs tracking-[0.4em] uppercase">Our Beginning</h3>
              <p className="text-xl md:text-3xl font-light leading-relaxed italic text-amber-50 font-serif">
                "{about}"
              </p>
              <button onClick={nextStep} className="mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                <ArrowRight size={16} className="text-white/60" />
              </button>
            </div>
          )}

          {currentStep.type === 'star' && (
            <div className="relative flex flex-col items-center gap-8">
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 text-amber-500/20 -z-10">
                <Star size={100} strokeWidth={0.5} />
              </div>
              <h3 className="text-amber-200/40 text-xs tracking-[0.4em] uppercase">Star #{currentStep.index + 1}</h3>
              
              {currentStep.photo && (
                <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.3)]">
                    <img src={currentStep.photo} alt="Memory" className="w-full h-full object-cover" />
                </div>
              )}

              <p className="text-2xl md:text-4xl font-bold tracking-wide leading-tight text-white drop-shadow-lg max-w-lg">
                {currentStep.content}
              </p>
               <button onClick={nextStep} className="mt-4 mx-auto w-12 h-12 rounded-full border border-amber-500/30 flex items-center justify-center hover:bg-amber-500/20 hover:scale-110 transition-all">
                <Star size={16} className="text-amber-200 fill-amber-200" />
              </button>
            </div>
          )}

          {currentStep.type === 'final' && (
            <div className="space-y-8">
               <motion.div 
                 initial={{ scale: 0 }} 
                 animate={{ scale: 1 }} 
                 transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
                 className="w-32 h-32 mx-auto bg-linear-to-tr from-amber-400 to-orange-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(245,158,11,0.5)]"
               >
                 <Heart size={64} className="text-white fill-white" />
               </motion.div>
               
               <div>
                 <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white to-amber-200/50">
                   {to}
                 </h1>
                 <p className="mt-6 text-xl md:text-3xl text-amber-100 font-light italic">
                   "{template?.question || "Will you be my Valentine?"}"
                 </p>
                 <p className="mt-4 text-lg text-white/50">"{msg}"</p>
               </div>

               <div className="pt-12 border-t border-white/5 mt-8">
                  <p className="text-xs tracking-[0.3em] uppercase opacity-50">Written in the stars by</p>
                  <p className="text-2xl mt-3 font-bold text-amber-500">{from}</p>
               </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}