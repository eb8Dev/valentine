import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Disc, Play, Pause, SkipForward, SkipBack, Music } from "lucide-react";

export default function MusicBox({ from, to, msg, moments = [], photos = [], question, onBack }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [progress, setProgress] = useState(0);

    // Prepare "Tracks" from moments
    const tracks = useMemo(() => {
        const baseMoments = moments.length > 0 ? moments : [
            { title: "Our First Hello", description: "The start of something beautiful.", date: "Track 01" },
            { title: "Unforgettable", description: "Every day with you is a hit song.", date: "Track 02" }
        ];

        const combined = [];
        let photoIndex = 0;

        // 1. Existing moments
        baseMoments.forEach((m, i) => {
             let p = m.photo;
             if (!p && photos.length > 0) {
                 p = photos[photoIndex % photos.length];
                 photoIndex++;
             }
             combined.push({ ...m, photo: p, date: m.date || `Track 0${i+1}` });
        });

        // 2. Extra photos
        if (photos.length > photoIndex) {
            const extraPhotos = photos.slice(photoIndex);
            extraPhotos.forEach((p, i) => {
                combined.push({
                    title: "Bonus Track",
                    description: "Another beautiful memory.",
                    date: `Bonus ${i + 1}`,
                    photo: p
                });
            });
        }
        
        return combined;
    }, [moments, photos]);

    // Add final proposal as a hidden track or special state? 
    // Let's make the final track the proposal.
    const allTracks = [
        ...tracks, 
        { 
            title: question || "Will You Be My Valentine?", 
            description: msg || "You are the melody to my life.", 
            isProposal: true 
        }
    ];

    const activeTrack = allTracks[currentTrack];
    const activePhoto = activeTrack.photo; // Pre-calculated in tracks useMemo

    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setProgress(p => {
                    if (p >= 100) {
                        if (currentTrack < allTracks.length - 1) {
                            setCurrentTrack(c => c + 1);
                            return 0;
                        } else {
                            setIsPlaying(false);
                            return 100;
                        }
                    }
                    return p + 0.5; // Speed of playback
                });
            }, 50);
        }
        return () => clearInterval(interval);
    }, [isPlaying, currentTrack, allTracks.length]);

    const handleNext = () => {
        if (currentTrack < allTracks.length - 1) {
            setCurrentTrack(c => c + 1);
            setProgress(0);
        }
    };

    const handlePrev = () => {
        if (currentTrack > 0) {
            setCurrentTrack(c => c - 1);
            setProgress(0);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-900 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-b from-zinc-800 to-black pointer-events-none"></div>
            <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #333 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <button 
                onClick={onBack}
                className="absolute top-6 left-6 z-50 flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
            >
                <Disc size={16} /> Eject Disc
            </button>

            <div className="max-w-md w-full relative z-10 space-y-8">
                {/* Now Playing Header */}
                <div className="flex justify-between items-end border-b border-zinc-800 pb-4">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500">Now Playing</p>
                        <h1 className="text-xl font-bold mt-1 text-zinc-100">{to}'s Mix Tape</h1>
                    </div>
                    <div className="flex gap-1">
                        {[1,2,3].map(i => (
                            <motion.div 
                                key={i}
                                animate={isPlaying ? { height: [10, 24, 10] } : { height: 4 }}
                                transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.1 }}
                                className="w-1 bg-rose-500 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                {/* Album Art / Rotating Disc */}
                <div className="aspect-square relative flex items-center justify-center py-8">
                     {/* The Disc */}
                    <motion.div 
                        animate={{ rotate: isPlaying ? 360 : 0 }}
                        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                        className="w-64 h-64 md:w-80 md:h-80 rounded-full bg-zinc-950 border-8 border-zinc-900 shadow-2xl relative flex items-center justify-center"
                    >
                        {/* Grooves */}
                        <div className="absolute inset-2 rounded-full border border-zinc-800/50"></div>
                        <div className="absolute inset-4 rounded-full border border-zinc-800/50"></div>
                        <div className="absolute inset-8 rounded-full border border-zinc-800/50"></div>
                        <div className="absolute inset-16 rounded-full border border-zinc-800/50"></div>

                        {/* Label/Image */}
                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-rose-500/20 relative z-10">
                            {activePhoto ? (
                                <img src={activePhoto} alt="Cover" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-rose-500 flex items-center justify-center">
                                    <Music className="text-rose-900" size={32} />
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* The Tone Arm (Decoration) */}
                    <motion.div 
                        animate={{ rotate: isPlaying ? 25 : 0 }}
                        className="absolute top-0 right-4 w-4 h-32 bg-zinc-700 origin-top rounded-b-lg shadow-lg"
                        style={{ transformOrigin: "top center" }}
                    >
                         <div className="w-6 h-6 bg-zinc-400 rounded-full absolute -top-2 -left-1 shadow-inner"></div>
                    </motion.div>
                </div>

                {/* Track Info */}
                <div className="space-y-2 text-center h-32 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentTrack}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <h2 className={`text-2xl md:text-3xl font-bold leading-tight ${activeTrack.isProposal ? "text-rose-500" : "text-white"}`}>
                                {activeTrack.title}
                            </h2>
                            <p className="text-zinc-400 mt-2 text-sm md:text-base leading-relaxed max-w-xs mx-auto">
                                {activeTrack.description}
                            </p>
                            {activeTrack.date && (
                                <span className="inline-block mt-3 px-2 py-1 bg-zinc-800 rounded text-[10px] uppercase tracking-widest text-zinc-500">
                                    {activeTrack.date}
                                </span>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls */}
                <div className="space-y-6">
                    {/* Progress Bar */}
                    <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <motion.div 
                            className="h-full bg-rose-500"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="flex items-center justify-center gap-8">
                        <button onClick={handlePrev} className="p-3 text-zinc-400 hover:text-white transition-colors">
                            <SkipBack size={24} />
                        </button>
                        
                        <button 
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                        >
                            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>

                        <button onClick={handleNext} className="p-3 text-zinc-400 hover:text-white transition-colors">
                            <SkipForward size={24} />
                        </button>
                    </div>
                </div>

                <div className="text-center pt-8">
                     <p className="text-[10px] text-zinc-600 uppercase tracking-widest">Mixed with love by {from}</p>
                </div>
            </div>
        </div>
    );
}