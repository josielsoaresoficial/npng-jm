import { useState } from 'react';
import { motion } from 'framer-motion';
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
import { Button } from './ui/button';
import { Check } from 'lucide-react';

interface RobotSelectorProps {
  onSelect: (robotType: string) => void;
  currentSelection?: string;
}

const robots = [
  {
    id: 'kawaii',
    name: 'Kawaii Verde',
    description: 'Fofo e acolhedor com antenas de folha',
    component: RobotKawaii,
  },
  {
    id: 'chef',
    name: 'Chef Clássico',
    description: 'Profissional com chapéu de chef',
    component: RobotChef,
  },
  {
    id: 'apple',
    name: 'Maçã Saudável',
    description: 'Em formato de maçã vermelha',
    component: RobotApple,
  },
  {
    id: 'salad',
    name: 'Tigela de Salada',
    description: 'Colorido como uma salada fresca',
    component: RobotSalad,
  },
  {
    id: 'capsule',
    name: 'Cápsula Científica',
    description: 'Moderno e tecnológico',
    component: RobotCapsule,
  },
  {
    id: 'avocado',
    name: 'Abacate Fofo',
    description: 'Verde cremoso com caroço',
    component: RobotAvocado,
  },
  {
    id: 'carrot',
    name: 'Cenoura Alegre',
    description: 'Laranja vibrante com folhas',
    component: RobotCarrot,
  },
  {
    id: 'broccoli',
    name: 'Brócolis Saudável',
    description: 'Verde escuro e nutritivo',
    component: RobotBroccoli,
  },
  {
    id: 'watermelon',
    name: 'Melancia Refrescante',
    description: 'Fatia vermelha com sementes',
    component: RobotWatermelon,
  },
  {
    id: 'strawberry',
    name: 'Morango Doce',
    description: 'Rosa delicado com sementes',
    component: RobotStrawberry,
  },
  {
    id: 'egg',
    name: 'Ovo Proteico',
    description: 'Fofo com gema dourada',
    component: RobotEgg,
  },
  {
    id: 'banana',
    name: 'Banana Energética',
    description: 'Amarela curvada com casca',
    component: RobotBanana,
  },
  {
    id: 'orange',
    name: 'Laranja Vitamina C',
    description: 'Cítrica com gomos visíveis',
    component: RobotOrange,
  },
  {
    id: 'tomato',
    name: 'Tomate Antioxidante',
    description: 'Vermelho com folhas verdes',
    component: RobotTomato,
  },
  {
    id: 'blender',
    name: 'Blender Smoothie',
    description: 'Liquidificador com frutas',
    component: RobotBlender,
  },
];

export const RobotSelector = ({ onSelect, currentSelection = 'kawaii' }: RobotSelectorProps) => {
  const [selected, setSelected] = useState(currentSelection);
  const [hoveredRobot, setHoveredRobot] = useState<string | null>(null);

  const handleSelect = (robotId: string) => {
    setSelected(robotId);
  };

  const handleConfirm = () => {
    onSelect(selected);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-foreground">🤖 Escolha seu NutriAI Assistant 🥗</h2>
        <p className="text-muted-foreground">
          Passe o mouse para ver a animação • Clique para selecionar
        </p>
      </div>

      {/* Robot Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {robots.map((robot) => {
          const RobotComponent = robot.component;
          const isSelected = selected === robot.id;
          const isHovered = hoveredRobot === robot.id;

          return (
            <motion.div
              key={robot.id}
              className={`relative cursor-pointer rounded-xl p-4 transition-all duration-300 ${
                isSelected
                  ? 'bg-primary/10 ring-4 ring-primary shadow-lg'
                  : 'bg-muted hover:bg-muted/70 hover:shadow-md'
              }`}
              onClick={() => handleSelect(robot.id)}
              onMouseEnter={() => setHoveredRobot(robot.id)}
              onMouseLeave={() => setHoveredRobot(null)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Selection Checkmark */}
              {isSelected && (
                <motion.div
                  className="absolute -top-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg z-10"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                >
                  <Check className="w-5 h-5 text-primary-foreground" />
                </motion.div>
              )}

              {/* Robot Preview */}
              <div className="w-full aspect-square mb-3">
                <RobotComponent isActive={isHovered || isSelected} mood="happy" />
              </div>

              {/* Robot Info */}
              <div className="text-center space-y-1">
                <h3 className="font-semibold text-sm text-foreground">{robot.name}</h3>
                <p className="text-xs text-muted-foreground">{robot.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Confirm Button */}
      <div className="flex justify-center pt-4">
        <Button
          size="lg"
          onClick={handleConfirm}
          className="min-w-[200px] font-semibold"
        >
          ✓ Confirmar Seleção
        </Button>
      </div>
    </div>
  );
};
