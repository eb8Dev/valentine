import { 
  Heart, Sparkles, Flower, Mail, Flame, Stars, PenTool
} from "lucide-react";

export const templates = {
  valentine: {
    id: "valentine",
    label: "Will you be my Valentine?",
    title: "The Big Question",
    icon: Heart,
    question: "Will you be my Valentine?",
    description: "The classic way to ask the most important question.",
    accent: "#ef4444",
    theme: {
      primary: "text-red-600",
      bg: "bg-red-50",
      button: "bg-red-600 hover:bg-red-700 text-white"
    }
  },
  rose: {
    id: "rose",
    label: "Rose Day Special",
    title: "A Virtual Bloom",
    icon: Flower,
    question: "A rose for the most beautiful person I know.",
    description: "Perfect for starting the Valentine's week with grace.",
    accent: "#f43f5e",
    theme: {
      primary: "text-rose-600",
      bg: "bg-rose-50",
      button: "bg-rose-600 hover:bg-rose-700 text-white"
    }
  },
  propose: {
    id: "propose",
    label: "Propose Day",
    title: "My Heart's Choice",
    icon: Flame,
    question: "I want to walk through life with you. Always.",
    description: "For that special moment when you want to say it all.",
    accent: "#fbbf24",
    theme: {
      primary: "text-amber-600",
      bg: "bg-amber-50",
      button: "bg-amber-500 hover:bg-amber-600 text-black"
    }
  },
  custom: {
    id: "custom",
    label: "Just a Love Note",
    title: "Deeply Personal",
    icon: Mail,
    question: "I just wanted to remind you how much you mean to me.",
    description: "A simple, elegant way to say 'I love you' any day.",
    accent: "#8b5cf6",
    theme: {
      primary: "text-violet-600",
      bg: "bg-violet-50",
      button: "bg-violet-600 hover:bg-violet-700 text-white"
    }
  },
  friendship: {
    id: "friendship",
    label: "Galentine's / Friendship",
    title: "You're The Best",
    icon: Sparkles,
    question: "Thanks for being the brightest star in my sky.",
    description: "Celebrate the friends who are always there for you.",
    accent: "#06b6d4",
    theme: {
      primary: "text-cyan-600",
      bg: "bg-cyan-50",
      button: "bg-cyan-500 hover:bg-cyan-600 text-white"
    }
  }
};

export const vibes = {
  sparkle: { 
    id: "sparkle",
    label: "Magic Sparkle", 
    className: "bg-[#020617] text-white", 
    accent: "text-amber-300",
    button: "bg-amber-400 hover:bg-amber-500 text-black shadow-lg",
    particleColor: "#fbbf24",
    animationType: "stars",
    cardClass: "bg-white/5 border-white/10 backdrop-blur-xl shadow-2xl",
    font: "font-serif",
    finalMsgFont: "italic tracking-tight"
  },
  soft: { 
    id: "soft",
    label: "Dreamy Rose", 
    className: "bg-[#fff1f2] text-rose-900",
    accent: "text-rose-500",
    button: "bg-rose-500 hover:bg-rose-600 text-white shadow-md",
    particleColor: "#fb7185",
    animationType: "petals",
    cardClass: "bg-white/90 border-rose-100 backdrop-blur-sm shadow-xl",
    font: "font-serif",
    finalMsgFont: "font-serif italic font-light"
  },
  retro: { 
    id: "retro",
    label: "Pop Heart", 
    className: "bg-[#fefce8] text-orange-950",
    accent: "text-orange-600",
    button: "bg-black hover:bg-zinc-800 text-white shadow-[4px_4px_0px_#ea580c]",
    particleColor: "#ea580c",
    animationType: "bouncing",
    cardClass: "bg-white border-2 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.1)]",
    font: "font-sans font-bold",
    finalMsgFont: "font-sans uppercase font-black"
  },
  neon: {
    id: "neon",
    label: "Neon Nights",
    className: "bg-black text-white",
    accent: "text-fuchsia-400",
    button: "bg-fuchsia-500 hover:bg-fuchsia-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.5)]",
    particleColor: "#d946ef",
    animationType: "stars",
    cardClass: "bg-zinc-900/80 border-fuchsia-500/30 border backdrop-blur-md shadow-[0_0_30px_rgba(217,70,239,0.2)]",
    font: "font-mono",
    finalMsgFont: "font-mono font-bold tracking-tighter"
  }
};
