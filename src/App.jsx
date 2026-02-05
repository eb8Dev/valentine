import { useEffect, useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Stars, PenTool, ArrowRight, Lock
} from "lucide-react";
import Constellation from "./worlds/Constellation";
import LoveLetter from "./worlds/LoveLetter";
import ClassicCards from "./worlds/ClassicCards";
import { encodeData, decodeData } from "./utils/share";
import { templates, vibes } from "./data/config";
import VibeParticles from "./components/VibeParticles";

const worlds = {
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
  },
  cards: {
    id: "cards",
    label: "Classic Cards",
    description: "Animated cards with different vibes.",
    icon: Heart,
    component: ClassicCards
  }
};

function getInitialState() {
  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");

  // Default values
  const defaults = {
    from: "", to: "", msg: "", world: "cards", vibe: "soft", template: "valentine",
    reasons: [], about: "", whyValentine: "", isViewing: false, isLocked: false
  };

  // Try decoding "data" param (new format)
  if (dataParam) {
    const decoded = decodeData(dataParam);
    if (decoded.requiresPin) {
      return { ...defaults, isLocked: true, isViewing: true, dataString: dataParam };
    }
    if (decoded.success) {
      return { ...decoded.data, isViewing: true, isLocked: false };
    }
  }

  // Fallback to legacy params (old format)
  const from = params.get("from");
  if (from) {
    const to = params.get("to") || "";
    const msg = params.get("msg") || "";
    const world = params.get("world") || "cards";
    const vibe = params.get("vibe") || "soft";
    const template = params.get("template") || "valentine";
    const reasonsMixed = params.get("reasons") ? params.get("reasons").split(/[|,]/) : [];
    const about = params.get("about") || "";
    const whyValentine = params.get("whyValentine") || "";

    return {
      from, to, msg, world, vibe, template, reasons: reasonsMixed, about, whyValentine, isViewing: true, isLocked: false
    };
  }

  return defaults;
}

