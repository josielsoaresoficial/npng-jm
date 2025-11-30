import { motion } from "framer-motion";

interface RobotButtonProps {
  onClick: () => void;
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

const RobotButton = ({ onClick, isActive, isListening, isSpeaking, isProcessing, mood = 'neutral' }: RobotButtonProps) => {
  // Definir forma dos olhos baseado no mood
  const getEyeShape = (isLeft: boolean) => {
    const base = isLeft ? 36 : 58;
    const mid = isLeft ? 39 : 61;
    const end = isLeft ? 42 : 64;
    
    if (!isActive) {
      // Dormindo - arco pra baixo (fechado)
      return `M ${base} 48 Q ${mid} 51 ${end} 48`;
    }
    
    switch (mood) {
      case 'happy':
        // Feliz - arco bem aberto e alto
        return `M ${base} 50 Q ${mid} 45 ${end} 50`;
      case 'thinking':
        // Pensativo - semicerrado
        return `M ${base} 49 Q ${mid} 47 ${end} 49`;
      case 'excited':
        // Animado - bem aberto e redondo
        return `M ${base} 51 Q ${mid} 44 ${end} 51`;
      case 'grateful':
        // Agradecido - suave e levemente fechado
        return `M ${base} 49 Q ${mid} 46 ${end} 49`;
      default:
        // Neutro - arco padrão
        return `M ${base} 50 Q ${mid} 47 ${end} 50`;
    }
  };

  // Definir forma da boca baseado no mood
  const getMouthShape = () => {
    if (!isActive) {
      return "M 40 60 Q 50 63 60 60"; // Dormindo
    }
    
    if (isSpeaking) {
      // Quando falando, usar animação existente
      return [
        "M 38 55 Q 50 75 62 55",
        "M 40 60 Q 50 62 60 60",
        "M 39 57 Q 50 70 61 57",
        "M 40 60 Q 50 62 60 60",
        "M 38 56 Q 50 72 62 56",
        "M 40 60 Q 50 64 60 60",
      ];
    }
    
    switch (mood) {
      case 'happy':
        // Feliz - sorriso grande
        return "M 38 60 Q 50 68 62 60";
      case 'thinking':
        // Pensativo - linha quase reta
        return "M 40 61 Q 50 62 60 61";
      case 'excited':
        // Animado - sorriso enorme
        return "M 36 59 Q 50 70 64 59";
      case 'grateful':
        // Agradecido - sorriso suave
        return "M 40 60 Q 50 66 60 60";
      default:
        // Neutro - sorriso padrão
        return "M 40 60 Q 50 65 60 60";
    }
  };

  // Velocidade de pulsação das antenas baseada no mood
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
            {/* Gradientes */}
            <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#b8d4e3" />
              <stop offset="100%" stopColor="#d4e5ed" />
            </linearGradient>
            
            <linearGradient id="visorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1a2634" />
              <stop offset="100%" stopColor="#0f1419" />
            </linearGradient>

            <radialGradient id="ledGlow">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="reflectionGradient">
              <stop offset="0%" stopColor="white" stopOpacity="0.9" />
              <stop offset="50%" stopColor="white" stopOpacity="0.4" />
              <stop offset="100%" stopColor="white" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Base/Pescoço (cone escuro) */}
          <motion.path
            d="M 35 80 L 30 100 L 70 100 L 65 80 Z"
            fill="#1a2634"
            stroke="#0f1419"
            strokeWidth="1.5"
          />

