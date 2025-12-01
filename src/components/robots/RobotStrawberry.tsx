import { motion } from 'framer-motion';

interface RobotStrawberryProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotStrawberry = ({ isActive, mood = 'neutral' }: RobotStrawberryProps) => {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <radialGradient id="strawberryGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ff6b9d" />
          <stop offset="60%" stopColor="#ff3d71" />
          <stop offset="100%" stopColor="#e63946" />
        </radialGradient>

        <radialGradient id="strawberryCheekGradient">
          <stop offset="0%" stopColor="#ffdeeb" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffdeeb" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Green leaves on top */}
      <motion.g
        animate={isActive ? { rotate: [-4, 4, -4] } : {}}
        transition={{ duration: 1.8, repeat: Infinity }}
        style={{ transformOrigin: '100px 45px' }}
      >
        <path d="M80,45 Q85,35 90,40 Q95,45 100,40 Q105,45 110,40 Q115,35 120,45" fill="#6dc36d" />
        <ellipse cx="85" cy="40" rx="10" ry="7" fill="#6dc36d" transform="rotate(-25 85 40)" />
        <ellipse cx="100" cy="35" rx="12" ry="8" fill="#56ab2f" />
        <ellipse cx="115" cy="40" rx="10" ry="7" fill="#6dc36d" transform="rotate(25 115 40)" />
      </motion.g>

      {/* Strawberry body */}
      <motion.path
        d="M100,45 Q130,50 135,80 Q138,110 130,135 Q115,155 100,160 Q85,155 70,135 Q62,110 65,80 Q70,50 100,45"
        fill="url(#strawberryGradient)"
        stroke="#c92a2a"
        strokeWidth="2"
        animate={isActive ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 102px' }}
      />

      {/* Seeds (dots pattern) */}
      <g opacity="0.5">
        <ellipse cx="85" cy="70" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="115" cy="70" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="75" cy="90" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="100" cy="85" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="125" cy="90" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="85" cy="105" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="115" cy="105" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="100" cy="115" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="80" cy="125" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="120" cy="125" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="95" cy="138" rx="3" ry="4" fill="#ffe066" />
        <ellipse cx="105" cy="138" rx="3" ry="4" fill="#ffe066" />
      </g>

      {/* Eyes */}
      <motion.g>
        {/* Left eye */}
        <ellipse cx="82" cy="80" rx="9" ry={isActive ? 12 : 7} fill="#2d3436" />
        <ellipse cx="84" cy="77" rx="4" ry="5" fill="#ffffff" />
        
        {/* Right eye */}
        <ellipse cx="118" cy="80" rx="9" ry={isActive ? 12 : 7} fill="#2d3436" />
        <ellipse cx="120" cy="77" rx="4" ry="5" fill="#ffffff" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="65" cy="95" rx="12" ry="10" fill="url(#strawberryCheekGradient)" />
      <ellipse cx="135" cy="95" rx="12" ry="10" fill="url(#strawberryCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive ? "M85,100 Q100,110 115,100" : "M85,100 Q100,103 115,100"}
        stroke="#c92a2a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: ["M85,100 Q100,110 115,100", "M85,100 Q100,107 115,100", "M85,100 Q100,110 115,100"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Base */}
      <ellipse cx="100" cy="165" rx="30" ry="11" fill="#e63946" opacity="0.3" />
      <motion.ellipse
        cx="100"
        cy="190"
        rx="34"
        ry="14"
        fill="#e63946"
        opacity="0.2"
      />
    </svg>
  );
};
