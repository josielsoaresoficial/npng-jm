import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GymCard } from "@/components/GymCard";
import { StatCard } from "@/components/StatCard";
import { Dumbbell, Apple, TrendingUp, Zap, Camera, Users, ChefHat, Clock as ClockIcon, Calendar, Star, Quote } from "lucide-react";
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
import { DietTransformationCarousel } from "@/components/DietTransformationCarousel";


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

  // Usuários navegam livremente pela landing page
  // Autenticação/onboarding acontece apenas quando clicam em botões específicos

  const handleProtectedAction = async (path: string) => {
    if (user) {
      // Iniciar trial se ainda não foi iniciado
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
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <video 
          key={currentVideo}
          autoPlay 
          muted 
          playsInline
          webkit-playsinline="true"
          preload="auto"
          poster={heroFitnessImage}
          className="absolute inset-0 w-full h-full object-cover animate-fade-in"
          onLoadedData={(e) => {
            const video = e.currentTarget;
            video.play().catch(() => {
              // Fallback silencioso se autoplay falhar
            });
          }}
          onEnded={() => {
            setCurrentVideo((prev) => (prev + 1) % videos.length);
          }}
        >
          <source src={videos[currentVideo]} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-hero opacity-90" />
        
        <div className="relative z-10 px-4 py-20 text-center text-white">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              nPnG <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">JM</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Seu personal trainer e nutricionista com IA no bolso
            </p>
            <p className="text-lg mb-12 text-white/80 max-w-2xl mx-auto">
              Combine treinos inteligentes com análise nutricional por IA. Alcance seus objetivos fitness com precisão científica.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto"
                onClick={() => handleProtectedAction("/dashboard")}
              >
                <Zap className="w-5 h-5" />
                Iniciar Jornada Gratuita
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto border-white/30 text-white hover:bg-white/10"
                onClick={() => handleProtectedAction("/dashboard")}
              >
                Ver Demo
              </Button>
            </div>
            <p className="text-sm text-white/60 mt-4 flex items-center justify-center gap-2">
              <ClockIcon className="w-4 h-4 animate-pulse" />
              Teste grátis por 24 horas
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para <span className="text-primary">transformar</span> seu corpo
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tecnologia avançada de IA combinada com ciência do exercício para resultados comprovados
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {/* Fitness Feature */}
            <GymCard 
              variant="fitness"
              title="Treinos Inteligentes"
              description="Rotinas personalizadas baseadas em seus objetivos"
              className="p-8"
            >
              <div 
                className="h-32 bg-cover bg-center rounded-lg mb-4"
                style={{ backgroundImage: `url(${workoutsImage})` }}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Dumbbell className="w-6 h-6 text-primary" />
                  <span>350+ exercícios com demonstrações</span>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <span>Acompanhamento de progresso</span>
                </div>
                <div className="flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  <span>Adaptação automática de cargas</span>
                </div>
                <Button 
                  variant="fitness" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/workouts")}
                >
                  Explorar Treinos
                </Button>
              </div>
            </GymCard>

            {/* Nutrition Feature */}
            <GymCard 
              variant="nutrition"
              title="Nutrição com IA"
              description="Análise instantânea de refeições com 90% de precisão"
              className="p-8"
            >
              <div 
                className="h-32 bg-cover bg-center rounded-lg mb-4"
                style={{ backgroundImage: `url(${nutritionImage})` }}
              />
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Camera className="w-6 h-6 text-secondary" />
                  <span>Foto → Calorias e macros</span>
                </div>
                <div className="flex items-center gap-3">
                  <Apple className="w-6 h-6 text-secondary" />
                  <span>Planos de dieta personalizados</span>
                </div>
                <div className="flex items-center gap-3">
                  <ChefHat className="w-6 h-6 text-secondary" />
                  <span>Receitas sugeridas pela IA</span>
                </div>
                <Button
                  variant="nutrition" 
                  className="w-full mt-4"
                  onClick={() => handleProtectedAction("/nutrition")}
                >
                  Analisar Refeição
                </Button>
              </div>
            </GymCard>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-16">
            <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
              <StatCard
                icon={<Users className="w-6 h-6" />}
                title="Capacidade +50K Usuários Ativos"
                value="50K+"
                variant="fitness"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
              <StatCard
                icon={<Dumbbell className="w-6 h-6" />}
                title="Exercícios"
                value="350+"
                variant="fitness"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
              <StatCard
                icon={<Apple className="w-6 h-6" />}
                title="Refeições Analisadas"
                value="1M+"
                variant="nutrition"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
              <StatCard
                icon={<TrendingUp className="w-6 h-6" />}
                title="Precisão IA"
                value="90%+"
                variant="nutrition"
              />
            </div>
            <div className="animate-fade-in" style={{ animationDelay: '400ms' }}>
              <StatCard
                icon={<Calendar className="w-6 h-6" />}
                title="Dieta de 21 Dias"
                value="21"
                variant="nutrition"
              />
            </div>
          </div>

          {/* Testimonials Section - Dieta de 21 Dias */}
          <div className="py-16 px-4 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-green-500/5 rounded-2xl border border-green-500/10 mb-16">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                <Calendar className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Dieta de 21 Dias</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">
                Histórias reais de <span className="text-green-600">transformação</span>
              </h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Veja como nossos usuários transformaram suas vidas com a Dieta de 21 Dias
              </p>
            </div>

            {/* Carrossel de Transformações Antes/Depois */}
            <div className="mb-12">
              <DietTransformationCarousel />
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {/* Depoimento 1 */}
              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-smooth animate-fade-in">
                <Quote className="w-8 h-8 text-green-500/30 mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "Perdi 8kg em 21 dias! O plano alimentar é super fácil de seguir e as receitas são deliciosas. Me sinto mais leve e energizada."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-500 flex items-center justify-center text-white font-bold">
                    MC
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Maria Clara</p>
                    <p className="text-sm text-muted-foreground">-8kg em 21 dias</p>
                  </div>
                </div>
              </div>

              {/* Depoimento 2 */}
              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-smooth animate-fade-in" style={{ animationDelay: '100ms' }}>
                <Quote className="w-8 h-8 text-green-500/30 mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "Incrível! Não só perdi 12kg, mas mudei completamente minha relação com a comida. Os resultados são duradouros."
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                    RS
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ricardo Silva</p>
                    <p className="text-sm text-muted-foreground">-12kg em 21 dias</p>
                  </div>
                </div>
              </div>

              {/* Depoimento 3 */}
              <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-smooth animate-fade-in" style={{ animationDelay: '200ms' }}>
                <Quote className="w-8 h-8 text-green-500/30 mb-4" />
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  ))}
                </div>
                <p className="text-foreground mb-6 italic">
                  "Método simples e eficaz. Perdi 6kg e aprendi a comer melhor. Recomendo para quem quer resultados reais!"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-bold">
                    AF
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Ana Ferreira</p>
                    <p className="text-sm text-muted-foreground">-6kg em 21 dias</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <Button 
                variant="nutrition" 
                size="lg"
                onClick={() => handleProtectedAction("/diet-21-days")}
              >
                <Calendar className="w-5 h-5" />
                Começar Minha Transformação
              </Button>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Pronto para começar sua transformação?</h3>
            <p className="text-muted-foreground mb-8">
              Junte-se a milhares de pessoas que já estão alcançando seus objetivos com o nPnG JM
            </p>
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => handleProtectedAction("/dashboard")}
            >
              <Zap className="w-5 h-5" />
              Iniciar Jornada Gratuita
            </Button>
          </div>
        </div>
      </section>

      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
    </div>
  );
};

export default Index;
