import { motion } from 'framer-motion';

interface RobotBananaProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotBanana = ({ isActive, mood = 'neutral' }: RobotBananaProps) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Banana peel gradient */}
        <linearGradient id="bananaPeelGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffeb3b" />
          <stop offset="100%" stopColor="#fdd835" />
        </linearGradient>
        
        {/* Banana fruit gradient */}
        <linearGradient id="bananaFruitGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff9c4" />
          <stop offset="100%" stopColor="#ffeb3b" />
        </linearGradient>
        
        {/* Cheek gradient */}
        <radialGradient id="bananaCheekGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff9999" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff9999" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main banana body (curved) */}
      <motion.path
        d="M 60 80 Q 70 60, 100 55 Q 130 50, 140 70 Q 145 90, 140 120 Q 135 145, 120 155 Q 105 160, 90 150 Q 75 140, 70 120 Q 65 100, 60 80 Z"
        fill="url(#bananaPeelGradient)"
        stroke="#f9a825"
        strokeWidth="2"
        animate={isActive ? {
          rotate: [0, -2, 2, 0],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Banana peel opening (left side) */}
      <motion.path
        d="M 70 90 Q 50 95, 45 110 Q 42 120, 50 125 Q 55 128, 65 120"
        fill="url(#bananaPeelGradient)"
        stroke="#f9a825"
        strokeWidth="2"
        animate={isActive ? {
          x: [-2, 0, -2],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Banana peel opening (right side) */}
      <motion.path
        d="M 130 90 Q 150 95, 155 110 Q 158 120, 150 125 Q 145 128, 135 120"
        fill="url(#bananaPeelGradient)"
        stroke="#f9a825"
        strokeWidth="2"
        animate={isActive ? {
          x: [2, 0, 2],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Peeled banana fruit (inside) */}
      <ellipse
        cx="100"
        cy="110"
        rx="30"
        ry="40"
        fill="url(#bananaFruitGradient)"
      />

      {/* Banana spots (brown marks when ripe) */}
      <motion.ellipse
        cx="90"
        cy="85"
        rx="4"
        ry="6"
        fill="#8d6e63"
        opacity={isActive ? 0.4 : 0.2}
      />
      <motion.ellipse
        cx="115"
        cy="75"
        rx="3"
        ry="5"
        fill="#8d6e63"
        opacity={isActive ? 0.4 : 0.2}
      />
      <motion.ellipse
        cx="105"
        cy="145"
        rx="5"
        ry="4"
        fill="#8d6e63"
        opacity={isActive ? 0.3 : 0.15}
      />

      {/* Stem/top */}
      <rect
        x="97"
        y="50"
        width="6"
        height="10"
        fill="#8d6e63"
        rx="2"
      />

      {/* Eyes */}
      <motion.ellipse
        cx="88"
        cy="105"
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
        cx="112"
        cy="105"
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
      <circle cx="89" cy="102" r="2" fill="white" opacity="0.8" />
      <circle cx="113" cy="102" r="2" fill="white" opacity="0.8" />

      {/* Cheeks */}
      <ellipse cx="75" cy="115" rx="8" ry="6" fill="url(#bananaCheekGradient)" />
      <ellipse cx="125" cy="115" rx="8" ry="6" fill="url(#bananaCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive 
          ? "M 88 120 Q 100 130 112 120"
          : "M 88 122 Q 100 127 112 122"
        }
        stroke="#ff9999"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        animate={isActive ? {
          d: [
            "M 88 120 Q 100 130 112 120",
            "M 88 122 Q 100 127 112 122",
            "M 88 120 Q 100 130 112 120"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Base shadow */}
      <ellipse
        cx="100"
        cy="175"
        rx="35"
        ry="8"
        fill="#000000"
        opacity="0.1"
      />
    </svg>
  );
};
