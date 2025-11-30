import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GymCard } from "@/components/GymCard";
import { StatCard } from "@/components/StatCard";
import { Dumbbell, Apple, TrendingUp, Zap, Camera, Users, ChefHat, Clock as ClockIcon, Play } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import heroVideo from "@/assets/hero-video.mp4";
import heroVideo2 from "@/assets/hero-video-2.mp4";
import heroFitnessImage from "@/assets/hero-fitness.jpg";
import nutritionImage from "@/assets/nutrition-hero.jpg";
import workoutsImage from "@/assets/workouts-hero.jpg";
import { AuthDialog } from "@/components/AuthDialog";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useTrialStatus } from "@/hooks/useTrialStatus";
import { Clock } from "@/components/Clock";
import { useIsMobile } from "@/hooks/use-mobile";


const Index = () => {
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(0);
  const { user } = useAuth();
  const { onboardingCompleted, loading } = useOnboardingStatus();
  const { startTrial, isTrialActive } = useTrialStatus();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const videos = [heroVideo, heroVideo2];

  const handleProtectedAction = async (path: string) => {
    if (user) {
      if (!isTrialActive) {
        await startTrial();
      }

      if (!loading && !onboardingCompleted && path === "/dashboard") {
        navigate("/onboarding");
      } else {
        navigate(path);
      }
    } else {
      setAuthDialogOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Netflix Style */}
      <section className="relative h-screen overflow-hidden">
        <video 
          key={currentVideo}
          autoPlay 
          muted 
          loop
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster={heroFitnessImage}
          className="absolute inset-0 w-full h-full object-cover"
          onLoadedData={(e) => {
            const video = e.currentTarget;
            video.play().catch(() => {});
          }}
          onEnded={() => {
            setCurrentVideo((prev) => (prev + 1) % videos.length);
          }}
        >
          <source src={videos[currentVideo]} type="video/mp4" />
        </video>
        
        {/* Gradiente Netflix */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
        
        <div className="relative z-10 h-full flex items-center px-4 md:px-16">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 text-white netflix-fade-in">
              nPnG JM
            </h1>
            <p className="text-xl md:text-2xl mb-4 text-white/90 font-medium netflix-fade-in" style={{ animationDelay: '0.2s' }}>
              Seu personal trainer e nutricionista com IA
            </p>
            <p className="text-lg mb-8 text-white/70 max-w-xl netflix-fade-in" style={{ animationDelay: '0.4s' }}>
              Combine treinos inteligentes com análise nutricional por IA. Alcance seus objetivos fitness com precisão científica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 netflix-fade-in" style={{ animationDelay: '0.6s' }}>
              <Button 
                variant="netflix" 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => handleProtectedAction("/dashboard")}
              >
                <Play className="w-5 h-5 fill-white" />
                Iniciar Jornada Gratuita
              </Button>
              <Button 
                variant="netflix-outline" 
                size="lg" 
                className="text-lg h-14 px-8"
                onClick={() => handleProtectedAction("/dashboard")}
              >
                Saiba Mais
              </Button>
            </div>
            <p className="text-sm text-white/50 mt-6 flex items-center gap-2">
              <ClockIcon className="w-4 h-4" />
              Teste grátis por 24 horas
            </p>
          </div>
        </div>
      </section>

      {/* Treinos Section - Netflix Carousel Style */}
      <section className="py-16 px-4 md:px-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white">
            Treinos Populares
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            <GymCard 
              variant="fitness"
              title="Treinos Inteligentes"
              description="Rotinas personalizadas baseadas em seus objetivos"
              className="p-8 netflix-card-hover"
            >
              <div 
                className="h-48 bg-cover bg-center rounded-lg mb-4 relative overflow-hidden"
                style={{ backgroundImage: `url(${workoutsImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <Button 
                  variant="netflix" 
                  size="icon"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                >
                  <Play className="w-8 h-8 fill-white" />
                </Button>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  <span>350+ exercícios com demonstrações</span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span>Acompanhamento de progresso</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Adaptação automática de cargas</span>
                </div>
                <Button 
                  variant="netflix" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/workouts")}
                >
                  Explorar Treinos
                </Button>
              </div>
            </GymCard>

            <GymCard 
              variant="nutrition"
              title="Nutrição com IA"
              description="Análise instantânea de refeições com 90% de precisão"
              className="p-8 netflix-card-hover"
            >
              <div 
                className="h-48 bg-cover bg-center rounded-lg mb-4 relative overflow-hidden"
                style={{ backgroundImage: `url(${nutritionImage})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <Button 
                  variant="netflix" 
                  size="icon"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full"
                >
                  <Play className="w-8 h-8 fill-white" />
                </Button>
              </div>
              <div className="space-y-3 text-sm text-foreground/80">
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-primary" />
                  <span>Foto → Calorias e macros</span>
                </div>
                <div className="flex items-center gap-2">
                  <Apple className="w-5 h-5 text-primary" />
                  <span>Planos de dieta personalizados</span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  <span>Receitas sugeridas pela IA</span>
                </div>
                <Button
                  variant="netflix" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/nutrition")}
                >
                  Analisar Refeição
                </Button>
              </div>
            </GymCard>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="netflix-fade-in" style={{ animationDelay: '0ms' }}>
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="Usuários Ativos"
                value="50K+"
                variant="default"
              />
            </div>
            <div className="netflix-fade-in" style={{ animationDelay: '100ms' }}>
              <StatCard
                icon={<Dumbbell className="w-6 h-6" />}
                title="Exercícios"
                value="350+"
                variant="fitness"
              />
            </div>
            <div className="netflix-fade-in" style={{ animationDelay: '200ms' }}>
              <StatCard
                icon={<Apple className="w-6 h-6" />}
                title="Refeições Analisadas"
                value="1M+"
                variant="nutrition"
              />
            </div>
            <div className="netflix-fade-in" style={{ animationDelay: '300ms' }}>
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Precisão IA"
                value="90%+"
                variant="default"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-3xl mx-auto">
          <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Pronto para sua transformação?
          </h3>
          <p className="text-lg text-foreground/60 mb-8">
            Junte-se a milhares de pessoas que já estão alcançando seus objetivos
          </p>
          <Button 
            variant="netflix" 
            size="lg"
            className="text-lg h-14 px-12"
            onClick={() => handleProtectedAction("/dashboard")}
          >
            <Play className="w-5 h-5 fill-white" />
            Começar Agora
          </Button>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
