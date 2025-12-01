import { motion } from 'framer-motion';

interface RobotWatermelonProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotWatermelon = ({ isActive, mood = 'neutral' }: RobotWatermelonProps) => {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="watermelonGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff6b6b" />
          <stop offset="100%" stopColor="#ee5a6f" />
        </linearGradient>

        <radialGradient id="watermelonCheekGradient">
          <stop offset="0%" stopColor="#ffe3e3" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffe3e3" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Watermelon slice body */}
      <motion.g
        animate={isActive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 100px' }}
      >
        {/* Main red part */}
        <path
          d="M60,70 Q60,140 100,165 Q140,140 140,70 Z"
          fill="url(#watermelonGradient)"
        />
        
        {/* White rind */}
        <path
          d="M62,72 Q62,138 100,162 Q138,138 138,72"
          stroke="#ffffff"
          strokeWidth="8"
          fill="none"
        />
        
        {/* Green outer rind */}
        <path
          d="M60,70 Q60,140 100,165 Q140,140 140,70"
          stroke="#6dc36d"
          strokeWidth="12"
          fill="none"
        />
      </motion.g>

      {/* Seeds (decorative) */}
      <g opacity="0.6">
        <ellipse cx="85" cy="105" rx="4" ry="6" fill="#2d3436" transform="rotate(15 85 105)" />
        <ellipse cx="115" cy="105" rx="4" ry="6" fill="#2d3436" transform="rotate(-15 115 105)" />
        <ellipse cx="100" cy="125" rx="4" ry="6" fill="#2d3436" />
        <ellipse cx="80" cy="130" rx="4" ry="6" fill="#2d3436" transform="rotate(25 80 130)" />
        <ellipse cx="120" cy="130" rx="4" ry="6" fill="#2d3436" transform="rotate(-25 120 130)" />
      </g>

      {/* Eyes */}
      <motion.g>
        {/* Left eye */}
        <ellipse cx="82" cy="90" rx="9" ry={isActive ? 11 : 7} fill="#2d3436" />
        <ellipse cx="84" cy="87" rx="4" ry="5" fill="#ffffff" />
        
        {/* Right eye */}
        <ellipse cx="118" cy="90" rx="9" ry={isActive ? 11 : 7} fill="#2d3436" />
        <ellipse cx="120" cy="87" rx="4" ry="5" fill="#ffffff" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="65" cy="100" rx="11" ry="9" fill="url(#watermelonCheekGradient)" />
      <ellipse cx="135" cy="100" rx="11" ry="9" fill="url(#watermelonCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive ? "M85,108 Q100,118 115,108" : "M85,108 Q100,111 115,108"}
        stroke="#c92a2a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: ["M85,108 Q100,118 115,108", "M85,108 Q100,115 115,108", "M85,108 Q100,118 115,108"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Base */}
      <ellipse cx="100" cy="170" rx="32" ry="12" fill="#ee5a6f" opacity="0.3" />
      <motion.ellipse
        cx="100"
        cy="195"
        rx="36"
        ry="15"
        fill="#ee5a6f"
        opacity="0.2"
      />
    </svg>
  );
};
