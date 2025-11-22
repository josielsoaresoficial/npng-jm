import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import OnboardingFlow from "@/components/onboarding/OnboardingFlow";

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const { onboardingCompleted, loading: onboardingLoading } = useOnboardingStatus();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirecionar para login se não estiver autenticado
    if (!authLoading && !user) {
      navigate("/");
      return;
    }

    // Redirecionar para dashboard se já completou onboarding
    if (!onboardingLoading && onboardingCompleted) {
      navigate("/dashboard");
    }
  }, [user, authLoading, onboardingCompleted, onboardingLoading, navigate]);

  // Mostrar loading enquanto verifica autenticação
  if (authLoading || onboardingLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  // Só renderizar o onboarding se estiver autenticado e não tiver completado
  if (user && !onboardingCompleted) {
    return <OnboardingFlow />;
  }

  return null;
};

export default Onboarding;
