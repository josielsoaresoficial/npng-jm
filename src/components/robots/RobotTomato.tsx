import { motion } from 'framer-motion';

interface RobotTomatoProps {
  isActive: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

export const RobotTomato = ({ isActive, mood = 'neutral' }: RobotTomatoProps) => {
  return (
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        {/* Tomato body gradient */}
        <radialGradient id="tomatoBodyGradient" cx="40%" cy="40%">
          <stop offset="0%" stopColor="#ff5252" />
          <stop offset="100%" stopColor="#d32f2f" />
        </radialGradient>
        
        {/* Stem gradient */}
        <linearGradient id="stemGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#66bb6a" />
          <stop offset="100%" stopColor="#43a047" />
        </linearGradient>
        
        {/* Cheek gradient */}
        <radialGradient id="tomatoCheekGradient" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#ffcccb" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffcccb" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main tomato body (slightly squashed circle) */}
      <motion.ellipse
        cx="100"
        cy="110"
        rx="52"
        ry="48"
        fill="url(#tomatoBodyGradient)"
        animate={isActive ? {
          scale: [1, 1.02, 1],
          ry: [48, 50, 48],
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Tomato segments/indentations */}
      <g opacity="0.15">
        <path
          d="M 100 65 Q 90 90, 85 110 Q 83 125, 90 140"
          stroke="#c62828"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M 100 65 Q 110 90, 115 110 Q 117 125, 110 140"
          stroke="#c62828"
          strokeWidth="2"
          fill="none"
        />
      </g>

      {/* Leaves/sepals on top */}
      <g>
        {/* Center leaf pointing up */}
        <motion.path
          d="M 100 60 Q 100 45, 100 35 Q 95 40, 95 50 Q 95 55, 100 60 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            rotate: [0, -3, 3, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M 100 60 Q 100 45, 100 35 Q 105 40, 105 50 Q 105 55, 100 60 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            rotate: [0, -3, 3, 0],
          } : {}}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Left leaves */}
        <motion.path
          d="M 95 65 Q 80 60, 70 55 Q 75 60, 85 65 Q 90 67, 95 65 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            x: [-2, 0, -2],
            rotate: [0, -5, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M 90 70 Q 75 70, 65 68 Q 70 72, 80 75 Q 85 76, 90 70 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            x: [-1, 0, -1],
            rotate: [0, -3, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />

        {/* Right leaves */}
        <motion.path
          d="M 105 65 Q 120 60, 130 55 Q 125 60, 115 65 Q 110 67, 105 65 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            x: [2, 0, 2],
            rotate: [0, 5, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.path
          d="M 110 70 Q 125 70, 135 68 Q 130 72, 120 75 Q 115 76, 110 70 Z"
          fill="url(#stemGradient)"
          animate={isActive ? {
            x: [1, 0, 1],
            rotate: [0, 3, 0],
          } : {}}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.2
          }}
        />
      </g>

      {/* Highlight */}
      <ellipse
        cx="80"
        cy="90"
        rx="18"
        ry="22"
        fill="white"
        opacity="0.25"
      />

      {/* Eyes */}
      <motion.ellipse
        cx="85"
        cy="105"
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
        cy="105"
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
      <circle cx="86" cy="101" r="2.5" fill="white" opacity="0.9" />
      <circle cx="116" cy="101" r="2.5" fill="white" opacity="0.9" />

      {/* Cheeks */}
      <ellipse cx="67" cy="115" rx="10" ry="8" fill="url(#tomatoCheekGradient)" />
      <ellipse cx="133" cy="115" rx="10" ry="8" fill="url(#tomatoCheekGradient)" />

      {/* Mouth */}
      <motion.path
        d={isActive 
          ? "M 85 120 Q 100 130 115 120"
          : "M 85 122 Q 100 127 115 122"
        }
        stroke="#ffcccb"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        animate={isActive ? {
          d: [
            "M 85 120 Q 100 130 115 120",
            "M 85 122 Q 100 127 115 122",
            "M 85 120 Q 100 130 115 120"
          ]
        } : {}}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Small dots on tomato (texture) */}
      <circle cx="120" cy="95" r="1.5" fill="#c62828" opacity="0.3" />
      <circle cx="130" cy="108" r="1.5" fill="#c62828" opacity="0.3" />
      <circle cx="75" cy="125" r="1.5" fill="#c62828" opacity="0.3" />
      <circle cx="110" cy="135" r="1.5" fill="#c62828" opacity="0.3" />

      {/* Base shadow */}
      <ellipse
        cx="100"
        cy="175"
        rx="42"
        ry="8"
        fill="#000000"
        opacity="0.1"
      />
    </svg>
  );
};
