import { useEffect, useMemo, useState, useRef } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Stars, PenTool, ArrowRight, Lock, Calendar, Plus, Trash2, Link as LinkIcon, Image as ImageIcon, Disc, Framer, Volume2, VolumeX
} from "lucide-react";
import Constellation from "./worlds/Constellation";
import LoveLetter from "./worlds/LoveLetter";
import Timeline from "./worlds/Timeline";
import MusicBox from "./worlds/MusicBox";
import Gallery from "./worlds/Gallery";
import { encodeData, decodeData } from "./utils/share";
import VibeParticles from "./components/VibeParticles";
import music from "./assets/sonican-cinematic-for-love-romantic-drama-music-loop-433483.mp3";

const worlds = {
  timeline: {
    id: "timeline",
    label: "Our Timeline",
    description: "A cinematic vertical journey through your best moments.",
    icon: Calendar,
    component: Timeline
  },
  gallery: {
    id: "gallery",
    label: "The Museum",
    description: "A horizontal art gallery exhibition of your memories.",
    icon: Framer,
    component: Gallery
  },
  musicbox: {
    id: "musicbox",
    label: "The Mix Tape",
    description: "A nostalgic vinyl experience where memories play as tracks.",
    icon: Disc,
    component: MusicBox
  },
  cosmic: {
    id: "cosmic",
    label: "The Constellation",
    description: "A journey through the stars to connect your love.",
    icon: Stars,
    component: Constellation
  },
  vintage: {
    id: "vintage",
    label: "The Love Letter",
    description: "A classic, typewriter-style letter on a wooden desk.",
    icon: PenTool,
    component: LoveLetter
  }
};

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");

  const defaults = {
    from: "", 
    to: "", 
    msg: "", 
    world: "timeline",
    question: "Will you be my Valentine?",
    about: "",
    reasons: [], 
    moments: [], // { date, title, description }
    photos: [], // URLs
    isViewing: false, 
    isLocked: false
  };

  if (dataParam) {
    const decoded = decodeData(dataParam);
    if (decoded.requiresPin) {
      return { ...defaults, isLocked: true, isViewing: true, dataString: dataParam };
    }
    if (decoded.success) {
      // Merge decoded data with defaults to ensure new fields exist
      return { ...defaults, ...decoded.data, isViewing: true, isLocked: false };
    }
  }

  return defaults;
}

