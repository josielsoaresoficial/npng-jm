import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSnoringSound } from '@/hooks/useSnoringSound';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { RobotKawaii } from './robots/RobotKawaii';
import { RobotChef } from './robots/RobotChef';
import { RobotApple } from './robots/RobotApple';
import { RobotSalad } from './robots/RobotSalad';
import { RobotCapsule } from './robots/RobotCapsule';
import { RobotAvocado } from './robots/RobotAvocado';
import { RobotCarrot } from './robots/RobotCarrot';
import { RobotBroccoli } from './robots/RobotBroccoli';
import { RobotWatermelon } from './robots/RobotWatermelon';
import { RobotStrawberry } from './robots/RobotStrawberry';
import { RobotEgg } from './robots/RobotEgg';
import { RobotBanana } from './robots/RobotBanana';
import { RobotOrange } from './robots/RobotOrange';
import { RobotTomato } from './robots/RobotTomato';
import { RobotBlender } from './robots/RobotBlender';

interface RobotButtonProps {
  onClick: () => void;
  isActive: boolean;
  isListening?: boolean;
  isSpeaking?: boolean;
  isProcessing?: boolean;
  mood?: 'neutral' | 'happy' | 'thinking' | 'excited' | 'grateful';
}

const RobotButton = ({ onClick, isActive, isListening, isSpeaking, isProcessing, mood = 'neutral' }: RobotButtonProps) => {
  // Som de ronco quando inativo
  useSnoringSound(!isActive);

  // Get selected robot type from localStorage
  const [robotType, setRobotType] = useState(() => {
    return localStorage.getItem('nutriai-robot-type') || 'kawaii';
  });

  // Listen for storage changes and window focus
  useEffect(() => {
    const handleStorageChange = () => {
      setRobotType(localStorage.getItem('nutriai-robot-type') || 'kawaii');
    };
    
    const handleFocus = () => {
      setRobotType(localStorage.getItem('nutriai-robot-type') || 'kawaii');
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Select robot component based on type
  const getRobotComponent = () => {
    switch (robotType) {
      case 'chef':
        return RobotChef;
      case 'apple':
        return RobotApple;
      case 'salad':
        return RobotSalad;
      case 'capsule':
        return RobotCapsule;
      case 'avocado':
        return RobotAvocado;
      case 'carrot':
        return RobotCarrot;
      case 'broccoli':
        return RobotBroccoli;
      case 'watermelon':
        return RobotWatermelon;
      case 'strawberry':
        return RobotStrawberry;
      case 'egg':
        return RobotEgg;
      case 'banana':
        return RobotBanana;
      case 'orange':
        return RobotOrange;
      case 'tomato':
        return RobotTomato;
      case 'blender':
        return RobotBlender;
      default:
        return RobotKawaii;
    }
  };

  const RobotComponent = getRobotComponent();

  // Get status text
  const getStatusText = () => {
    if (!isActive) return 'Dormindo... (Clique para acordar)';
    if (isProcessing) return 'Pensando...';
    if (isSpeaking) return 'Falando...';
    if (isListening) return 'Ouvindo você...';
    return 'Pronto para ajudar!';
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
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

            {/* Dynamic Robot SVG Component */}
            <div className="w-full h-full drop-shadow-2xl">
              <RobotComponent isActive={isActive} mood={mood} />
            </div>
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="left" className="bg-background/95 backdrop-blur-sm">
        <p className="text-sm font-medium">{getStatusText()}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default RobotButton;
