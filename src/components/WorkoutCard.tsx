import React, { useState, useRef, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Clock, Flame, Play, Pencil, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/untyped";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import workoutArmsAbs from "@/assets/workout-arms-abs.jpg";
import workoutChestLegs from "@/assets/workout-chest-legs.jpg";
import workoutAbsDefined from "@/assets/workout-abs-defined.jpg";
import workoutLegsGlutes from "@/assets/workout-legs-glutes.jpg";
import workoutFreeweights from "@/assets/workout-freeweights.jpg";
import workoutBack from "@/assets/workout-back.jpg";
import workoutLegsFemale from "@/assets/workout-legs-female.jpg";
import workoutCardio from "@/assets/workout-cardio.jpg";

interface RippleProps {
  x: number;
  y: number;
  id: number;
}

interface WorkoutCardProps {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes: number;
  estimated_calories: number;
  difficulty: string;
  exercises_count: number;
}

export function WorkoutCard({
  id,
  name,
  description,
  category,
  duration_minutes,
  estimated_calories,
  difficulty,
  exercises_count,
}: WorkoutCardProps) {
  const navigate = useNavigate();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(name);
  const [isSaving, setIsSaving] = useState(false);
  const [ripples, setRipples] = useState<RippleProps[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }, []);

  const handleCardClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rippleId = Date.now();

    setRipples((prev) => [...prev, { x, y, id: rippleId }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 600);
  }, []);

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-500/20 text-green-300 border-green-500/30";
      case "intermediate":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
      case "advanced":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      default:
        return "bg-muted";
    }
  };

  const getCategoryName = (cat: string) => {
    const names: Record<string, string> = {
      "7_minute": "7 Minutos",
      full_body: "Full Body",
      abs: "Abdômen",
      hiit: "HIIT",
      strength: "Força",
      legs: "Pernas",
      back: "Costas",
      cardio: "Cardio",
    };
    return names[cat] || cat;
  };

  const getDifficultyLabel = (level: string) => {
    const labels: Record<string, string> = {
      beginner: "Iniciante",
      intermediate: "Intermediário",
      advanced: "Avançado",
    };
    return labels[level] || level;
  };

  const getCategoryImage = (cat: string, workoutName: string) => {
    const nameLower = workoutName.toLowerCase();
    
    // Primeiro, verificar por palavras-chave no nome do treino
    if (nameLower.includes('full body') || nameLower.includes('corpo todo') || nameLower.includes('total body')) {
      return workoutFreeweights;
    }
    if (nameLower.includes('força') || nameLower.includes('forca') || nameLower.includes('strength')) {
      return workoutChestLegs;
    }
    if (nameLower.includes('peitoral') || nameLower.includes('peito') || nameLower.includes('chest')) {
      return workoutChestLegs;
    }
    if (nameLower.includes('costas') || nameLower.includes('dorsal')) {
      return workoutBack;
    }
    if (nameLower.includes('abdômen') || nameLower.includes('abdomen') || nameLower.includes('core') || nameLower.includes('abs')) {
      return workoutAbsDefined;
    }
    if (nameLower.includes('glúteos') || nameLower.includes('gluteos') || nameLower.includes('bumbum')) {
      return workoutLegsGlutes;
    }
    if (nameLower.includes('bíceps') || nameLower.includes('biceps') || nameLower.includes('tríceps') || nameLower.includes('triceps') || nameLower.includes('braço') || nameLower.includes('braco')) {
      return workoutArmsAbs;
    }
    if (nameLower.includes('pernas') || nameLower.includes('quadríceps') || nameLower.includes('quadriceps') || nameLower.includes('panturrilha')) {
      return workoutLegsFemale;
    }
    if (nameLower.includes('ombro') || nameLower.includes('deltóide') || nameLower.includes('deltoide')) {
      return workoutFreeweights;
    }
    if (nameLower.includes('cardio') || nameLower.includes('hiit') || nameLower.includes('aeróbico') || nameLower.includes('aerobico')) {
      return workoutCardio;
    }
    
    // Fallback por categoria
    const images: Record<string, string> = {
      "7_minute": workoutCardio,
      "7min": workoutCardio,
      full_body: workoutFreeweights,
      abs: workoutAbsDefined,
      hiit: workoutCardio,
      strength: workoutChestLegs,
      legs: workoutLegsGlutes,
      back: workoutBack,
      cardio: workoutCardio,
      chest: workoutChestLegs,
      arms: workoutArmsAbs,
    };
    return images[cat] || workoutFreeweights;
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("O nome não pode estar vazio");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase
      .from("workouts")
      .update({ name: editedName })
      .eq("id", id);

    if (error) {
      toast.error("Erro ao atualizar nome do treino");
      setEditedName(name);
    } else {
      toast.success("Nome atualizado com sucesso!");
      setIsEditing(false);
    }
    setIsSaving(false);
  };

  const handleCancelEdit = () => {
    setEditedName(name);
    setIsEditing(false);
  };

  return (
    <div
      ref={cardRef}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "relative overflow-hidden rounded-2xl cursor-pointer",
        "bg-white/10 dark:bg-white/5 backdrop-blur-md",
        "border border-white/20 dark:border-white/10",
        "shadow-xl shadow-black/10 dark:shadow-black/30",
        "font-inter tracking-tight",
        "transition-all duration-300 ease-out",
        "hover:scale-[1.03] hover:bg-white/15 dark:hover:bg-white/10"
      )}
    >
      {/* Iridescent border gradient */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-60 z-10"
        style={{
          background: `linear-gradient(135deg, rgba(34,197,94,0.4) 0%, rgba(59,130,246,0.4) 50%, rgba(168,85,247,0.4) 100%)`,
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: '1.5px',
        }}
      />

      {/* Shimmer effect on cursor */}
      {isHovered && (
        <div
          className="pointer-events-none absolute h-40 w-40 rounded-full opacity-40 transition-opacity duration-300 z-20"
          style={{
            left: mousePos.x - 80,
            top: mousePos.y - 80,
            background: 'radial-gradient(circle, rgba(255,255,255,0.5), transparent 60%)',
            filter: 'blur(15px)',
          }}
        />
      )}

      {/* Ripple effects */}
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          className="pointer-events-none absolute animate-ripple rounded-full bg-white/30 z-20"
          style={{
            left: ripple.x - 60,
            top: ripple.y - 60,
            width: 120,
            height: 120,
          }}
        />
      ))}

      <div className="relative h-48 md:h-56">
        {/* Imagem de fundo */}
        <div className="absolute inset-0">
          <img 
            src={getCategoryImage(category, name)} 
            alt={name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        </div>

        {/* Conteúdo sobre a imagem */}
        <div className="relative h-full p-5 flex flex-col justify-between z-10">
          <div>
            <Badge 
              variant="outline" 
              className="mb-2 bg-white/10 backdrop-blur-md border-white/20 text-white"
            >
              {getCategoryName(category)}
            </Badge>
            
            {/* Nome do Treino - Editável */}
            <div className="flex items-center gap-2 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="h-8 bg-white/20 backdrop-blur-md text-white border-white/30 placeholder:text-white/50"
                    autoFocus
                    disabled={isSaving}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleSaveName}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 bg-green-500/80 hover:bg-green-500 text-white"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-500 text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="text-xl font-bold text-white drop-shadow-lg">{name}</h3>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="h-7 w-7 p-0 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-3 text-sm text-white/90">
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Clock className="w-3.5 h-3.5" />
                <span>{duration_minutes} min</span>
              </div>
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-0.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span>~{estimated_calories} kcal</span>
              </div>
              <Badge className={cn(getDifficultyColor(difficulty), "backdrop-blur-sm")} variant="outline">
                {getDifficultyLabel(difficulty)}
              </Badge>
            </div>
          </div>

          <Button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/workout-player/${id}`);
            }}
            className="w-full bg-white/20 backdrop-blur-md hover:bg-white/30 border border-white/30 text-white font-semibold"
            size="lg"
          >
            <Play className="w-5 h-5 mr-2" />
            Iniciar Treino
          </Button>
        </div>
      </div>
    </div>
  );
}
