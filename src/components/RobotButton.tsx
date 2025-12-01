import { motion } from "framer-motion";
import { useSnoringSound } from "@/hooks/useSnoringSound";

interface RobotButtonProps {
  onClick: () => void;
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

const RobotButton = ({ onClick, isActive, isListening, isSpeaking, isProcessing, mood = 'neutral' }: RobotButtonProps) => {
  // Hook para som de ronco quando dormindo
  useSnoringSound(isActive);
  
  // Raios dos olhos kawaii baseado no mood
  const getEyeSize = () => {
    if (!isActive) return 3; // Dormindo - pequenos
    
    switch (mood) {
      case 'happy':
      case 'excited':
        return 4.5; // Olhos grandes e brilhantes
      case 'thinking':
        return 3.5; // Semicerrados
      case 'grateful':
        return 3.8; // Suaves
      default:
        return 4; // Normal
    }
  };

  // Definir se olhos estão fechados (dormindo)
  const areEyesClosed = !isActive;

  // Definir forma da boca fofa baseado no mood
  const getMouthShape = () => {
    if (!isActive) {
      return "M 42 68 Q 50 70 58 68"; // Dormindo - boca relaxada
    }
    
    if (isSpeaking) {
      // Quando falando, usar animação kawaii
      return [
        "M 40 66 Q 50 76 60 66", // Aberta
        "M 42 68 Q 50 70 58 68", // Fechada
        "M 40 67 Q 50 74 60 67", // Meio aberta
        "M 42 68 Q 50 70 58 68", // Fechada
        "M 41 66 Q 50 75 59 66", // Aberta
        "M 42 68 Q 50 71 58 68", // Semi-fechada
      ];
    }
    
    switch (mood) {
      case 'happy':
        return "M 38 66 Q 50 76 62 66"; // Sorriso grande
      case 'thinking':
        return "M 42 69 Q 50 70 58 69"; // Linha pensativa
      case 'excited':
        return "M 36 65 Q 50 78 64 65"; // Sorriso enorme
      case 'grateful':
        return "M 40 67 Q 50 74 60 67"; // Sorriso suave
      default:
        return "M 40 67 Q 50 73 60 67"; // Sorriso padrão kawaii
    }
  };

  // Velocidade de pulsação das antenas (folhas) baseada no mood
  const getAntennaPulseSpeed = () => {
    switch (mood) {
      case 'excited':
        return 0.6; // Rápido
      case 'thinking':
        return 1.5; // Devagar
      case 'happy':
      case 'grateful':
        return 0.8; // Médio-rápido
      default:
        return 1.0; // Normal
    }
  };
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-50 focus:outline-none group"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3 }}
      aria-label={isActive ? "NutriAI Ativo" : "Ativar NutriAI"}
    >
      {/* Container do Robô */}
      <div className="relative w-24 h-32 md:w-28 md:h-36">
        {/* Balão ZZZ com círculos de pensamento (quando dormindo) */}
        {!isActive && (
          <>
            {/* Círculo pequeno */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0.8, 0],
                scale: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.2, 0.8, 1]
              }}
              className="absolute -top-3 left-1/2 translate-x-1 w-1.5 h-1.5 bg-white rounded-full border border-gray-200"
            />
            
