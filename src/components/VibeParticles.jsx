import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Sparkles, Flower } from "lucide-react";

export default function VibeParticles({ type, color }) {
  const [particles] = useState(() => {
    return [...Array(20)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (type === 'stars' ? 6 : 16) + 4,
      duration: Math.random() * 8 + 8,
      delay: Math.random() * 5,
      drift: Math.random() * 30 - 15
    }));
  });

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: p.x + "%", top: p.y + "%", color }}
          initial={{ opacity: 0, scale: 0 }}
          animate={type === 'stars' ? {
            opacity: [0, 0.7, 0], scale: [0, 1.2, 0], rotate: [0, 180],
          } : type === 'petals' ? {
            y: ["-10vh", "110vh"], x: [p.x + "%", (p.x + p.drift) + "%"], rotate: [0, 360], opacity: [0, 1, 1, 0]
          } : {
            scale: [0.8, 1.1, 0.8], y: [p.y + "%", (p.y - 10) + "%", p.y + "%"], opacity: [0.2, 0.4, 0.2], rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        >
          {type === 'stars' ? <Sparkles size={p.size} fill="currentColor" /> : 
           type === 'petals' ? <Flower size={p.size} fill="currentColor" /> :
           <Heart size={p.size} fill="currentColor" />}
        </motion.div>
      ))}
    </div>
  );
}