function Generator({ initial, onGenerate }) {
  const [data, setData] = useState(initial);
  const [step, setStep] = useState(0); // 0: World, 1: Basics, 2: Story, 3: Photos, 4: Share
  const [pin, setPin] = useState("");
  const [copied, setCopied] = useState(false);
  
  const steps = ["Experience", "Basics", "Story", "Memories", "Share"];

  // Moment management
  const addMoment = () => {
    setData(prev => ({
      ...prev,
      moments: [...prev.moments, { date: "", title: "", description: "", photo: "" }]
    }));
  };

  const updateMoment = (index, field, value) => {
    const newMoments = [...data.moments];
    newMoments[index][field] = value;
    setData({ ...data, moments: newMoments });
  };

  const removeMoment = (index) => {
    setData({ ...data, moments: data.moments.filter((_, i) => i !== index) });
  };

  // Photo management
  const addPhoto = () => {
    setData(prev => ({ ...prev, photos: [...prev.photos, ""] }));
  };

  const updatePhoto = (index, value) => {
    const newPhotos = [...data.photos];
    newPhotos[index] = value;
    setData({ ...data, photos: newPhotos });
  };

  const removePhoto = (index) => {
    setData({ ...data, photos: data.photos.filter((_, i) => i !== index) });
  };


  const shareLink = useMemo(() => {
    // Filter empty moments & photos
    const cleanMoments = data.moments.filter(m => m.title || m.description);
    const cleanPhotos = data.photos.filter(p => p.trim());
    const payload = { ...data, moments: cleanMoments, photos: cleanPhotos };
    
    // Remove UI flags
    delete payload.isViewing;
    delete payload.isLocked;
    delete payload.dataString;

    const encoded = encodeData(payload, pin);
    if (!encoded) return "";
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("data", encoded);
    return url.toString();
  }, [data, pin]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-rose-100 selection:text-rose-600 overflow-x-hidden flex flex-col">
      <VibeParticles type="petals" color="#fda4af" />
      
      {/* Header */}
      <header className="px-6 py-6 flex items-center justify-between max-w-6xl mx-auto w-full">
         <div className="inline-flex items-center gap-2 text-rose-500 font-black tracking-widest uppercase text-xs">
            <Heart size={14} fill="currentColor" /> LoveLab Studio
         </div>
      </header>

      <main className="flex-1 max-w-5xl mx-auto px-6 pb-24 w-full grid lg:grid-cols-[250px_1fr] gap-12">
        {/* Sidebar / Stepper */}
        <div className="lg:block hidden space-y-8 sticky top-24 self-start">
            <h1 className="font-serif text-4xl leading-tight tracking-tight">
               Craft your <br />
               <span className="text-rose-500 italic">story</span>.
            </h1>
            <div className="space-y-1 relative">
                <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>
                {steps.map((label, i) => (
                    <button 
                        key={i} 
                        onClick={() => setStep(i)}
                        className={`flex items-center gap-4 w-full text-left py-2 group`}
                    >
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] font-bold transition-all ${step === i ? 'border-rose-500 bg-rose-500 text-white shadow-lg scale-110' : step > i ? 'border-rose-500 bg-white text-rose-500' : 'border-gray-200 bg-white text-gray-300'}`}>
                            {step > i ? '✓' : i + 1}
                        </div>
                        <span className={`text-sm font-bold tracking-wide uppercase transition-colors ${step === i ? 'text-black' : 'text-gray-300 group-hover:text-gray-400'}`}>{label}</span>
                    </button>
                ))}
            </div>
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden flex justify-between px-2 overflow-x-auto pb-4">
             {steps.map((label, i) => (
                 <button 
                    key={i}
                    onClick={() => setStep(i)}
                    className={`flex flex-col items-center gap-2 min-w-15 ${step === i ? 'text-rose-500' : 'text-gray-300'}`}
                 >
                     <div className={`w-2 h-2 rounded-full ${step === i ? 'bg-rose-500' : 'bg-current'}`}></div>
                     <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
                 </button>
             ))}
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col min-h-150">
           <div className="flex-1 p-8 md:p-12">
             <AnimatePresence mode="wait">
                 {/* Step 0: World Selection */}
                 {step === 0 && (
                     <motion.div 
                        key="world"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-6"
                     >
                        <h2 className="text-2xl font-black tracking-tight mb-8">Choose an Experience</h2>
                        <div className="grid gap-4">
                            {Object.values(worlds).map((w) => (
                                <button
                                key={w.id}
                                onClick={() => updateField('world', w.id)}
                                className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-5 ${data.world === w.id ? 'border-rose-500 bg-rose-50/50 shadow-md transform scale-[1.01]' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                                >
                                <div className={`p-4 rounded-2xl ${data.world === w.id ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'}`}>
                                    <w.icon size={28} strokeWidth={1.5} />
                                </div>
                                <div className="space-y-1">
                                    <p className={`font-bold text-lg leading-tight ${data.world === w.id ? 'text-rose-900' : 'text-gray-900'}`}>{w.label}</p>
                                    <p className="text-sm text-gray-500 leading-snug">{w.description}</p>
                                </div>
                                </button>
                            ))}
                        </div>
                     </motion.div>
                 )}

                 {/* Step 1: Basics */}
                 {step === 1 && (
                     <motion.div 
                        key="basics"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                     >
                         <h2 className="text-2xl font-black tracking-tight">The Basics</h2>
                         <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">From</label>
                                    <input value={data.from} onChange={e => updateField('from', e.target.value)} placeholder="Your Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">To</label>
                                    <input value={data.to} onChange={e => updateField('to', e.target.value)} placeholder="Partner's Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all font-medium" />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">The Big Headline</label>
                                <input value={data.question} onChange={e => updateField('question', e.target.value)} placeholder="Will you be my Valentine?" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-xl font-bold text-rose-500 placeholder:text-rose-300/50" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Closing Note</label>
                                <textarea value={data.msg} onChange={e => updateField('msg', e.target.value)} rows="4" placeholder="Something heartfelt to end with..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none font-medium"></textarea>
                            </div>
                         </div>
                     </motion.div>
                 )}

                 {/* Step 2: Story */}
                 {step === 2 && (
                     <motion.div 
                        key="story"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                     >
                         <h2 className="text-2xl font-black tracking-tight">Your Story</h2>
                         
                         <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">The Intro</label>
                            <textarea value={data.about} onChange={e => updateField('about', e.target.value)} rows="3" placeholder="How it all started..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none" />
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">Key Moments</label>
                            {data.moments.map((moment, idx) => (
                                <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50 space-y-3 relative group hover:shadow-md transition-all">
                                    <div className="flex gap-3">
                                        <input 
                                        value={moment.date} 
                                        onChange={e => updateMoment(idx, 'date', e.target.value)} 
                                        placeholder="Date" 
                                        className="w-1/3 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-rose-300 outline-none"
                                        />
                                        <input 
                                        value={moment.title} 
                                        onChange={e => updateMoment(idx, 'title', e.target.value)} 
                                        placeholder="Title" 
                                        className="w-2/3 bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold focus:border-rose-300 outline-none"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-4 py-2">
                                        <ImageIcon size={14} className="text-gray-400" />
                                        <input 
                                            value={moment.photo || ""} 
                                            onChange={e => updateMoment(idx, 'photo', e.target.value)} 
                                            placeholder="Photo URL (Optional)" 
                                            className="w-full text-sm outline-none"
                                        />
                                    </div>
                                    <textarea 
                                        value={moment.description} 
                                        onChange={e => updateMoment(idx, 'description', e.target.value)} 
                                        placeholder="Description" 
                                        rows="2"
                                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm focus:border-rose-300 outline-none resize-none"
                                    />
                                    <button onClick={() => removeMoment(idx)} className="absolute top-2 right-2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                            <button onClick={addMoment} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-rose-200 hover:text-rose-500 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest">
                                <Plus size={16} /> Add Moment
                            </button>
                        </div>
                     </motion.div>
                 )}

                 {/* Step 3: Photos */}
                 {step === 3 && (
                     <motion.div 
                        key="photos"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                     >
                         <h2 className="text-2xl font-black tracking-tight">Memories</h2>
                         <p className="text-gray-500">Paste direct image URLs (e.g., from Unsplash, Imgur, or direct links). These will be featured in your chosen world.</p>
                         
                         <div className="space-y-3">
                            {data.photos.map((url, idx) => (
                                <div key={idx} className="flex gap-2 group">
                                <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                    <ImageIcon size={16} className="text-gray-400" />
                                    <input 
                                        value={url} 
                                        onChange={e => updatePhoto(idx, e.target.value)} 
                                        placeholder="https://example.com/image.jpg" 
                                        className="bg-transparent w-full outline-none text-sm font-medium text-gray-700"
                                    />
                                </div>
                                <button onClick={() => removePhoto(idx)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                    <Trash2 size={18} />
                                </button>
                                </div>
                            ))}
                            <button onClick={addPhoto} className="text-sm font-bold text-gray-400 hover:text-rose-500 flex items-center gap-2 transition-colors px-2 py-2">
                                <Plus size={14} /> Add Another Photo
                            </button>
                         </div>
                     </motion.div>
                 )}

                 {/* Step 4: Share */}
                 {step === 4 && (
                     <motion.div 
                        key="share"
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        className="space-y-8"
                     >
                         <h2 className="text-2xl font-black tracking-tight">Seal & Share</h2>
                         
                         <div className="bg-rose-50 p-6 rounded-3xl border border-rose-100 space-y-4">
                             <h3 className="font-bold text-rose-900 flex items-center gap-2"><Lock size={16} /> Privacy Lock (Optional)</h3>
                             <p className="text-sm text-rose-800/60 leading-relaxed">Set a PIN code so only your partner can access this link. Leave empty for public access.</p>
                             <input 
                                type="text"
                                value={pin}
                                onChange={e => setPin(e.target.value)}
                                placeholder="Enter PIN (e.g. 1234)"
                                className="w-full bg-white border border-rose-200 rounded-xl px-4 py-3 text-center tracking-widest font-bold text-lg outline-none focus:border-rose-500 text-rose-500 placeholder:text-rose-200 placeholder:font-normal"
                             />
                         </div>

                         <div className="flex items-center gap-4 p-4 bg-gray-900 text-white rounded-3xl shadow-xl overflow-hidden mt-8">
                            <div className="flex-1 truncate text-xs font-mono px-4 text-gray-400">{shareLink}</div>
                            <button onClick={handleCopy} className="shrink-0 bg-white text-black py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 active:scale-95">
                                {copied ? "Copied!" : "Copy Link"}
                            </button>
                         </div>

                         <div className="flex justify-center pt-8">
                             <button 
                                onClick={() => onGenerate(data)}
                                className="flex items-center gap-3 text-gray-400 hover:text-rose-500 transition-colors font-bold uppercase tracking-widest text-xs"
                             >
                                 Preview Now <ArrowRight size={14} />
                             </button>
                         </div>
                     </motion.div>
                 )}
             </AnimatePresence>
           </div>
           
           {/* Navigation Footer */}
           <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                <button 
                    onClick={() => setStep(s => Math.max(0, s - 1))}
                    disabled={step === 0}
                    className="px-6 py-3 rounded-2xl text-sm font-bold text-gray-500 disabled:opacity-20 hover:bg-gray-200 transition-all"
                >
                    Back
                </button>
                
                {step < steps.length - 1 ? (
                    <button 
                        onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}
                        className="px-8 py-3 bg-black text-white rounded-2xl text-sm font-bold shadow-lg hover:bg-rose-500 hover:shadow-rose-200 transition-all flex items-center gap-2"
                    >
                        Next <ArrowRight size={16} />
                    </button>
                ) : (
                    <button 
                        onClick={() => onGenerate(data)}
                        className="px-8 py-3 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center gap-2"
                    >
                        Preview Final <Stars size={16} />
                    </button>
                )}
           </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-12 text-center border-t border-gray-100">
         <p className="text-gray-300 font-serif italic text-xl tracking-tight opacity-40">Created by eb with ❤️</p>
      </footer>
    </div>
  );
}

function LockScreen({ onUnlock, error }) {
  const [pin, setPin] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-12 rounded-4xl shadow-xl text-center space-y-8">
        <div className="mx-auto w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center">
          <Lock size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-black tracking-tight">Secured Journey</h1>
          <p className="text-gray-400 mt-2">This love letter is password protected.</p>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onUnlock(pin); }} className="space-y-4">
          <input 
            type="password" 
            autoFocus
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value)}
            className="w-full text-center text-2xl tracking-widest py-4 border-b-2 border-gray-100 focus:border-rose-500 outline-none transition-colors"
          />
          {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          <button type="submit" className="w-full py-4 bg-black text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all mt-4">
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}

