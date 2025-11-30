import { motion } from "framer-motion";

interface RobotButtonProps {
  onClick: () => void;
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
}

const RobotButton = ({ onClick, isActive, isListening, isSpeaking, isProcessing }: RobotButtonProps) => {
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
              className="absolute -top-4 right-2 w-2 h-2 bg-white rounded-full border border-gray-200"
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
              className="absolute -top-7 right-4 w-3 h-3 bg-white rounded-full border border-gray-200"
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
              className="absolute -top-12 right-6 bg-white rounded-2xl px-3 py-2 shadow-lg border border-gray-200"
            >
              <span className="text-gray-600 font-bold text-base">zZ</span>
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
              <stop offset="0%" stopColor="#d4e8f0" />
              <stop offset="100%" stopColor="#a8c9da" />
            </linearGradient>
            
            <linearGradient id="visorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2d3e50" />
              <stop offset="100%" stopColor="#1a2634" />
            </linearGradient>

            <radialGradient id="ledGlow">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
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
            fill="#2d3e50"
            stroke="#1a2634"
            strokeWidth="1.5"
          />

          {/* Anel de luz na base */}
          <motion.ellipse
            cx="50"
            cy="100"
            rx="20"
            ry="5"
            fill="#00d4ff"
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
              stroke="#7a9fb3"
              strokeWidth="1.5"
            />

            {/* Linha decorativa no topo */}
            <motion.path
              d="M 30 32 Q 50 28 70 32"
              stroke="#5a7f93"
              strokeWidth="1.5"
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
              stroke="#1a2634"
              strokeWidth="0.5"
            />

            {/* Olhos - Arcos sorridentes estilo kawaii */}
            {!isActive && (
              <>
                {/* Olho esquerdo fechado */}
                <motion.path
                  d="M 36 48 Q 39 51 42 48"
                  stroke="#6dd5ed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
                {/* Olho direito fechado */}
                <motion.path
                  d="M 58 48 Q 61 51 64 48"
                  stroke="#6dd5ed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </>
            )}

            {isActive && (
              <>
                {/* Olho esquerdo aberto */}
                <motion.path
                  d="M 36 50 Q 39 47 42 50"
                  stroke="#6dd5ed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: isSpeaking 
                      ? ["M 36 50 Q 39 47 42 50", "M 36 50 Q 39 46 42 50", "M 36 50 Q 39 47 42 50"]
                      : "M 36 50 Q 39 47 42 50"
                  }}
                  transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                />
                
                {/* Olho direito aberto */}
                <motion.path
                  d="M 58 50 Q 61 47 64 50"
                  stroke="#6dd5ed"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  fill="none"
                  animate={{
                    d: isSpeaking 
                      ? ["M 58 50 Q 61 47 64 50", "M 58 50 Q 61 46 64 50", "M 58 50 Q 61 47 64 50"]
                      : "M 58 50 Q 61 47 64 50"
                  }}
                  transition={{ duration: 0.5, repeat: isSpeaking ? Infinity : 0 }}
                />
              </>
            )}

            {/* Boca animada (fala quando isSpeaking) */}
            <motion.path
              stroke="#5a7f93"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              animate={{
                d: isSpeaking 
                  ? [
                      "M 40 58 Q 50 68 60 58",  // Boca aberta
                      "M 40 60 Q 50 62 60 60",  // Boca fechada
                      "M 40 59 Q 50 65 60 59",  // Boca média
                      "M 40 60 Q 50 62 60 60",  // Boca fechada
                    ]
                  : isActive 
                    ? "M 40 60 Q 50 65 60 60"   // Sorriso acordado
                    : "M 40 60 Q 50 63 60 60"   // Sorriso dormindo
              }}
              transition={{ 
                duration: isSpeaking ? 0.4 : 0.5,
                repeat: isSpeaking ? Infinity : 0,
                ease: "easeInOut"
              }}
            />

            {/* Antena Esquerda */}
            <g>
              {/* Base cilíndrica */}
              <ellipse cx="24" cy="25" rx="3" ry="2" fill="#2d3e50" />
              <rect x="21" y="25" width="6" height="3" fill="#2d3e50" />
              <ellipse cx="24" cy="28" rx="3" ry="2" fill="#1a2634" />
              
              {/* Haste vertical */}
              <line x1="24" y1="28" x2="18" y2="15" stroke="#2d3e50" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* LED cyan na ponta */}
              <motion.circle
                cx="18"
                cy="15"
                r="3.5"
                fill="#00d4ff"
                animate={{
                  opacity: isActive ? [1, 0.5, 1] : [0.7, 0.4, 0.7],
                }}
                transition={{
                  duration: 1,
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
                  duration: 1,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </g>

            {/* Antena Direita */}
            <g>
              {/* Base cilíndrica */}
              <ellipse cx="76" cy="25" rx="3" ry="2" fill="#2d3e50" />
              <rect x="73" y="25" width="6" height="3" fill="#2d3e50" />
              <ellipse cx="76" cy="28" rx="3" ry="2" fill="#1a2634" />
              
              {/* Haste vertical */}
              <line x1="76" y1="28" x2="82" y2="15" stroke="#2d3e50" strokeWidth="2.5" strokeLinecap="round" />
              
              {/* LED cyan na ponta */}
              <motion.circle
                cx="82"
                cy="15"
                r="3.5"
                fill="#00d4ff"
                animate={{
                  opacity: isActive ? [0.5, 1, 0.5] : [0.4, 0.7, 0.4],
                }}
                transition={{
                  duration: 1,
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
                  duration: 1,
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
