import { motion } from 'framer-motion';

interface RobotOrangeProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotOrange = ({ isActive, mood = 'neutral' }: RobotOrangeProps) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Orange body gradient */}
        <radialGradient id="orangeBodyGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ff9800" />
          <stop offset="100%" stopColor="#f57c00" />
        </radialGradient>
        
        {/* Segment gradient */}
        <radialGradient id="segmentGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffb74d" />
          <stop offset="100%" stopColor="#ff9800" />
        </radialGradient>
        
        {/* Cheek gradient */}
        <radialGradient id="orangeCheekGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff9999" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff9999" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main orange body */}
      <motion.circle
        cx="100"
        cy="105"
        r="55"
        fill="url(#orangeBodyGradient)"
        animate={isActive ? {
          scale: [1, 1.03, 1],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Orange peel texture (dots) */}
      {[...Array(40)].map((_, i) => {
        const angle = (i / 40) * Math.PI * 2;
        const radius = 45 + Math.random() * 8;
        const x = 100 + Math.cos(angle) * radius;
        const y = 105 + Math.sin(angle) * radius;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="1.5"
            fill="#ef6c00"
            opacity="0.3"
          />
        );
      })}

      {/* Orange segments (decorative pattern) */}
      <g opacity="0.2">
        <line x1="100" y1="105" x2="100" y2="60" stroke="#ef6c00" strokeWidth="2" />
        <line x1="100" y1="105" x2="145" y2="90" stroke="#ef6c00" strokeWidth="2" />
        <line x1="100" y1="105" x2="140" y2="135" stroke="#ef6c00" strokeWidth="2" />
        <line x1="100" y1="105" x2="100" y2="150" stroke="#ef6c00" strokeWidth="2" />
        <line x1="100" y1="105" x2="60" y2="135" stroke="#ef6c00" strokeWidth="2" />
        <line x1="100" y1="105" x2="55" y2="90" stroke="#ef6c00" strokeWidth="2" />
      </g>

      {/* Leaf on top */}
      <motion.ellipse
        cx="100"
        cy="50"
        rx="8"
        ry="12"
        fill="#4caf50"
        animate={isActive ? {
          rotate: [-5, 5, -5],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Leaf vein */}
      <line
        x1="100"
        y1="44"
        x2="100"
        y2="56"
        stroke="#388e3c"
        strokeWidth="1"
        opacity="0.5"
      />

      {/* Highlight */}
      <ellipse
        cx="85"
        cy="85"
        rx="15"
        ry="20"
        fill="white"
        opacity="0.3"
      />

      {/* Eyes */}
      <motion.ellipse
        cx="85"
        cy="100"
        rx={isActive ? 5 : 4}
        ry={isActive ? 9 : 7}
        fill="#333333"
        animate={isActive ? {
          ry: [9, 2, 9],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.ellipse
        cx="115"
        cy="100"
        rx={isActive ? 5 : 4}
        ry={isActive ? 9 : 7}
        fill="#333333"
        animate={isActive ? {
          ry: [9, 2, 9],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      />

      {/* Eye highlights */}
      <circle cx="86" cy="96" r="2.5" fill="white" opacity="0.8" />
      <circle cx="116" cy="96" r="2.5" fill="white" opacity="0.8" />

      {/* Cheeks */}
      <ellipse cx="68" cy="110" rx="9" ry="7" fill="url(#orangeCheekGradient)" />
      <ellipse cx="132" cy="110" rx="9" ry="7" fill="url(#orangeCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive 
          ? "M 85 115 Q 100 125 115 115"
          : "M 85 117 Q 100 122 115 117"
        }
        stroke="#ff9999"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        animate={isActive ? {
          d: [
            "M 85 115 Q 100 125 115 115",
            "M 85 117 Q 100 122 115 117",
            "M 85 115 Q 100 125 115 115"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Juice drops (when active) */}
      {isActive && (
        <>
          <motion.ellipse
            cx="65"
            cy="140"
            rx="3"
            ry="4"
            fill="#ff9800"
            opacity="0.6"
            animate={{
              y: [0, 10, 0],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.ellipse
            cx="135"
            cy="145"
            rx="3"
            ry="4"
            fill="#ff9800"
            opacity="0.6"
            animate={{
              y: [0, 10, 0],
              opacity: [0.6, 0, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </>
      )}

      {/* Base shadow */}
      <ellipse
        cx="100"
        cy="175"
        rx="45"
        ry="8"
        fill="#000000"
        opacity="0.1"
      />
    </svg>
  );
};
