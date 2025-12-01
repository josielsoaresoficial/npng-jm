import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Target } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { useDiet21 } from "@/hooks/useDiet21";

export const Diet21WelcomeBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { isEnrolled } = useDiet21();

  useEffect(() => {
    // Só mostrar se não estiver inscrito e não tiver visto o banner antes
    const hasSeenBanner = localStorage.getItem("diet21_banner_seen");
    if (!isEnrolled && !hasSeenBanner) {
      setIsVisible(true);
    }
  }, [isEnrolled]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem("diet21_banner_seen", "true");
  };

  const handleStart = () => {
    setIsVisible(false);
    localStorage.setItem("diet21_banner_seen", "true");
    navigate("/diet-21-days");
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4"
      >
        <div className="relative bg-gradient-to-r from-primary/90 to-primary-foreground/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-primary/20 p-6 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Content */}
          <div className="relative z-10 space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold text-white">
                  Olá, meu querido usuário(a)! 🎉
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  Como seu objetivo é <span className="font-semibold">perda de peso</span>, 
                  estou te inscrevendo no nosso plano <span className="font-bold">"Dieta de 21 Dias"</span>!
                </p>
                <p className="text-white/90 text-sm leading-relaxed">
                  Com meu conhecimento e seu <span className="font-semibold">foco e atitude</span>, 
                  você poderá perder <span className="font-bold">5-15kg em 21 dias</span> de forma saudável!
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleStart}
                className="bg-white text-primary hover:bg-white/90 font-semibold flex items-center gap-2"
              >
                <Target className="w-4 h-4" />
                Iniciar Dieta
              </Button>
              <Button
                onClick={handleStart}
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white"
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
