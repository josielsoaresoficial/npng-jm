import { motion } from 'framer-motion';

interface RobotBroccoliProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotBroccoli = ({ isActive, mood = 'neutral' }: RobotBroccoliProps) => {
  return (
    <svg viewBox="0 0 200 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="broccoliStemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#b8e6b8" />
          <stop offset="100%" stopColor="#8fc98f" />
        </linearGradient>

        <radialGradient id="broccoliCheekGradient">
          <stop offset="0%" stopColor="#d3f9d8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d3f9d8" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Broccoli florets (top/head) */}
      <motion.g
        animate={isActive ? { y: [0, -3, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {/* Multiple circular florets */}
        <circle cx="85" cy="50" r="18" fill="#6dc36d" opacity="0.9" />
        <circle cx="115" cy="50" r="18" fill="#6dc36d" opacity="0.9" />
        <circle cx="100" cy="35" r="20" fill="#6dc36d" />
        <circle cx="70" cy="65" r="16" fill="#5cb85c" opacity="0.9" />
        <circle cx="130" cy="65" r="16" fill="#5cb85c" opacity="0.9" />
        <circle cx="100" cy="60" r="17" fill="#5cb85c" />
        
        {/* Texture dots on florets */}
        <g opacity="0.4">
          <circle cx="85" cy="45" r="2" fill="#4a9b4a" />
          <circle cx="90" cy="52" r="2" fill="#4a9b4a" />
          <circle cx="115" cy="48" r="2" fill="#4a9b4a" />
          <circle cx="110" cy="54" r="2" fill="#4a9b4a" />
          <circle cx="100" cy="32" r="2" fill="#4a9b4a" />
          <circle cx="105" cy="38" r="2" fill="#4a9b4a" />
        </g>
      </motion.g>

      {/* Stem (body) */}
      <motion.path
        d="M80,75 L80,140 Q80,155 100,160 Q120,155 120,140 L120,75"
        fill="url(#broccoliStemGradient)"
        stroke="#7fb87f"
        strokeWidth="3"
        animate={isActive ? { scale: [1, 1.02, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ transformOrigin: '100px 115px' }}
      />

      {/* Eyes on the florets area */}
      <motion.g>
        {/* Left eye */}
        <ellipse cx="85" cy="55" rx="8" ry={isActive ? 10 : 6} fill="#2d3436" />
        <ellipse cx="86" cy="52" rx="3" ry="4" fill="#ffffff" />
        
        {/* Right eye */}
        <ellipse cx="115" cy="55" rx="8" ry={isActive ? 10 : 6} fill="#2d3436" />
        <ellipse cx="116" cy="52" rx="3" ry="4" fill="#ffffff" />
      </motion.g>

      {/* Cheeks */}
      <ellipse cx="68" cy="65" rx="10" ry="8" fill="url(#broccoliCheekGradient)" />
      <ellipse cx="132" cy="65" rx="10" ry="8" fill="url(#broccoliCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive ? "M88,70 Q100,78 112,70" : "M88,70 Q100,73 112,70"}
        stroke="#4a9b4a"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        animate={isActive ? { d: ["M88,70 Q100,78 112,70", "M88,70 Q100,75 112,70", "M88,70 Q100,78 112,70"] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />

      {/* Base */}
      <ellipse cx="100" cy="165" rx="30" ry="12" fill="#8fc98f" opacity="0.4" />
      <motion.ellipse
        cx="100"
        cy="190"
        rx="35"
        ry="15"
        fill="#8fc98f"
        opacity="0.3"
      />
    </svg>
  );
};
