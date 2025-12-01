import { motion } from 'framer-motion';

interface RobotAvocadoProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotAvocado = ({ isActive, mood = 'neutral' }: RobotAvocadoProps) => {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="avocadoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6dc36d" />
          <stop offset="100%" stopColor="#4a9b4a" />
        </linearGradient>
        
        <radialGradient id="avocadoSeedGradient">
          <stop offset="0%" stopColor="#d4a574" />
          <stop offset="100%" stopColor="#b8834d" />
        </radialGradient>

        <radialGradient id="avocadoCheekGradient">
          <stop offset="0%" stopColor="#c3fae8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c3fae8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Avocado body (outer green) */}
      <motion.path
        d="M100,40 Q140,45 145,85 Q148,120 140,145 Q130,165 100,170 Q70,165 60,145 Q52,120 55,85 Q60,45 100,40"
        fill="url(#avocadoGradient)"
        stroke="#4a9b4a"
        strokeWidth="3"
        animate={isActive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 105px' }}
      />

      {/* Inner lighter green */}
      <ellipse cx="100" cy="105" rx="35" ry="45" fill="#b8e6b8" opacity="0.6" />

      {/* Seed (caroço) */}
      <motion.circle
        cx="100"
        cy="115"
        r="18"
        fill="url(#avocadoSeedGradient)"
        stroke="#9a6d3a"
        strokeWidth="2"
        animate={isActive ? { y: [0, -2, 0] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Eyes on the avocado body */}
      <motion.g>
        {/* Left eye */}
        <ellipse cx="82" cy="85" rx="9" ry={isActive ? 11 : 7} fill="#2d3436" />
        <ellipse cx="84" cy="82" rx="4" ry="5" fill="#ffffff" />
        
        {/* Right eye */}
        <ellipse cx="118" cy="85" rx="9" ry={isActive ? 11 : 7} fill="#2d3436" />
        <ellipse cx="120" cy="82" rx="4" ry="5" fill="#ffffff" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="65" cy="95" rx="11" ry="8" fill="url(#avocadoCheekGradient)" />
      <ellipse cx="135" cy="95" rx="11" ry="8" fill="url(#avocadoCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive ? "M85,100 Q100,110 115,100" : "M85,100 Q100,103 115,100"}
        stroke="#4a9b4a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: ["M85,100 Q100,110 115,100", "M85,100 Q100,107 115,100", "M85,100 Q100,110 115,100"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Leaf on top */}
      <motion.g
        animate={isActive ? { rotate: [-5, 5, -5] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 35px' }}
      >
        <ellipse cx="100" cy="30" rx="18" ry="10" fill="#56ab2f" />
        <line x1="100" y1="30" x2="100" y2="40" stroke="#3d7a22" strokeWidth="3" strokeLinecap="round" />
      </motion.g>

      {/* Base */}
      <ellipse cx="100" cy="175" rx="30" ry="12" fill="#4a9b4a" opacity="0.3" />
      <motion.ellipse
        cx="100"
        cy="195"
        rx="35"
        ry="15"
        fill="#4a9b4a"
        opacity="0.2"
      />
    </svg>
  );
};
