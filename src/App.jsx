import { useEffect, useState, useRef, useCallback } from "react";
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
  const idParam = params.get("id");

  const defaults = {
    from: "",
    to: "",
    msg: "",
    world: "timeline",
    question: "Will you be my Valentine?",
    about: "",
    reasons: [],
    moments: [],
    photos: [],
    isViewing: false,
    isLocked: false
  };

  if (idParam) {
    return { ...defaults, isLoading: true, id: idParam };
  }

  if (dataParam) {
    const decoded = decodeData(dataParam);
    if (decoded.requiresPin) {
      return { ...defaults, isLocked: true, isViewing: true, dataString: dataParam };
    }
    if (decoded.success) {
      return { ...defaults, ...decoded.data, isViewing: true, isLocked: false };
    }
  }

  return defaults;
}

function Generator({ initial, onGenerate, attemptPlay }) {
  const [data, setData] = useState(initial);
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [statsCount, setStatsCount] = useState(0);

  const steps = ["Experience", "Basics", "Story", "Memories", "Share"];

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStatsCount(data.count || 0))
      .catch(() => setStatsCount(124)); // Fallback
  }, []);

  const isValidUrl = (url) => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const canMoveForward = () => {
    if (step === 1) {
      return data.from.trim() && data.to.trim();
    }
    if (step === 3) {
      // Validate all photos
      return data.photos.every(p => isValidUrl(p)) && data.moments.every(m => isValidUrl(m.photo));
    }
    return true;
  };

  const isStepDisabled = (targetStep) => {
    if (targetStep <= step) return false;
    // Check if basics are filled before allowing Story (2) or beyond
    if (targetStep > 1 && (!data.from.trim() || !data.to.trim())) return true;
    // Add other sequential checks if needed
    return false;
  };

  // ... (keep moment/photo management functions as is) ...
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

  const updateField = (field, value) => setData(prev => ({ ...prev, [field]: value }));

  const getPayload = () => {
    const cleanMoments = data.moments.filter(m => m.title || m.description);
    const cleanPhotos = data.photos.filter(p => p.trim());
    const payload = { ...data, moments: cleanMoments, photos: cleanPhotos };
    delete payload.isViewing;
    delete payload.isLocked;
    delete payload.dataString;
    delete payload.isLoading;
    delete payload.id;
    return payload;
  };

  const handleCopy = async () => {
    setIsGeneratingLink(true);
    const payload = getPayload();
    let finalUrl = "";

    try {
      // If PIN is set, encrypt the payload FIRST so the database never sees raw data
      const dataToSave = pin ? encodeData(payload, pin) : payload;

      // Try to generate short link via Vercel KV
      const res = await fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSave)
      });

      if (res.ok) {
        const { id } = await res.json();
        finalUrl = `${window.location.origin}/?id=${id}`;
      } else {
        throw new Error("KV failed");
      }
    } catch (e) {
      // Fallback to long URL if KV is down or not configured
      console.warn("Short link generation failed, falling back to long link", e);
      const encoded = encodeData(payload, pin);
      if (encoded) {
        const url = new URL(window.location.origin + window.location.pathname);
        url.searchParams.set("data", encoded);
        finalUrl = url.toString();
      }
    }

    if (finalUrl) {
      try {
        await navigator.clipboard.writeText(finalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) { console.error(err); }
    }
    setIsGeneratingLink(false);
  };

  // ... rest of render ...


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
          <div className="space-y-4">
            <h1 className="font-serif text-4xl leading-tight tracking-tight">
              Craft your <br />
              <span className="text-rose-500 italic">story</span>.
            </h1>
            {statsCount > 0 && (
              <motion.p
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs font-medium text-rose-400 bg-rose-50 inline-block px-3 py-1 rounded-full border border-rose-100"
              >
                ✨ Over {statsCount} souls have shared their love
              </motion.p>
            )}
          </div>
          <div className="space-y-1 relative">
            <div className="absolute left-2.75 top-2 bottom-2 w-0.5 bg-gray-100 -z-10"></div>
            {steps.map((label, i) => (
              <button
                key={i}
                onClick={() => !isStepDisabled(i) && setStep(i)}
                disabled={isStepDisabled(i)}
                className={`flex items-center gap-4 w-full text-left py-2 group ${isStepDisabled(i) ? 'cursor-not-allowed opacity-50' : ''}`}
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
              onClick={() => !isStepDisabled(i) && setStep(i)}
              disabled={isStepDisabled(i)}
              className={`flex flex-col items-center gap-2 min-w-15 ${step === i ? 'text-rose-500' : isStepDisabled(i) ? 'text-gray-100' : 'text-gray-300'}`}
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

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">The Big Headline</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Will you be my Valentine?",
                          "Will you be mine forever?",
                          "Be my Valentine?",
                          "Will you do me the honor?",
                          "Let's grow old together?",
                          "Custom Message..."
                        ].map((q) => (
                          <button
                            key={q}
                            onClick={() => updateField('question', q === "Custom Message..." ? "" : q)}
                            className={`px-6 py-3 rounded-2xl text-sm font-medium border-2 transition-all text-left ${(data.question === q || (q === "Custom Message..." && !["Will you be my Valentine?", "Will you be mine forever?", "Be my Valentine?", "Will you do me the honor?", "Let's grow old together?"].includes(data.question)))
                                ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-sm'
                                : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                              }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>

                      {(!["Will you be my Valentine?", "Will you be mine forever?", "Be my Valentine?", "Will you do me the honor?", "Let's grow old together?"].includes(data.question) || data.question === "") && (
                        <motion.input
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          value={data.question}
                          onChange={e => updateField('question', e.target.value)}
                          placeholder="Type your own romantic question..."
                          className="w-full bg-white border-2 border-rose-100 rounded-2xl px-6 py-4 focus:border-rose-500 outline-none transition-all text-lg font-bold text-rose-500"
                        />
                      )}
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
                        <div className={`flex items-center gap-3 bg-white border rounded-xl px-4 py-2 transition-all ${moment.photo && !isValidUrl(moment.photo) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                          <ImageIcon size={14} className={moment.photo && !isValidUrl(moment.photo) ? 'text-red-400' : 'text-gray-400'} />
                          <input
                            value={moment.photo || ""}
                            onChange={e => updateMoment(idx, 'photo', e.target.value)}
                            placeholder="Photo URL (Optional)"
                            className="w-full text-sm outline-none bg-transparent"
                          />
                        </div>
                        {moment.photo && !isValidUrl(moment.photo) && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Invalid URL</p>}
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
                  <h2 className="text-2xl font-black tracking-tight">Visual Memories</h2>
                  <p className="text-gray-500 leading-relaxed italic">
                    "A picture is worth a thousand words, but your memories are priceless." <br />
                    Paste direct image links below to weave them into your journey.
                  </p>

                  <div className="space-y-3">
                    {data.photos.map((url, idx) => (
                      <div key={idx} className="flex flex-col gap-1 group">
                        <div className={`flex gap-2 p-1 rounded-2xl transition-all ${url && !isValidUrl(url) ? 'bg-red-50 border-red-200 border' : ''}`}>
                          <div className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                            <ImageIcon size={16} className="text-gray-400" />
                            <input
                              value={url}
                              onChange={e => updatePhoto(idx, e.target.value)}
                              placeholder="Paste image link here..."
                              className="bg-transparent w-full outline-none text-sm font-medium text-gray-700"
                            />
                          </div>
                          <button onClick={() => removePhoto(idx)} className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {url && !isValidUrl(url) && <p className="text-[10px] text-red-500 ml-4 font-bold uppercase">Invalid URL format</p>}
                      </div>
                    ))}
                    <button onClick={addPhoto} className="text-sm font-bold text-gray-400 hover:text-rose-500 flex items-center gap-2 transition-colors px-2 py-2">
                      <Plus size={14} /> Add Another Memory
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
                    <div className="flex-1 truncate text-xs font-mono px-4 text-gray-400">
                      {isGeneratingLink ? "Generating short link..." : "Ready to seal your love"}
                    </div>
                    <button
                      onClick={handleCopy}
                      disabled={isGeneratingLink}
                      className="shrink-0 bg-white text-black py-3 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                    >
                      {copied ? "Copied!" : "Get Link"}
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
                onClick={() => {
                  attemptPlay();
                  if (canMoveForward()) {
                    setStep(s => Math.min(steps.length - 1, s + 1));
                  }
                }}
                disabled={!canMoveForward()}
                className={`px-8 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all flex items-center gap-2 ${canMoveForward() ? 'bg-black text-white hover:bg-rose-500 hover:shadow-rose-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}
              >
                {step === 1 && (!data.from || !data.to) ? "Enter Names" : "Next"} <ArrowRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => {
                  attemptPlay();
                  onGenerate(data);
                }}
                className="px-8 py-3 bg-rose-500 text-white rounded-2xl text-sm font-bold shadow-lg shadow-rose-200 hover:scale-105 transition-all flex items-center gap-2"
              >
                View Your Gift <Stars size={16} />
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

  const [hasPlayed, setHasPlayed] = useState(false);

  const attemptPlay = useCallback(() => {
    if (audioRef.current && !hasPlayed && !isMuted) {
      audioRef.current.play()
        .then(() => setHasPlayed(true))
        .catch(err => console.log("Playback still blocked:", err));
    }
  }, [hasPlayed, isMuted]);

  const handleGenerate = (data) => {
    attemptPlay();
    setState({ ...data, isViewing: true, isLocked: false });
  };

  const handleUnlock = (pin) => {
    attemptPlay();
    if (!state.dataString) return;
    const result = decodeData(state.dataString, pin);
    if (result.success) {
      setState(prev => ({ ...prev, ...result.data, isViewing: true, isLocked: false }));
      setLockError("");
    } else {
      setLockError(result.error || "Incorrect PIN");
    }
  };

  useEffect(() => {
    if (state.id && state.isLoading) {
      fetch(`/api/get?id=${state.id}`)
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(data => {
          if (typeof data === 'string' && data.startsWith("enc_")) {
            setState({ ...getInitialState(), isLocked: true, isViewing: true, dataString: data, isLoading: false });
          } else {
            setState({ ...getInitialState(), ...data, isViewing: true, isLocked: false, isLoading: false });
          }
        })
        .catch(err => {
          console.error(err);
          setState(prev => ({ ...prev, isLoading: false, error: "Failed to load journey." }));
        });
    }
  }, [state.id, state.isLoading]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.4;

    const unlock = () => {
      attemptPlay();
      if (hasPlayed) {
        window.removeEventListener('click', unlock);
        window.removeEventListener('touchstart', unlock);
      }
    };

    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
    return () => {
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
  }, [hasPlayed, isMuted, attemptPlay]);

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
    <>
      <Analytics />
      <audio ref={audioRef} src={music} loop />

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="fixed bottom-6 right-6 z-60 p-3 bg-black/20 backdrop-blur-md border border-white/10 rounded-full text-white/70 hover:bg-black/40 hover:text-white transition-all hover:scale-110 active:scale-95"
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      <AnimatePresence mode="wait">
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
          <Generator key="gen" initial={state} onGenerate={handleGenerate} attemptPlay={attemptPlay} />
        )}
      </AnimatePresence>
    </>
  );
}

export default App;