            {/* Círculo médio */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: [0, 0.8, 0.8, 0],
                scale: [0, 1, 1, 0]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.3,
                times: [0, 0.2, 0.8, 1]
              }}
              className="absolute -top-5 left-1/2 translate-x-0.5 w-2 h-2 bg-white rounded-full border border-gray-200"
            />

            {/* Balão principal com zZ */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: [0, 1, 1, 0],
                y: [-5, -12, -12, -5]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.6,
                times: [0, 0.2, 0.8, 1]
              }}
              className="absolute -top-10 left-1/2 -translate-x-1/2 bg-white rounded-xl px-2 py-1 shadow-lg border border-gray-200"
            >
              <span className="text-gray-600 font-bold text-xs">zZ</span>
            </motion.div>
          </>
        )}

        {/* Ondas sonoras quando falando */}
        {isSpeaking && (
          <motion.div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-full h-full border-2 border-cyan-400 rounded-full"
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ 
                  scale: [0.8, 1.5, 1.8],
                  opacity: [0.8, 0.3, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        )}

        {/* Indicador visual de ouvindo */}
        {isListening && (
          <motion.div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <motion.div
              className="flex gap-1"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-cyan-400 rounded-full"
                  animate={{
                    height: [8, 16, 8],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                    ease: "easeInOut"
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* SVG do Robô */}
        <svg
          viewBox="0 0 100 130"
          className="w-full h-full drop-shadow-2xl"
        >
          <defs>
            {/* Gradiente verde menta para o corpo */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a8e6cf" />
              <stop offset="100%" stopColor="#88d8b0" />
            </linearGradient>
            
            {/* Gradiente para bochechas rosadas */}
            <radialGradient id="cheekGradient">
              <stop offset="0%" stopColor="#ffb3ba" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffb3ba" stopOpacity="0.2" />
            </radialGradient>

            {/* Gradiente para avental branco */}
            <linearGradient id="apronGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#f0f0f0" />
            </linearGradient>

            {/* Brilho dos olhos */}
            <radialGradient id="eyeShine">
              <stop offset="0%" stopColor="white" stopOpacity="1" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base arredondada verde */}
          <ellipse
            cx="50"
            cy="105"
            rx="24"
            ry="12"
            fill="#27ae60"
            stroke="#1e8449"
            strokeWidth="1.5"
          />
          
          {/* Avental branco de nutricionista */}
          <path
            d="M 32 78 Q 50 85 68 78 L 68 100 Q 50 103 32 100 Z"
            fill="url(#apronGradient)"
            stroke="#e0e0e0"
            strokeWidth="1"
          />
          
          {/* Ícone de folha verde no avental */}
          <path
            d="M 50 88 Q 52 86 54 88 Q 54 91 50 94 Q 46 91 46 88 Q 48 86 50 88 Z"
            fill="#56ab2f"
            stroke="#3d8b1f"
            strokeWidth="0.5"
          />
          <path
            d="M 50 88 Q 50 90 50 92"
            stroke="#3d8b1f"
            strokeWidth="0.8"
            strokeLinecap="round"
          />

          {/* Cabeça fofa */}
          <motion.g
            animate={{
              y: isActive ? 0 : 3,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Corpo principal da cabeça (verde menta arredondado) */}
            <circle
              cx="50"
              cy="50"
              r="26"
              fill="url(#bodyGradient)"
              stroke="#7bc8a4"
              strokeWidth="1.8"
            />

            {/* Olhos kawaii grandes */}
            {areEyesClosed ? (
              // Olhos fechados (dormindo) - arcos
              <>
                <motion.path
                  d="M 36 48 Q 40 51 44 48"
                  stroke="#2d3436"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
                <motion.path
                  d="M 56 48 Q 60 51 64 48"
                  stroke="#2d3436"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                />
              </>
            ) : (
              // Olhos abertos - círculos grandes kawaii
              <>
                {/* Olho esquerdo */}
                <motion.circle
                  cx="40"
                  cy="48"
                  r={getEyeSize()}
                  fill="#2d3436"
                  animate={isSpeaking ? {
                    scaleY: [1, 0.3, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isSpeaking ? Infinity : 0,
                    ease: "easeInOut"
                  }}
                />
                {/* Brilho olho esquerdo - grande */}
                <circle cx="41.5" cy="46.5" r="1.8" fill="white" opacity="0.95" />
                {/* Brilho secundário */}
                <circle cx="38.5" cy="49" r="0.8" fill="white" opacity="0.7" />
                
                {/* Olho direito */}
                <motion.circle
                  cx="60"
                  cy="48"
                  r={getEyeSize()}
                  fill="#2d3436"
                  animate={isSpeaking ? {
                    scaleY: [1, 0.3, 1],
                  } : {}}
                  transition={{
                    duration: 0.5,
                    repeat: isSpeaking ? Infinity : 0,
                    ease: "easeInOut",
                    delay: 0.1
                  }}
                />
                {/* Brilho olho direito - grande */}
                <circle cx="61.5" cy="46.5" r="1.8" fill="white" opacity="0.95" />
                {/* Brilho secundário */}
                <circle cx="58.5" cy="49" r="0.8" fill="white" opacity="0.7" />
              </>
            )}

            {/* Bochechas rosadas fofas */}
            <circle cx="32" cy="56" r="5" fill="url(#cheekGradient)" opacity="0.8" />
            <circle cx="68" cy="56" r="5" fill="url(#cheekGradient)" opacity="0.8" />

            {/* Boca fofa kawaii */}
            <motion.path
              stroke="#ff6b6b"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isSpeaking && Array.isArray(getMouthShape())
                  ? getMouthShape()
                  : getMouthShape()
              }}
              transition={{ 
                duration: isSpeaking ? 0.5 : 0.4,
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            {/* Interior da boca (aparece quando muito aberta ao falar) */}
            {isSpeaking && (
              <motion.ellipse
                cx="50"
                cy="72"
                rx="7"
                ry="5"
                fill="rgba(255, 107, 107, 0.3)"
                animate={{
                  opacity: [0.3, 0, 0.25, 0, 0.3, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Antena Esquerda com folha */}
            <g>
              {/* Haste verde orgânica */}
              <motion.line 
                x1="32" 
                y1="30" 
                x2="22" 
                y2="16" 
                stroke="#56ab2f" 
                strokeWidth="2.2" 
                strokeLinecap="round"
                animate={isActive ? {
                  y1: [30, 28, 30],
                } : {}}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              
              {/* Folha verde na ponta */}
              <motion.path
                d="M 22 16 Q 18 14 16 16 Q 18 18 22 16 Z"
                fill="#56ab2f"
                stroke="#3d8b1f"
                strokeWidth="0.8"
                animate={{
                  rotate: isActive ? [0, 10, -10, 0] : [0, 5, -5, 0],
                  scale: isActive ? [1, 1.1, 1] : [1, 1.05, 1],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ originX: "22px", originY: "16px" }}
              />
              
              {/* Nervura da folha */}
              <motion.line
                x1="22"
                y1="16"
                x2="18"
                y2="16"
                stroke="#3d8b1f"
                strokeWidth="0.6"
                opacity="0.7"
                animate={{
                  rotate: isActive ? [0, 10, -10, 0] : [0, 5, -5, 0],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ originX: "22px", originY: "16px" }}
              />
            </g>

            {/* Antena Direita com maçã */}
            <g>
              {/* Haste verde orgânica */}
              <motion.line 
                x1="68" 
                y1="30" 
                x2="78" 
                y2="16" 
                stroke="#56ab2f" 
                strokeWidth="2.2" 
                strokeLinecap="round"
                animate={isActive ? {
                  y1: [30, 28, 30],
                } : {}}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              
              {/* Maçãzinha vermelha fofa */}
              <motion.circle
                cx="78"
                cy="16"
                r="3.5"
                fill="#ff6b6b"
                stroke="#d63447"
                strokeWidth="0.8"
                animate={{
                  scale: isActive ? [1, 1.15, 1] : [1, 1.08, 1],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ originX: "78px", originY: "16px" }}
              />
              
              {/* Folhinha no topo da maçã */}
              <motion.path
                d="M 78 12.5 Q 77 11 76 12"
                stroke="#56ab2f"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
                animate={{
                  scale: isActive ? [1, 1.15, 1] : [1, 1.08, 1],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ originX: "78px", originY: "16px" }}
              />
              
              {/* Brilho na maçã */}
              <motion.circle
                cx="79"
                cy="14.5"
                r="1"
                fill="white"
                opacity="0.7"
                animate={{
                  scale: isActive ? [1, 1.15, 1] : [1, 1.08, 1],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
                style={{ originX: "78px", originY: "16px" }}
              />
            </g>
          </motion.g>
        </svg>

        {/* Tooltip com status */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
            {isSpeaking ? "Falando..." : isListening ? "Ouvindo..." : isProcessing ? "Processando..." : isActive ? "NutriAI Ativo" : "Ativar NutriAI"}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

export default RobotButton;