          {/* Anel de luz na base */}
          <motion.ellipse
            cx="50"
            cy="100"
            rx="20"
            ry="5"
            fill="#00e5ff"
            opacity={isActive ? 0.9 : 0.5}
            animate={{
              opacity: isActive ? [0.9, 1, 0.9] : [0.5, 0.7, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          {/* Brilho do anel */}
          <motion.ellipse
            cx="50"
            cy="100"
            rx="28"
            ry="8"
            fill="url(#ledGlow)"
            opacity={isActive ? 0.6 : 0.3}
            animate={{
              opacity: isActive ? [0.6, 0.8, 0.6] : [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Cabeça */}
          <motion.g
            animate={{
              y: isActive ? 0 : 3,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            {/* Corpo principal da cabeça */}
            <circle
              cx="50"
              cy="45"
              r="28"
              fill="url(#bodyGradient)"
              stroke="#8ba9ba"
              strokeWidth="1.5"
            />

            {/* Linha decorativa no topo */}
            <motion.path
              d="M 30 32 Q 50 28 70 32"
              stroke="#6a8a9d"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Reflexo oval no topo */}
            <ellipse
              cx="50"
              cy="28"
              rx="15"
              ry="10"
              fill="url(#reflectionGradient)"
              opacity="0.8"
            />

            {/* Visor escuro retangular arredondado */}
            <rect
              x="28"
              y="40"
              width="44"
              height="18"
              rx="9"
              fill="url(#visorGradient)"
              stroke="#0f1419"
              strokeWidth="1"
            />

            {/* Olhos - Expressões contextuais */}
            <motion.path
              stroke="#5dcde3"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isSpeaking 
                  ? [getEyeShape(true), `M 36 50 Q 39 46 42 50`, getEyeShape(true)]
                  : getEyeShape(true)
              }}
              transition={{ 
                duration: isSpeaking ? 0.5 : 0.4, 
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut"
              }}
            />
            
            <motion.path
              stroke="#5dcde3"
              strokeWidth="2.8"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isSpeaking 
                  ? [getEyeShape(false), `M 58 50 Q 61 46 64 50`, getEyeShape(false)]
                  : getEyeShape(false)
              }}
              transition={{ 
                duration: isSpeaking ? 0.5 : 0.4, 
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut",
                delay: isSpeaking ? 0.1 : 0
              }}
            />

            {/* Boca animada (expressões contextuais) */}
            <motion.path
              stroke="#6a8a9d"
              strokeWidth="2.2"
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
            
            {/* Interior da boca (aparece quando muito aberta) */}
            {isSpeaking && (
              <motion.ellipse
                cx="50"
                cy="66"
                rx="8"
                ry="6"
                fill="rgba(106, 138, 157, 0.35)"
                animate={{
                  opacity: [0.35, 0, 0.25, 0, 0.3, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            )}

            {/* Antena Esquerda */}
            <g>
              {/* Base cilíndrica */}
              <ellipse cx="24" cy="25" rx="3" ry="2" fill="#1a2634" />
              <rect x="21" y="25" width="6" height="3" fill="#1a2634" />
              <ellipse cx="24" cy="28" rx="3" ry="2" fill="#0f1419" />
              
              {/* Haste vertical */}
              <line x1="24" y1="28" x2="18" y2="15" stroke="#1a2634" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* LED cyan na ponta */}
              <motion.circle
                cx="18"
                cy="15"
                r="3.5"
                fill="#00e5ff"
                animate={{
                  opacity: isActive ? [1, 0.5, 1] : [0.7, 0.4, 0.7],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              {/* Glow do LED */}
              <motion.circle
                cx="18"
                cy="15"
                r="6"
                fill="url(#ledGlow)"
                opacity={isActive ? 0.7 : 0.4}
                animate={{
                  opacity: isActive ? [0.7, 0.3, 0.7] : [0.4, 0.2, 0.4],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </g>

            {/* Antena Direita */}
            <g>
              {/* Base cilíndrica */}
              <ellipse cx="76" cy="25" rx="3" ry="2" fill="#1a2634" />
              <rect x="73" y="25" width="6" height="3" fill="#1a2634" />
              <ellipse cx="76" cy="28" rx="3" ry="2" fill="#0f1419" />
              
              {/* Haste vertical */}
              <line x1="76" y1="28" x2="82" y2="15" stroke="#1a2634" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* LED cyan na ponta */}
              <motion.circle
                cx="82"
                cy="15"
                r="3.5"
                fill="#00e5ff"
                animate={{
                  opacity: isActive ? [0.5, 1, 0.5] : [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
              />
              {/* Glow do LED */}
              <motion.circle
                cx="82"
                cy="15"
                r="6"
                fill="url(#ledGlow)"
                opacity={isActive ? 0.7 : 0.4}
                animate={{
                  opacity: isActive ? [0.3, 0.7, 0.3] : [0.2, 0.4, 0.2],
                }}
                transition={{
                  duration: getAntennaPulseSpeed(),
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5
                }}
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
