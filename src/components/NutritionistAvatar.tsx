import { motion, AnimatePresence } from 'framer-motion';
import nutriAvatar from '@/assets/nutri-avatar.svg';

interface NutritionistAvatarProps {
  isActive?: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful' | 'sleeping' | 'sad' | 'serious' | 'crying';
  isSpeaking?: boolean;
}

export const NutritionistAvatar = ({ 
  isActive = false, 
  mood = 'neutral',
  isSpeaking = false 
}: NutritionistAvatarProps) => {
  
  // Determinar estado dos olhos baseado no mood
  const getEyeState = () => {
    if (!isActive || mood === 'sleeping') return 'closed';
    if (mood === 'happy' || mood === 'excited' || mood === 'grateful') return 'happy';
    if (mood === 'thinking') return 'thinking';
    if (mood === 'sad' || mood === 'crying') return 'sad';
    return 'open';
  };

  const eyeState = getEyeState();

  return (
    <div className="relative w-full h-full">
      {/* Imagem base do avatar */}
      <img 
        src={nutriAvatar} 
        alt="NutriAI Avatar" 
        className="w-full h-full object-contain"
      />
      
      {/* Overlay de olhos */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Olho esquerdo */}
        <motion.div
          className="absolute"
          style={{ 
            top: '32%', 
            left: '32%',
            width: '12%',
            height: '8%'
          }}
        >
          <AnimatePresence mode="wait">
            {eyeState === 'closed' && (
              <motion.svg
                key="closed"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Olho fechado - arco */}
                <motion.path
                  d="M5 15 Q20 5 35 15"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'happy' && (
              <motion.svg
                key="happy"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Olho feliz - arco invertido */}
                <motion.path
                  d="M5 5 Q20 18 35 5"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'sad' && (
              <motion.svg
                key="sad"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Olho triste - arco caído */}
                <motion.path
                  d="M5 8 Q20 18 35 8"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'thinking' && (
              <motion.svg
                key="thinking"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [-2, 2, -2] }}
                exit={{ opacity: 0 }}
                transition={{ x: { repeat: Infinity, duration: 2 } }}
              >
                {/* Olho pensando - olhando para o lado */}
                <circle cx="25" cy="10" r="6" fill="hsl(var(--foreground))" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Olho direito */}
        <motion.div
          className="absolute"
          style={{ 
            top: '32%', 
            left: '56%',
            width: '12%',
            height: '8%'
          }}
        >
          <AnimatePresence mode="wait">
            {eyeState === 'closed' && (
              <motion.svg
                key="closed"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M5 15 Q20 5 35 15"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'happy' && (
              <motion.svg
                key="happy"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M5 5 Q20 18 35 5"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'sad' && (
              <motion.svg
                key="sad"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M5 8 Q20 18 35 8"
                  fill="none"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </motion.svg>
            )}
            {eyeState === 'thinking' && (
              <motion.svg
                key="thinking"
                viewBox="0 0 40 20"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, x: [-2, 2, -2] }}
                exit={{ opacity: 0 }}
                transition={{ x: { repeat: Infinity, duration: 2 } }}
              >
                <circle cx="25" cy="10" r="6" fill="hsl(var(--foreground))" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Piscar dos olhos quando acordado e não em estado especial */}
        {isActive && eyeState === 'open' && (
          <>
            <motion.div
              className="absolute"
              style={{ 
                top: '32%', 
                left: '32%',
                width: '12%',
                height: '8%'
              }}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ 
                repeat: Infinity, 
                repeatDelay: 3,
                duration: 0.2,
                times: [0, 0.5, 1]
              }}
            >
              <svg viewBox="0 0 40 20" className="w-full h-full">
                <circle cx="20" cy="10" r="6" fill="hsl(var(--foreground))" />
              </svg>
            </motion.div>
            <motion.div
              className="absolute"
              style={{ 
                top: '32%', 
                left: '56%',
                width: '12%',
                height: '8%'
              }}
              animate={{ scaleY: [1, 0.1, 1] }}
              transition={{ 
                repeat: Infinity, 
                repeatDelay: 3,
                duration: 0.2,
                times: [0, 0.5, 1]
              }}
            >
              <svg viewBox="0 0 40 20" className="w-full h-full">
                <circle cx="20" cy="10" r="6" fill="hsl(var(--foreground))" />
              </svg>
            </motion.div>
          </>
        )}
      </div>

      {/* Overlay de boca */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute"
          style={{ 
            top: '52%', 
            left: '40%',
            width: '20%',
            height: '12%'
          }}
        >
          <AnimatePresence mode="wait">
            {isSpeaking ? (
              <motion.svg
                key="speaking"
                viewBox="0 0 60 30"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Boca falando - elipse animada */}
                <motion.ellipse
                  cx="30"
                  cy="15"
                  rx="15"
                  fill="hsl(var(--destructive))"
                  stroke="hsl(var(--foreground))"
                  strokeWidth="2"
                  animate={{ 
                    ry: [5, 12, 8, 10, 5],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                />
                {/* Interior da boca */}
                <motion.ellipse
                  cx="30"
                  cy="18"
                  rx="8"
                  fill="hsl(var(--foreground))"
                  animate={{ 
                    ry: [2, 6, 4, 5, 2],
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 0.5,
                    ease: "easeInOut"
                  }}
                />
              </motion.svg>
            ) : (
              <motion.svg
                key="static"
                viewBox="0 0 60 30"
                className="w-full h-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Boca estática baseada no mood */}
                {(mood === 'happy' || mood === 'excited' || mood === 'grateful') && (
                  <motion.path
                    d="M10 10 Q30 28 50 10"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {(mood === 'sad' || mood === 'crying') && (
                  <motion.path
                    d="M10 20 Q30 5 50 20"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
                {(mood === 'neutral' || mood === 'thinking' || mood === 'serious' || mood === 'sleeping' || !isActive) && (
                  <motion.path
                    d="M15 15 L45 15"
                    fill="none"
                    stroke="hsl(var(--foreground))"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                )}
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ZZZ flutuante quando dormindo */}
      <AnimatePresence>
        {(!isActive || mood === 'sleeping') && (
          <motion.div
            className="absolute"
            style={{ top: '5%', right: '10%' }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <motion.span
              className="text-2xl font-bold text-primary"
              animate={{ 
                y: [-5, 5, -5],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2,
                ease: "easeInOut"
              }}
            >
              zZ
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lágrimas quando chorando */}
      <AnimatePresence>
        {mood === 'crying' && (
          <>
            <motion.div
              className="absolute"
              style={{ top: '42%', left: '35%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-2 h-4 bg-blue-400 rounded-full"
                animate={{ 
                  y: [0, 20],
                  opacity: [1, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  ease: "easeIn"
                }}
              />
            </motion.div>
            <motion.div
              className="absolute"
              style={{ top: '42%', left: '62%' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-2 h-4 bg-blue-400 rounded-full"
                animate={{ 
                  y: [0, 20],
                  opacity: [1, 0]
                }}
                transition={{ 
                  repeat: Infinity, 
                  duration: 1,
                  delay: 0.3,
                  ease: "easeIn"
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sparkles quando feliz/animado */}
      <AnimatePresence>
        {(mood === 'excited' || mood === 'grateful') && isActive && (
          <>
            <motion.div
              className="absolute text-yellow-400"
              style={{ top: '10%', left: '15%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
                rotate: [0, 180, 360]
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              ✨
            </motion.div>
            <motion.div
              className="absolute text-yellow-400"
              style={{ top: '15%', right: '15%' }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
                rotate: [0, -180, -360]
              }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
            >
              ✨
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NutritionistAvatar;
