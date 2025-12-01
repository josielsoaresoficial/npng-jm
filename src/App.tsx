import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Workouts from "./pages/Workouts";
import Nutrition from "./pages/Nutrition";
import Progress from "./pages/Progress";
import Profile from "./pages/Profile";
import Exercises from "./pages/Exercises";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import ResetPassword from "./pages/ResetPassword";
import CaloriesBurnedPage from "./pages/CaloriesBurnedPage";
import HydrationPage from "./pages/HydrationPage";
import ProteinGoalPage from "./pages/ProteinGoalPage";
import WorkoutTimePage from "./pages/WorkoutTimePage";
import WorkoutPlayer from "./pages/WorkoutPlayer";
import MuscleWorkoutPage from "./pages/MuscleWorkoutPage";
import ExerciseLibrary from "./pages/ExerciseLibrary";
import ExerciseDetail from "./pages/ExerciseDetail";
import WorkoutSession from "./pages/WorkoutSession";
import ExerciseManagement from "./pages/ExerciseManagement";
import FavoriteRecipes from "./pages/FavoriteRecipes";
import ExerciseStats from "./pages/ExerciseStats";
import WorkoutHistory from "./pages/WorkoutHistory";
import CustomWorkouts from "./pages/CustomWorkouts";
import CustomFoods from "./pages/CustomFoods";
import Diet21Days from "./pages/Diet21Days";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

const AppContent = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/workouts" element={<ProtectedRoute><Workouts /></ProtectedRoute>} />
        <Route path="/nutrition" element={<ProtectedRoute><Nutrition /></ProtectedRoute>} />
        <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/exercises" element={<ProtectedRoute><Exercises /></ProtectedRoute>} />
        <Route path="/stats/calories-burned" element={<ProtectedRoute><CaloriesBurnedPage /></ProtectedRoute>} />
        <Route path="/stats/hydration" element={<ProtectedRoute><HydrationPage /></ProtectedRoute>} />
        <Route path="/stats/protein-goal" element={<ProtectedRoute><ProteinGoalPage /></ProtectedRoute>} />
        <Route path="/stats/workout-time" element={<ProtectedRoute><WorkoutTimePage /></ProtectedRoute>} />
        <Route path="/workout-player/:id" element={<ProtectedRoute><WorkoutPlayer /></ProtectedRoute>} />
        <Route path="/workouts/muscle/:muscleName" element={<ProtectedRoute><MuscleWorkoutPage /></ProtectedRoute>} />
        <Route path="/exercise-library" element={<ProtectedRoute><ExerciseLibrary /></ProtectedRoute>} />
        <Route path="/exercise/:id" element={<ProtectedRoute><ExerciseDetail /></ProtectedRoute>} />
        <Route path="/workout-session/:programId/:dayId" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
        <Route path="/workout-session" element={<ProtectedRoute><WorkoutSession /></ProtectedRoute>} />
        <Route path="/exercise-management" element={<ProtectedRoute><ExerciseManagement /></ProtectedRoute>} />
        <Route path="/favorite-recipes" element={<ProtectedRoute><FavoriteRecipes /></ProtectedRoute>} />
        <Route path="/exercise-stats" element={<ProtectedRoute><ExerciseStats /></ProtectedRoute>} />
        <Route path="/workout-history" element={<ProtectedRoute><WorkoutHistory /></ProtectedRoute>} />
        <Route path="/custom-workouts" element={<ProtectedRoute><CustomWorkouts /></ProtectedRoute>} />
        <Route path="/custom-foods" element={<ProtectedRoute><CustomFoods /></ProtectedRoute>} />
        <Route path="/diet-21-days" element={<ProtectedRoute><Diet21Days /></ProtectedRoute>} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
