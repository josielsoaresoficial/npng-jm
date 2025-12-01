import { motion } from 'framer-motion';

interface RobotCarrotProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotCarrot = ({ isActive, mood = 'neutral' }: RobotCarrotProps) => {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="carrotGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ff922b" />
          <stop offset="100%" stopColor="#fd7e14" />
        </linearGradient>

        <radialGradient id="carrotCheekGradient">
          <stop offset="0%" stopColor="#ffe8cc" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffe8cc" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Green leaves on top */}
      <motion.g
        animate={isActive ? { rotate: [-3, 3, -3] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        style={{ transformOrigin: '100px 40px' }}
      >
        <ellipse cx="85" cy="35" rx="12" ry="18" fill="#56ab2f" transform="rotate(-20 85 35)" />
        <ellipse cx="100" cy="30" rx="14" ry="20" fill="#6dc36d" />
        <ellipse cx="115" cy="35" rx="12" ry="18" fill="#56ab2f" transform="rotate(20 115 35)" />
      </motion.g>

      {/* Carrot body */}
      <motion.path
        d="M100,50 Q120,55 125,75 Q130,95 125,120 Q118,145 108,160 Q100,170 92,160 Q82,145 75,120 Q70,95 75,75 Q80,55 100,50"
        fill="url(#carrotGradient)"
        stroke="#e67700"
        strokeWidth="3"
        animate={isActive ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 110px' }}
      />

      {/* Carrot lines (texture) */}
      <g opacity="0.3">
        <line x1="85" y1="70" x2="88" y2="75" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
        <line x1="115" y1="70" x2="112" y2="75" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="95" x2="84" y2="100" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
        <line x1="120" y1="95" x2="116" y2="100" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
        <line x1="85" y1="120" x2="90" y2="125" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
        <line x1="115" y1="120" x2="110" y2="125" stroke="#d86400" strokeWidth="2" strokeLinecap="round" />
      </g>

      {/* Eyes */}
      <motion.g>
        {/* Left eye */}
        <ellipse cx="85" cy="85" rx="9" ry={isActive ? 12 : 7} fill="#2d3436" />
        <ellipse cx="87" cy="82" rx="4" ry="5" fill="#ffffff" />
        
        {/* Right eye */}
        <ellipse cx="115" cy="85" rx="9" ry={isActive ? 12 : 7} fill="#2d3436" />
        <ellipse cx="117" cy="82" rx="4" ry="5" fill="#ffffff" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="68" cy="95" rx="11" ry="9" fill="url(#carrotCheekGradient)" />
      <ellipse cx="132" cy="95" rx="11" ry="9" fill="url(#carrotCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive ? "M88,105 Q100,115 112,105" : "M88,105 Q100,108 112,105"}
        stroke="#d86400"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: ["M88,105 Q100,115 112,105", "M88,105 Q100,112 112,105", "M88,105 Q100,115 112,105"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Base */}
      <ellipse cx="100" cy="175" rx="28" ry="10" fill="#fd7e14" opacity="0.3" />
      <motion.ellipse
        cx="100"
        cy="195"
        rx="32"
        ry="13"
        fill="#fd7e14"
        opacity="0.2"
      />
    </svg>
  );
};
