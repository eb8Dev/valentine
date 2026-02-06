import { useState, useEffect, useRef, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Heart, Calendar, Star, ArrowDown, Music } from "lucide-react";
import confetti from "canvas-confetti";

function FloatingImage({ src, alt, className, delay }) {
    if (!src) return null;
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={`rounded-2xl overflow-hidden shadow-2xl ${className}`}
        >
            <img src={src} alt={alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
        </motion.div>
    );
}

export default function Timeline({ from, to, msg, moments = [], photos = [], question, onBack }) {
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({ container: containerRef });
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const [showConfetti, setShowConfetti] = useState(false);

    useEffect(() => {
        // Trigger confetti when reaching the bottom (approx)
        const unsubscribe = scrollYProgress.onChange(v => {
            if (v > 0.95 && !showConfetti) {
                setShowConfetti(true);
                const duration = 3000;
                const end = Date.now() + duration;
                (function frame() {
                    if (Date.now() > end) return;
                    confetti({
                        particleCount: 3,
                        angle: 60,
                        spread: 55,
                        origin: { x: 0 },
                        colors: ['#ec4899', '#f43f5e']
                    });
                    confetti({
                        particleCount: 3,
                        angle: 120,
                        spread: 55,
                        origin: { x: 1 },
                        colors: ['#ec4899', '#f43f5e']
                    });
                    requestAnimationFrame(frame);
                }());
            }
        });
        return () => unsubscribe();
    }, [scrollYProgress, showConfetti]);

    const { timelineData, unusedPhotos } = useMemo(() => {
        const baseMoments = moments.length > 0 ? moments : [
            { date: "The Beginning", title: "When We Met", description: "The day my life changed forever." },
            { date: "Today", title: "Celebrating Us", description: "Every moment with you is a gift." }
        ];

        const filledMoments = [];
        let photoIndex = 0;

        // 1. Fill moments with photos if missing
        baseMoments.forEach(m => {
            let p = m.photo;
            if (!p && photos.length > 0) {
                p = photos[photoIndex % photos.length];
                photoIndex++;
            }
            filledMoments.push({ ...m, photo: p });
        });

        // 2. Collect unused photos
        let extra = [];
        if (photos.length > photoIndex) {
            extra = photos.slice(photoIndex);
        } else if (photos.length > 0 && photoIndex === 0) {
             // If we didn't use any photos (e.g. all moments had their own), show all in grid
             extra = photos;
        }

        return { timelineData: filledMoments, unusedPhotos: extra };
    }, [moments, photos]);

    return (
        <div className="fixed inset-0 bg-[#fff0f3] overflow-hidden text-slate-800 font-sans selection:bg-rose-200">
            {/* Progress Bar */}
            <motion.div
                className="fixed top-0 left-0 right-0 h-2 bg-rose-500 origin-left z-50"
                style={{ scaleX }}
            />

            <button 
                onClick={onBack}
                className="fixed top-6 left-6 z-50 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm hover:bg-white transition-all"
            >
                Exit Timeline
            </button>

            <div 
                ref={containerRef}
                className="h-full overflow-y-auto scroll-smooth"
            >
                {/* Hero Section */}
                <section className="min-h-screen flex flex-col items-center justify-center p-8 relative">
                    <div className="absolute inset-0 pointer-events-none opacity-30 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-rose-200 via-transparent to-transparent"></div>
                    
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                        className="text-center space-y-6 max-w-2xl relative z-10"
                    >
                        <div className="inline-block p-4 rounded-full bg-white shadow-xl mb-4">
                            <Heart className="w-12 h-12 text-rose-500 fill-rose-500 animate-pulse" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-slate-900">
                            {to}
                        </h1>
                        <p className="text-2xl md:text-3xl font-light text-slate-600 italic">
                            "A story about us."
                        </p>
                    </motion.div>

                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1, y: [0, 10, 0] }}
                        transition={{ delay: 1, duration: 2, repeat: Infinity }}
                        className="absolute bottom-12 text-slate-400 flex flex-col items-center gap-2"
                    >
                        <span className="text-[10px] uppercase tracking-widest">Scroll to Begin</span>
                        <ArrowDown size={20} />
                    </motion.div>
                </section>

                {/* Timeline Section */}
                <div className="max-w-3xl mx-auto px-6 py-24 space-y-32 relative">
                    {/* Vertical Line */}
                    <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-rose-200 -z-10 transform md:-translate-x-1/2"></div>

                    {timelineData.map((item, i) => (
                        <div key={i} className={`relative flex flex-col md:flex-row gap-8 items-center ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            {/* Date Bubble */}
                            <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-rose-500 rounded-full border-4 border-white shadow-sm z-10 md:translate-x-[-50%]"></div>
                            
                            {/* Content */}
                            <motion.div 
                                initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.6 }}
                                className="flex-1 w-full md:w-1/2 pl-12 md:pl-0"
                            >
                                <div className={`bg-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.05)] border border-rose-50 hover:border-rose-100 transition-colors ${i % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                                    {item.photo && (
                                        <div className="mb-6 rounded-xl overflow-hidden shadow-md">
                                            <img src={item.photo} alt={item.title} className="w-full h-auto object-cover max-h-64" />
                                        </div>
                                    )}
                                    <div className={`flex items-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-widest mb-3 ${i % 2 === 0 ? 'justify-start' : 'md:justify-end'}`}>
                                        <Calendar size={14} /> {item.date}
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                    <p className="text-slate-600 leading-relaxed text-lg">{item.description}</p>
                                </div>
                            </motion.div>
                            
                            {/* Empty space for the other side */}
                            <div className="flex-1 hidden md:block"></div>
                        </div>
                    ))}
                    
                    {/* Photos Section (Extra Memories) */}
                    {unusedPhotos.length > 0 && (
                         <div className="py-12 grid grid-cols-2 gap-4 rotate-2">
                            {unusedPhotos.map((url, idx) => (
                                <FloatingImage key={idx} src={url} delay={idx * 0.2} className={idx % 2 === 0 ? 'translate-y-8' : '-translate-y-8'} />
                            ))}
                         </div>
                    )}
                </div>

                {/* The Big Question / Final Message */}
                <section className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-slate-900 text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                    <div className="absolute inset-0 bg-linear-to-t from-rose-900/50 to-transparent pointer-events-none"></div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl space-y-8 relative z-10"
                    >
                         <Star className="w-16 h-16 text-yellow-400 fill-yellow-400 mx-auto animate-spin-slow" />
                         
                         <h2 className="text-3xl md:text-5xl font-serif italic text-rose-200">
                             "{question || "Will you be my Valentine?"}"
                         </h2>

                         <div className="h-px w-24 bg-rose-500/50 mx-auto"></div>

                         <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed">
                             "{msg || "You mean the world to me."}"
                         </p>

                         <div className="pt-12">
                             <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-400">With Love</p>
                             <p className="text-4xl font-black mt-4">{from}</p>
                         </div>
                    </motion.div>
                </section>
            </div>
        </div>
    );
}