function Generator({ initial, onGenerate }) {
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [msg, setMsg] = useState(initial.msg);
  const [world, setWorld] = useState(initial.world);
  const [vibe, setVibe] = useState(initial.vibe);
  const [template, setTemplate] = useState(initial.template);
  const [about, setAbout] = useState(initial.about);
  const [whyValentine, setWhyValentine] = useState(initial.whyValentine);
  const [reasons, setReasons] = useState(initial.reasons.join(', '));
  const [pin, setPin] = useState("");
  const [copied, setCopied] = useState(false);

  // useMemo for the link instead of effect + state
  const shareLink = useMemo(() => {
    const data = { 
      from, to, msg, world, vibe, template, about, whyValentine, 
      reasons: reasons.split(',').map(r => r.trim()).filter(Boolean) 
    };
    const encoded = encodeData(data, pin);
    if (!encoded) return "";
    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set("data", encoded);
    return url.toString();
  }, [from, to, msg, world, vibe, template, about, whyValentine, reasons, pin]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] text-[#1a1a1a] font-sans selection:bg-rose-100 selection:text-rose-600 overflow-x-hidden">
      <VibeParticles type="petals" color="#fda4af" />
      
      <main className="max-w-6xl mx-auto px-6 py-12 md:py-24 grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-start">
        <div className="space-y-8 lg:sticky lg:top-24">
          <div className="inline-flex items-center gap-3 px-4 py-2 bg-white border border-rose-100 rounded-full text-rose-500 text-[10px] font-black tracking-widest uppercase shadow-sm">
            <Heart size={12} fill="currentColor" /> LoveLab Studio
          </div>
          <h1 className="font-serif text-5xl md:text-7xl leading-tight tracking-tight">
            Make her <br />
            <span className="text-rose-500 italic">flattered</span>.
          </h1>
          <p className="text-xl text-gray-500 max-w-md font-light leading-relaxed">
            Create a cinematic surprise for your partner. Securely share your heart with a password-protected link.
          </p>
          
          <div className="pt-6 space-y-4">
            <button 
              onClick={() => onGenerate({ 
                from, to, msg, world, vibe, template, about, whyValentine, 
                reasons: reasons.split(',').map(r => r.trim()).filter(Boolean) 
              })}
              className="group bg-[#1a1a1a] text-white px-10 py-5 rounded-3xl font-black text-xl shadow-xl hover:bg-rose-600 transition-all hover:-translate-y-1 flex items-center gap-4 active:scale-95"
            >
              Preview Result <ArrowRight size={24} />
            </button>
            <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest ml-2 italic">Joined by 20k+ lovers</p>
          </div>
        </div>

        <div className="bg-white rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.05)] p-8 md:p-12 space-y-12 border border-gray-100 min-w-0">
          
          {/* World Selection */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 opacity-30">
              <span className="text-[10px] font-black uppercase tracking-widest">1. Choose The World</span>
            </div>
            <div className="grid gap-3">
              {Object.values(worlds).map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWorld(w.id)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all flex items-start gap-4 ${world === w.id ? 'border-rose-500 bg-rose-50/50 scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                >
                  <div className={`p-3 rounded-full ${world === w.id ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400'}`}>
                    <w.icon size={24} />
                  </div>
                  <div>
                    <p className="font-bold text-lg leading-tight">{w.label}</p>
                    <p className="text-sm text-gray-400 mt-1 leading-snug">{w.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </section>

          {/* Vibe Selection (Only for Cards world) */}
          <AnimatePresence>
            {world === 'cards' && (
              <motion.section 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-6 overflow-hidden"
              >
                <div className="flex items-center gap-3 opacity-30">
                  <span className="text-[10px] font-black uppercase tracking-widest">1.5. Select Vibe</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {Object.entries(vibes).map(([key, info]) => (
                    <button key={key} onClick={() => setVibe(key)} className={`py-4 rounded-2xl border-2 text-[10px] font-black transition-all uppercase tracking-widest ${vibe === key ? "border-rose-500 bg-rose-500 text-white shadow-lg scale-[1.05]" : "border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200"}`}>
                      {info.label.split(' ')[1] || info.label}
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <section className="space-y-6">
            <div className="flex items-center gap-3 opacity-30">
              <span className="text-[10px] font-black uppercase tracking-widest">2. Choose Template</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(templates).map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTemplate(t.id)}
                  className={`p-6 rounded-3xl border-2 text-left transition-all ${template === t.id ? 'border-rose-500 bg-rose-50/50 scale-[1.02]' : 'border-gray-50 bg-gray-50 hover:border-gray-200'}`}
                >
                  <t.icon size={20} className={template === t.id ? 'text-rose-500' : 'text-gray-400'} />
                  <p className="mt-3 font-bold text-base leading-tight">{t.label}</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wider font-medium">{t.title}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 opacity-30">
              <span className="text-[10px] font-black uppercase tracking-widest">3. Your Story</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Your Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-base" />
              <input value={to} onChange={e => setTo(e.target.value)} placeholder="Her Name" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all text-base" />
            </div>
            <textarea value={about} onChange={e => setAbout(e.target.value)} rows="2" placeholder="Our Story (e.g., 'How we first met...')" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none text-base"></textarea>
            <textarea value={reasons} onChange={e => setReasons(e.target.value)} rows="2" placeholder="Why she's special (Separate reasons with commas)" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none text-base"></textarea>
            <textarea value={whyValentine} onChange={e => setWhyValentine(e.target.value)} rows="2" placeholder="Why I want you as my Valentine..." className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none text-base"></textarea>
            <textarea value={msg} onChange={e => setMsg(e.target.value)} rows="2" placeholder="Final Love Note" className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-rose-100 outline-none transition-all resize-none text-base"></textarea>
          </section>

          <section className="space-y-6">
            <div className="flex items-center gap-3 opacity-30">
              <span className="text-[10px] font-black uppercase tracking-widest">4. Privacy (Optional)</span>
            </div>
            <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <Lock size={20} className="text-gray-400" />
              <input 
                type="text"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="Set a Security PIN (optional)"
                className="bg-transparent w-full outline-none text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed px-2">
              If set, the recipient must enter this PIN to view the journey. The link will be encrypted.
            </p>
          </section>

          <div className="pt-8 border-t border-gray-50">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner overflow-hidden">
              <div className="flex-1 truncate text-[10px] text-gray-400 font-mono px-4 min-w-0">{shareLink}</div>
              <button onClick={handleCopy} className="shrink-0 bg-white text-rose-500 py-3 px-6 rounded-xl shadow-sm hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest active:scale-95">
                {copied ? "Copied" : "Copy Link"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="max-w-6xl mx-auto px-6 py-32 text-center border-t border-gray-100">
         <p className="text-gray-300 font-serif italic text-xl tracking-tight opacity-40">"A digital space for analog hearts."</p>
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

function App() {
  const [state, setState] = useState(getInitialState());
  const [lockError, setLockError] = useState("");

  const handleGenerate = (data) => {
    setState({ ...data, isViewing: true, isLocked: false });
  };

  const handleUnlock = (pin) => {
    if (!state.dataString) return;
    const result = decodeData(state.dataString, pin);
    if (result.success) {
      setState({ ...result.data, isViewing: true, isLocked: false });
      setLockError("");
    } else {
      setLockError(result.error || "Incorrect PIN");
    }
  };

  useEffect(() => {
    const handlePopState = () => setState(getInitialState());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Pass title/question directly instead of template object
  const currentTemplate = templates[state.template] || templates.valentine;
  
  // Decide which component to render
  const WorldComponent = worlds[state.world]?.component || ClassicCards;

  if (state.isLocked) {
    return <LockScreen onUnlock={handleUnlock} error={lockError} />;
  }

  return (
    <AnimatePresence mode="wait">
      {state.isViewing ? (
        <WorldComponent 
          key="view" 
          {...state} 
          template={currentTemplate} 
          onBack={() => {
            setState(prev => ({ ...prev, isViewing: false }));
            window.history.pushState({}, "", window.location.origin + window.location.pathname);
          }} 
        />
      ) : (
        <Generator key="gen" initial={state} onGenerate={handleGenerate} />
      )}
    </AnimatePresence>
  );
}

export default App;