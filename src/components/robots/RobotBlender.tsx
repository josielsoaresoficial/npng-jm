import { motion } from 'framer-motion';

interface RobotBlenderProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotBlender = ({ isActive, mood = 'neutral' }: RobotBlenderProps) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Glass gradient */}
        <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e3f2fd" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#bbdefb" stopOpacity="0.5" />
        </linearGradient>
        
        {/* Base gradient */}
        <linearGradient id="baseGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#607d8b" />
          <stop offset="100%" stopColor="#455a64" />
        </linearGradient>
        
        {/* Cheek gradient */}
        <radialGradient id="blenderCheekGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ff9999" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#ff9999" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Blender base */}
      <path
        d="M 65 140 L 70 155 L 130 155 L 135 140 Z"
        fill="url(#baseGradient)"
      />

      {/* Base bottom */}
      <rect
        x="60"
        y="155"
        width="80"
        height="8"
        fill="#37474f"
        rx="2"
      />

      {/* Control panel on base (where face will be) */}
      <rect
        x="75"
        y="143"
        width="50"
        height="10"
        fill="#546e7a"
        rx="2"
      />

      {/* Glass container */}
      <motion.path
        d="M 70 60 L 65 140 L 135 140 L 130 60 Z"
        fill="url(#glassGradient)"
        stroke="#90caf9"
        strokeWidth="2"
        animate={isActive ? {
          opacity: [0.7, 0.9, 0.7],
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Glass rim (top) */}
      <ellipse
        cx="100"
        cy="60"
        rx="30"
        ry="5"
        fill="#90caf9"
        opacity="0.5"
      />

      {/* Lid on top */}
      <ellipse
        cx="100"
        cy="55"
        rx="25"
        ry="4"
        fill="#78909c"
      />
      <ellipse
        cx="100"
        cy="51"
        rx="8"
        ry="3"
        fill="#607d8b"
      />

      {/* Fruits inside blender */}
      <motion.g
        animate={isActive ? {
          y: [0, -3, 0],
          rotate: [0, 5, -5, 0],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Strawberry */}
        <ellipse cx="85" cy="100" rx="8" ry="10" fill="#e91e63" />
        <path d="M 82 95 L 85 90 L 88 95 Z" fill="#4caf50" />
        
        {/* Banana slice */}
        <circle cx="115" cy="105" r="7" fill="#ffeb3b" />
        
        {/* Blueberry */}
        <circle cx="95" cy="120" r="5" fill="#3f51b5" />
        
        {/* Another berry */}
        <circle cx="110" cy="125" r="5" fill="#e91e63" />
        
        {/* Orange slice */}
        <circle cx="100" cy="85" r="6" fill="#ff9800" />
      </motion.g>

      {/* Liquid/smoothie level */}
      <motion.path
        d="M 68 120 Q 100 115, 132 120 L 130 140 L 70 140 Z"
        fill="#ff6090"
        opacity="0.4"
        animate={isActive ? {
          d: [
            "M 68 120 Q 100 115, 132 120 L 130 140 L 70 140 Z",
            "M 68 118 Q 100 113, 132 118 L 130 140 L 70 140 Z",
            "M 68 120 Q 100 115, 132 120 L 130 140 L 70 140 Z"
          ]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Bubbles (when active) */}
      {isActive && (
        <>
          <motion.circle
            cx="80"
            cy="110"
            r="3"
            fill="white"
            opacity="0.6"
            animate={{
              y: [-10, -30],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
          <motion.circle
            cx="95"
            cy="115"
            r="2"
            fill="white"
            opacity="0.6"
            animate={{
              y: [-10, -30],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.3
            }}
          />
          <motion.circle
            cx="115"
            cy="112"
            r="2.5"
            fill="white"
            opacity="0.6"
            animate={{
              y: [-10, -30],
              opacity: [0.6, 0],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeOut",
              delay: 0.6
            }}
          />
        </>
      )}

      {/* Control buttons on base */}
      <circle cx="85" cy="148" r="2" fill="#00e676" opacity="0.8" />
      <circle cx="95" cy="148" r="2" fill="#ffea00" opacity="0.8" />
      <circle cx="105" cy="148" r="2" fill="#ff6e40" opacity="0.8" />
      <circle cx="115" cy="148" r="2" fill="#d50000" opacity="0.8" />

      {/* Eyes on control panel */}
      <motion.ellipse
        cx="90"
        cy="148"
        rx={isActive ? 2 : 1.5}
        ry={isActive ? 4 : 3}
        fill="#333333"
        animate={isActive ? {
          ry: [4, 1, 4],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.ellipse
        cx="110"
        cy="148"
        rx={isActive ? 2 : 1.5}
        ry={isActive ? 4 : 3}
        fill="#333333"
        animate={isActive ? {
          ry: [4, 1, 4],
        } : {}}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.1
        }}
      />

      {/* Eye highlights */}
      <circle cx="91" cy="146.5" r="0.8" fill="white" opacity="0.8" />
      <circle cx="111" cy="146.5" r="0.8" fill="white" opacity="0.8" />

      {/* Cheeks on base sides */}
      <ellipse cx="75" cy="150" rx="4" ry="3" fill="url(#blenderCheekGradient)" />
      <ellipse cx="125" cy="150" rx="4" ry="3" fill="url(#blenderCheekGradient)" />

      {/* Mouth on control panel */}
      <motion.path
        d={isActive 
          ? "M 92 150 Q 100 153 108 150"
          : "M 92 150.5 Q 100 152 108 150.5"
        }
        stroke="#ff9999"
        strokeWidth="1"
        fill="none"
        strokeLinecap="round"
        animate={isActive ? {
          d: [
            "M 92 150 Q 100 153 108 150",
            "M 92 150.5 Q 100 152 108 150.5",
            "M 92 150 Q 100 153 108 150"
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
        rx="50"
        ry="8"
        fill="#000000"
        opacity="0.1"
      />
    </svg>
  );
};
