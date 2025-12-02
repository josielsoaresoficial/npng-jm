import { motion } from 'framer-motion';

export type CharacterMood = 'neutral' | 'happy' | 'thinking' | 'excited' | 'sad' | 'serious';

interface NutriCharacterProps {
  isActive: boolean;
  isSpeaking: boolean;
  mood: CharacterMood;
  size?: number;
}

const NutriCharacter = ({ isActive, isSpeaking, mood, size = 120 }: NutriCharacterProps) => {
  // Eye expressions based on mood and state
  const getEyeContent = () => {
    if (!isActive) {
      // Sleeping - closed curved eyes
      return (
        <>
          <path d="M75 100 Q85 90 95 100" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M125 100 Q135 90 145 100" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    }

    if (mood === 'happy' || mood === 'excited') {
      // Happy curved eyes ^_^
      return (
        <>
          <path d="M75 100 Q85 90 95 100" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M125 100 Q135 90 145 100" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    }

    if (mood === 'sad') {
      // Sad curved eyes
      return (
        <>
          <path d="M75 95 Q85 105 95 95" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M125 95 Q135 105 145 95" stroke="hsl(var(--primary))" strokeWidth="3" fill="none" strokeLinecap="round" />
        </>
      );
    }

    if (mood === 'thinking') {
      // One eye looking up
      return (
        <>
          <circle cx="85" cy="98" r="8" fill="hsl(var(--primary))" />
          <circle cx="135" cy="95" r="8" fill="hsl(var(--primary))" />
          <circle cx="87" cy="93" r="3" fill="white" opacity="0.6" />
        </>
      );
    }

    // Default neutral - round eyes with highlight
    return (
      <>
        <circle cx="85" cy="100" r="8" fill="hsl(var(--primary))" />
        <circle cx="135" cy="100" r="8" fill="hsl(var(--primary))" />
        <circle cx="87" cy="96" r="3" fill="white" opacity="0.6" />
        <circle cx="137" cy="96" r="3" fill="white" opacity="0.6" />
      </>
    );
  };

  // Mouth based on mood and speaking state
  const getMouth = () => {
    if (isSpeaking) {
      return (
        <motion.ellipse
          cx="110"
          cy="125"
          rx="10"
          ry="6"
          fill="hsl(var(--primary))"
          animate={{ ry: [4, 8, 4] }}
          transition={{ repeat: Infinity, duration: 0.3 }}
        />
      );
    }

    if (mood === 'sad') {
      return <path d="M100 128 Q110 122 120 128" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
    }

    // Default smile
    return <path d="M95 122 Q110 132 125 122" stroke="hsl(var(--primary))" strokeWidth="2.5" fill="none" strokeLinecap="round" />;
  };

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <defs>
        {/* Head gradient - blue-gray metallic */}
        <linearGradient id="headGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(210 20% 75%)" />
          <stop offset="50%" stopColor="hsl(210 25% 65%)" />
          <stop offset="100%" stopColor="hsl(210 30% 55%)" />
        </linearGradient>

        {/* Face visor gradient - dark blue */}
        <linearGradient id="visorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="hsl(220 40% 25%)" />
          <stop offset="100%" stopColor="hsl(220 50% 15%)" />
        </linearGradient>

        {/* Glow effect */}
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>

        {/* Soft shadow */}
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* Ground glow ring */}
      <motion.ellipse
        cx="110"
        cy="200"
        rx="50"
        ry="10"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="2"
        opacity="0.3"
        animate={isActive ? { 
          rx: [45, 55, 45],
          opacity: [0.2, 0.4, 0.2]
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
      />
      <motion.ellipse
        cx="110"
        cy="200"
        rx="35"
        ry="7"
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth="1.5"
        opacity="0.2"
        animate={isActive ? { 
          rx: [30, 40, 30],
          opacity: [0.1, 0.3, 0.1]
        } : {}}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
      />

      {/* Body/Neck - dark cylindrical */}
      <ellipse cx="110" cy="175" rx="20" ry="15" fill="hsl(220 30% 20%)" />
      <rect x="95" y="160" width="30" height="20" fill="hsl(220 30% 20%)" />

      {/* Left Antenna */}
      <motion.g
        animate={isActive ? { rotate: [-5, 5, -5] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{ transformOrigin: '65px 80px' }}
      >
        <rect x="63" y="40" width="4" height="45" fill="hsl(220 30% 25%)" rx="2" />
        {/* Antenna tip with glow */}
        <motion.circle
          cx="65"
          cy="38"
          r="6"
          fill="hsl(var(--primary))"
          filter="url(#glow)"
          animate={isActive ? { 
            opacity: [0.7, 1, 0.7],
            r: [5, 7, 5]
          } : { opacity: 0.4 }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      </motion.g>

      {/* Right Antenna */}
      <motion.g
        animate={isActive ? { rotate: [5, -5, 5] } : {}}
        transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        style={{ transformOrigin: '155px 80px' }}
      >
        <rect x="153" y="40" width="4" height="45" fill="hsl(220 30% 25%)" rx="2" />
        {/* Antenna tip with glow */}
        <motion.circle
          cx="155"
          cy="38"
          r="6"
          fill="hsl(var(--primary))"
          filter="url(#glow)"
          animate={isActive ? { 
            opacity: [0.7, 1, 0.7],
            r: [5, 7, 5]
          } : { opacity: 0.4 }}
          transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
        />
      </motion.g>

      {/* Head - main rounded shape */}
      <motion.ellipse
        cx="110"
        cy="110"
        rx="65"
        ry="60"
        fill="url(#headGradient)"
        filter="url(#shadow)"
        animate={isSpeaking ? { scale: [1, 1.02, 1] } : {}}
        transition={{ repeat: Infinity, duration: 0.3 }}
      />

      {/* Head highlight - glossy effect */}
      <ellipse cx="90" cy="70" rx="30" ry="15" fill="white" opacity="0.25" />

      {/* Head band/line */}
      <path
        d="M50 95 Q110 85 170 95"
        stroke="hsl(210 25% 55%)"
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />

      {/* Face visor - dark rounded rectangle */}
      <rect
        x="60"
        y="80"
        width="100"
        height="65"
        rx="20"
        ry="20"
        fill="url(#visorGradient)"
      />

      {/* Eyes */}
      <motion.g
        animate={isActive && !isSpeaking ? {
          scaleY: [1, 0.1, 1],
        } : {}}
        transition={{
          repeat: Infinity,
          repeatDelay: 3,
          duration: 0.2,
        }}
        style={{ transformOrigin: '110px 100px' }}
      >
        {getEyeContent()}
      </motion.g>

      {/* Mouth */}
      {getMouth()}

      {/* Sleep ZZZ bubble */}
      {!isActive && (
        <motion.g
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Balão principal com flutuação */}
          <motion.ellipse 
            cx="175" 
            cy="35" 
            rx="30" 
            ry="22" 
            fill="white" 
            stroke="hsl(210 20% 85%)" 
            strokeWidth="1"
            animate={{ 
              y: [0, -3, 0],
              scaleY: [1, 1.03, 1]
            }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          />
          
          {/* Bolinhas de conexão com pulso */}
          <motion.circle 
            cx="155" 
            cy="55" 
            r="6" 
            fill="white" 
            stroke="hsl(210 20% 85%)" 
            strokeWidth="1"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.2, ease: "easeInOut" }}
          />
          <motion.circle 
            cx="145" 
            cy="65" 
            r="4" 
            fill="white" 
            stroke="hsl(210 20% 85%)" 
            strokeWidth="1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: 0.4, ease: "easeInOut" }}
          />
          
          {/* Três Z's flutuando sequencialmente */}
          <motion.text
            x="162"
            y="40"
            fontSize="10"
            fontWeight="bold"
            fill="hsl(220 40% 35%)"
            animate={{ 
              y: [0, -12, -24],
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.7]
            }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeOut" }}
          >
            z
          </motion.text>
          <motion.text
            x="170"
            y="38"
            fontSize="14"
            fontWeight="bold"
            fill="hsl(220 40% 30%)"
            animate={{ 
              y: [0, -12, -24],
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.7]
            }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 0.6, ease: "easeOut" }}
          >
            z
          </motion.text>
          <motion.text
            x="180"
            y="36"
            fontSize="18"
            fontWeight="bold"
            fill="hsl(220 40% 25%)"
            animate={{ 
              y: [0, -12, -24],
              opacity: [0, 1, 0],
              scale: [0.6, 1, 0.7]
            }}
            transition={{ repeat: Infinity, duration: 2.5, delay: 1.2, ease: "easeOut" }}
          >
            Z
          </motion.text>
        </motion.g>
      )}

      {/* Thinking dots */}
      {isActive && mood === 'thinking' && (
        <motion.g>
          {[0, 1, 2].map((i) => (
            <motion.circle
              key={i}
              cx={170 + i * 12}
              cy={50}
              r={4}
              fill="hsl(var(--primary))"
              animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
            />
          ))}
        </motion.g>
      )}

      {/* Excited sparkles */}
      {isActive && mood === 'excited' && (
        <motion.g>
          {[
            { x: 45, y: 60 },
            { x: 175, y: 55 },
            { x: 50, y: 140 },
            { x: 170, y: 145 },
          ].map((pos, i) => (
            <motion.text
              key={i}
              x={pos.x}
              y={pos.y}
              fontSize="14"
              fill="hsl(var(--primary))"
              animate={{ 
                scale: [0.8, 1.2, 0.8], 
                opacity: [0.5, 1, 0.5],
                rotate: [0, 15, 0]
              }}
              transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
            >
              ✦
            </motion.text>
          ))}
        </motion.g>
      )}

      {/* Growing dots animation when active */}
      {isActive && (
        <motion.g>
          {[
            { r: 4, delay: 0 },
            { r: 6, delay: 0.3 },
            { r: 8, delay: 0.6 },
          ].map((dot, i) => (
            <motion.circle
              key={i}
              cx={110}
              cy={15 - i * 12}
              r={dot.r}
              fill="hsl(var(--primary))"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ 
                scale: [0, 1, 1],
                opacity: [0, 1, 0.7]
              }}
              transition={{ 
                duration: 0.5,
                delay: dot.delay,
                repeat: Infinity,
                repeatDelay: 2
              }}
            />
          ))}
        </motion.g>
      )}
    </motion.svg>
  );
};

export default NutriCharacter;