import { Analytics } from "@vercel/analytics/react";

function App() {
  const [state, setState] = useState(getInitialState());
  const [lockError, setLockError] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);

  const handleGenerate = (data) => {
    setState({ ...data, isViewing: true, isLocked: false });
  };

  const handleUnlock = (pin) => {
    if (!state.dataString) return;
    const result = decodeData(state.dataString, pin);
    if (result.success) {
      // Merge defaults again to ensure structure
      setState({ ...getInitialState(), ...result.data, isViewing: true, isLocked: false });
      setLockError("");
    } else {
      setLockError(result.error || "Incorrect PIN");
    }
  };

  useEffect(() => {
    // Audio Context Unlock / Autoplay Handler
    const attemptPlay = async () => {
        if (!audioRef.current) return;
        audioRef.current.volume = 0.5;
        
        try {
            await audioRef.current.play();
        } catch (err) {
            // Autoplay blocked. Wait for user interaction.
            const unlockAudio = () => {
                if (audioRef.current) {
                    audioRef.current.play();
                    ['click', 'touchstart', 'keydown'].forEach(evt => 
                        document.removeEventListener(evt, unlockAudio)
                    );
                }
            };
            ['click', 'touchstart', 'keydown'].forEach(evt => 
                document.addEventListener(evt, unlockAudio)
            );
        }
    };

    attemptPlay();
  }, []);

  // Handle Mute Toggle
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  useEffect(() => {
    const handlePopState = () => setState(getInitialState());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Pass template for legacy support
  const mockTemplate = { 
    title: "For You", 
    question: state.question || "Will you be my Valentine?", 
    description: "A special message." 
  };
  
  const WorldComponent = worlds[state.world]?.component || Timeline;

  if (state.isLocked) {
    return <LockScreen onUnlock={handleUnlock} error={lockError} />;
  }

  return (
    <AnimatePresence mode="wait">
      <Analytics />
      <audio ref={audioRef} src={music} loop />
      
      <button
          onClick={() => setIsMuted(!isMuted)}
          className="fixed bottom-6 right-6 z-60 p-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-110 active:scale-95"
          title={isMuted ? "Unmute" : "Mute"}
      >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {state.isViewing ? (
        <WorldComponent 
          key="view" 
          {...state} 
          template={mockTemplate} 
          onBack={() => {
            // Clear URL and State to ensure privacy
            window.history.pushState({}, "", window.location.origin + window.location.pathname);
            setState(getInitialState()); 
          }} 
        />
      ) : (
        <Generator key="gen" initial={state} onGenerate={handleGenerate} />
      )}
    </AnimatePresence>
  );
}

export default App;