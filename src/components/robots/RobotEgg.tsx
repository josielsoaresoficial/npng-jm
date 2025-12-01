import { motion } from 'framer-motion';

interface RobotEggProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotEgg = ({ isActive, mood = 'neutral' }: RobotEggProps) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Egg white gradient */}
        <linearGradient id="eggWhiteGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#f5f5f5" />
        </linearGradient>
        
        {/* Yolk gradient */}
        <radialGradient id="yolkGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffd700" />
          <stop offset="100%" stopColor="#ffb700" />
        </radialGradient>
        
        {/* Cheek gradient */}
        <radialGradient id="eggCheekGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff9999" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff9999" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main egg body (white part) */}
      <motion.ellipse
        cx="100"
        cy="105"
        rx="55"
        ry="70"
        fill="url(#eggWhiteGradient)"
        stroke="#e0e0e0"
        strokeWidth="2"
        animate={isActive ? {
          scale: [1, 1.02, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Highlight on egg */}
      <ellipse
        cx="85"
        cy="85"
        rx="15"
        ry="20"
        fill="white"
        opacity="0.4"
      />

      {/* Yolk (visible inside) */}
      <motion.circle
        cx="100"
        cy="120"
        r="20"
        fill="url(#yolkGradient)"
        animate={isActive ? {
          scale: [1, 1.05, 1],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Yolk shine */}
      <circle
        cx="95"
        cy="115"
        r="6"
        fill="white"
        opacity="0.5"
      />

      {/* Eyes */}
      <motion.ellipse
        cx="85"
        cy="95"
        rx={isActive ? 4 : 3}
        ry={isActive ? 8 : 6}
        fill="#333333"
        animate={isActive ? {
          ry: [8, 2, 8],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.ellipse
        cx="115"
        cy="95"
        rx={isActive ? 4 : 3}
        ry={isActive ? 8 : 6}
        fill="#333333"
        animate={isActive ? {
          ry: [8, 2, 8],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      />

      {/* Eye highlights */}
      <circle cx="86" cy="92" r="2" fill="white" opacity="0.8" />
      <circle cx="116" cy="92" r="2" fill="white" opacity="0.8" />

      {/* Cheeks */}
      <ellipse cx="70" cy="105" rx="8" ry="6" fill="url(#eggCheekGradient)" />
      <ellipse cx="130" cy="105" rx="8" ry="6" fill="url(#eggCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive 
          ? "M 85 108 Q 100 118 115 108"
          : "M 85 110 Q 100 115 115 110"
        }
        stroke="#ff9999"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={isActive ? {
          d: [
            "M 85 108 Q 100 118 115 108",
            "M 85 110 Q 100 115 115 110",
            "M 85 108 Q 100 118 115 108"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Egg shell cracks (decorative) */}
      <path
        d="M 145 90 L 150 95 L 145 100"
        stroke="#d0d0d0"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />
      <path
        d="M 55 120 L 50 125 L 55 130"
        stroke="#d0d0d0"
        strokeWidth="1.5"
        fill="none"
        opacity="0.3"
      />

      {/* Base shadow */}
      <ellipse
        cx="100"
        cy="175"
        rx="40"
        ry="8"
        fill="#000000"
        opacity="0.1"
      />
    </svg>
  );
};
