import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Framer, Heart } from "lucide-react";

function Frame({ moment, photo, index }) {
  // Parallax effect would require specific scroll tracking per item or horizontal scroll container ref
  // For simplicity in horizontal scroll, we stick to standard layout with hover effects
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="min-w-[80vw] md:min-w-[40vw] h-[60vh] md:h-[70vh] flex flex-col items-center justify-center p-8 snap-center relative"
    >
      <div className="relative w-full h-full bg-white shadow-2xl p-4 md:p-8 border-[12px] border-neutral-900 group">
         {/* Matting */}
         <div className="w-full h-full bg-neutral-100 shadow-inner flex flex-col relative overflow-hidden">
            {photo ? (
                <img src={photo} alt={moment.title} className="w-full h-[60%] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
            ) : (
                <div className="w-full h-[60%] bg-neutral-200 flex items-center justify-center">
                    <Heart className="text-neutral-300" size={48} />
                </div>
            )}
            
            <div className="flex-1 p-6 md:p-8 flex flex-col justify-center text-center space-y-4 bg-white">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-neutral-400">{moment.date || `Exhibit ${index + 1}`}</p>
                <h2 className="text-2xl md:text-3xl font-serif text-neutral-900 italic">{moment.title}</h2>
                <p className="text-neutral-500 font-light leading-relaxed max-w-sm mx-auto">{moment.description}</p>
            </div>
         </div>

         {/* Label Plate */}
         <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-[#d4af37] text-black px-6 py-2 shadow-lg min-w-[150px] text-center">
             <span className="text-[10px] font-bold uppercase tracking-widest block">Collection No. {index + 1}</span>
         </div>
      </div>
    </motion.div>
  );
}

export default function Gallery({ from, to, msg, moments = [], photos = [], question, onBack }) {
    const containerRef = useRef(null);

    // Default exhibits if empty
    const exhibits = moments.length > 0 ? moments : [
        { title: "The Beginning", description: "Where art met soul.", date: "2023" },
        { title: "The Masterpiece", description: "Building a life together.", date: "2024" }
    ];

    return (
        <div className="h-screen w-screen bg-neutral-100 overflow-hidden flex flex-col font-serif selection:bg-neutral-800 selection:text-white">
             {/* Header */}
             <div className="absolute top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
                 <button onClick={onBack} className="pointer-events-auto px-4 py-2 bg-white/80 backdrop-blur border border-neutral-200 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-all">
                     Exit Museum
                 </button>
                 <div className="text-right">
                     <h1 className="text-xl font-bold tracking-tight text-neutral-900">MUSEUM OF {to.toUpperCase()}</h1>
                     <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Curated by {from}</p>
                 </div>
             </div>

             {/* Horizontal Scroll Area */}
             <div 
                ref={containerRef}
                className="flex-1 flex items-center overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar px-[10vw] gap-[10vw]"
             >
                {/* Intro Wall */}
                <div className="min-w-[80vw] h-full flex flex-col justify-center items-start snap-center pl-12 space-y-8">
                    <div className="w-20 h-1 bg-neutral-900"></div>
                    <h1 className="text-6xl md:text-8xl font-thin tracking-tighter text-neutral-900 leading-[0.8]">
                        The <br />
                        <span className="italic font-serif">Collection</span>
                    </h1>
                    <p className="max-w-md text-neutral-500 text-lg leading-relaxed">
                        A private exhibition of moments, memories, and the art of loving {to}.
                    </p>
                    <div className="flex items-center gap-4 text-neutral-400 text-xs uppercase tracking-widest animate-pulse">
                        Scroll to Enter <ArrowRight size={16} />
                    </div>
                </div>

                {/* Exhibits */}
                {exhibits.map((moment, i) => (
                    <Frame key={i} moment={moment} index={i} photo={moment.photo || photos[i % photos.length]} />
                ))}

                {/* Final Wall */}
                <div className="min-w-[100vw] h-full flex flex-col justify-center items-center snap-center bg-neutral-900 text-white relative">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-black opacity-50"></div>
                    
                    <div className="relative z-10 text-center space-y-12 max-w-3xl px-6">
                         <div className="w-px h-24 bg-gradient-to-b from-transparent via-white to-transparent mx-auto"></div>
                         
                         <h2 className="text-4xl md:text-6xl font-serif italic text-[#d4af37]">
                             "{question || "Will you be my Valentine?"}"
                         </h2>
                         
                         <p className="text-neutral-400 text-xl font-light leading-relaxed">
                             "{msg || "You are the finest work of art I've ever known."}"
                         </p>

                         <div className="pt-12">
                             <p className="text-[10px] uppercase tracking-[0.4em] text-neutral-500">Artist Signature</p>
                             <p className="font-dancing text-4xl mt-4 text-white">{from}</p>
                         </div>
                    </div>
                </div>
             </div>

             {/* Progress Line */}
             <div className="absolute bottom-0 left-0 w-full h-1 bg-neutral-200">
                 <div className="h-full bg-neutral-900 w-1/4"></div> 
                 {/* Note: Real progress requires scroll listener logic which is complex for horiz-scroll without framer-motion's scroll hook on ref, keeping it static/simple for now */}
             </div>
        </div>
    );
}