import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PopulateWorkoutsProps {
  onComplete?: () => void;
}

export const PopulateWorkouts = ({ onComplete }: PopulateWorkoutsProps) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const populateWorkouts = async () => {
    setIsProcessing(true);
    try {
      // 1. Corrigir categorias 7min -> 7_minute
      const { error: categoryError } = await supabase
        .from("workouts")
        .update({ category: "7_minute" })
        .eq("category", "7min");

      if (categoryError) throw categoryError;

      // 2. Popular Treino de 7 Minutos
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "c877fdca-6532-4c92-b633-379ea3eedd75", name: "Polichinelo", sets: 1, reps: "30s", rest_time: 10 },
            { id: "9b3256a6-33c1-4745-9cf2-6953470d0033", name: "Agachamento", sets: 1, reps: "30s", rest_time: 10 },
            { id: "cd6bfb61-b5a6-4d93-bcc1-88923e6084c7", name: "Abdominal Crunch", sets: 1, reps: "30s", rest_time: 10 },
            { id: "26b6acbb-be4f-4d2f-a99a-19619ba99946", name: "Flexão", sets: 1, reps: "30s", rest_time: 10 },
            { id: "c4c8544d-4f49-44d0-8d48-334b8fcb4a4d", name: "Corrida Alta", sets: 1, reps: "30s", rest_time: 10 },
            { id: "d39b35b7-b81f-4582-a9ed-05b495c4f2c1", name: "Prancha", sets: 1, reps: "60s", rest_time: 0 },
          ],
        })
        .eq("id", "ffa1882f-bb32-4292-b84c-6920eddd876a");

      // 3. Popular Abdômen Definido
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "f23c4542-5dd3-4ab9-8502-31d8e2f13523", name: "Abdominal Banco Declinado", sets: 4, reps: "15", rest_time: 60 },
            { id: "2d4e2489-51b1-498e-8d60-996fb8163423", name: "Bicicleta Abdominal", sets: 3, reps: "20", rest_time: 45 },
            { id: "1ac585b0-d657-4b75-8259-c1cd8855dab6", name: "Abdominal Lateral", sets: 3, reps: "12", rest_time: 45 },
            { id: "32c3b93c-3524-4565-8121-c838ff1a19e9", name: "Abdominal Remador", sets: 3, reps: "15", rest_time: 60 },
            { id: "b5996982-a8ad-4bd0-8b5e-2309a1b06854", name: "Crunch Reverso", sets: 4, reps: "12", rest_time: 45 },
          ],
        })
        .eq("id", "5da90ec9-47bb-467a-b0b7-bed70ba5c91a");

      // 4. Popular Costas e Bíceps
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "abea0fa3-71a5-48c6-918d-7803d401f939", name: "Barra Fixa Pronada", sets: 4, reps: "8-10", rest_time: 90 },
            { id: "2ab71134-8952-43cd-a256-b0fea320c73d", name: "Remada Baixa Sentada", sets: 4, reps: "10-12", rest_time: 60 },
            { id: "c14e29f8-3233-42a8-b214-1e30c78e0982", name: "Puxada Frontal", sets: 3, reps: "12", rest_time: 60 },
            { id: "65b219ab-1c69-4bf5-a5ce-d7a84a8ce4d0", name: "Remada Curvada Unilateral", sets: 3, reps: "10", rest_time: 60 },
            { id: "ed577ba3-bfb0-4ebd-ab87-ab8658162d33", name: "Rosca Direta Barra", sets: 4, reps: "10", rest_time: 60 },
            { id: "2ac5d12a-d386-40ab-a791-62901b0eee91", name: "Rosca Concentrada", sets: 3, reps: "12", rest_time: 45 },
          ],
        })
        .eq("id", "aecb0828-7781-4eb8-b98b-6b23a0a5f516");

      // 5. Popular Cardio Moderado
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "ad5b4574-f522-42ff-9d16-3c0934c7ca74", name: "Corrida Leve", sets: 1, reps: "10 min", rest_time: 0 },
            { id: "c4c8544d-4f49-44d0-8d48-334b8fcb4a4d", name: "Corrida Alta", sets: 1, reps: "5 min", rest_time: 120 },
            { id: "3041e2c4-03ac-462c-88d2-edcd66b90f77", name: "Corrida Marcha", sets: 1, reps: "10 min", rest_time: 0 },
          ],
        })
        .eq("id", "06c1e8ea-3538-48c7-b050-50230812e78c");

      // 6. Popular Full Body Hipertrofia
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "748b1f1c-cab3-481a-a98d-2400921df0c4", name: "Agachamento Frontal", sets: 4, reps: "10", rest_time: 90 },
            { id: "7cce1b51-d3d2-40eb-abc1-21f85f6286fb", name: "Levantamento Terra", sets: 4, reps: "8", rest_time: 120 },
            { id: "26b6acbb-be4f-4d2f-a99a-19619ba99946", name: "Supino Reto", sets: 4, reps: "10", rest_time: 90 },
            { id: "1f288d7b-9a3b-4db5-aa8d-d9073a10f3d0", name: "Desenvolvimento Militar", sets: 4, reps: "10", rest_time: 90 },
            { id: "986c5e6c-5af3-4359-9de3-f1ffadb61842", name: "Remada Curvada", sets: 4, reps: "10", rest_time: 90 },
            { id: "ed577ba3-bfb0-4ebd-ab87-ab8658162d33", name: "Rosca Direta", sets: 3, reps: "12", rest_time: 60 },
            { id: "32c3b93c-3524-4565-8121-c838ff1a19e9", name: "Abdominal Remador", sets: 3, reps: "15", rest_time: 45 },
          ],
        })
        .eq("id", "2783e8e4-0414-46c7-9f22-880d5867fe1f");

      // 7. Popular HIIT Cardio
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "c4c8544d-4f49-44d0-8d48-334b8fcb4a4d", name: "Corrida Alta", sets: 4, reps: "45s", rest_time: 15 },
            { id: "9b3256a6-33c1-4745-9cf2-6953470d0033", name: "Agachamento", sets: 4, reps: "45s", rest_time: 15 },
            { id: "c877fdca-6532-4c92-b633-379ea3eedd75", name: "Polichinelo", sets: 4, reps: "45s", rest_time: 15 },
            { id: "3041e2c4-03ac-462c-88d2-edcd66b90f77", name: "Corrida Marcha", sets: 4, reps: "45s", rest_time: 15 },
            { id: "cd6bfb61-b5a6-4d93-bcc1-88923e6084c7", name: "Abdominal Crunch", sets: 4, reps: "45s", rest_time: 15 },
          ],
        })
        .eq("id", "9780f23e-fe97-4800-b274-3464779e6043");

      // 8. Popular Pernas Completo
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "748b1f1c-cab3-481a-a98d-2400921df0c4", name: "Agachamento Frontal", sets: 4, reps: "12", rest_time: 90 },
            { id: "e4150e21-5688-4ed5-aec1-57d97ddfa8f0", name: "Leg Press", sets: 4, reps: "12", rest_time: 90 },
            { id: "13f8862d-32fd-496a-b5f1-2fe532c1c87c", name: "Agachamento Sumo", sets: 3, reps: "12", rest_time: 60 },
            { id: "590542b6-d885-4db9-a574-b9570f11dc0c", name: "Panturrilha", sets: 4, reps: "15", rest_time: 45 },
          ],
        })
        .eq("id", "7c70be9b-4983-4728-a842-615fb8818fd0");

      // 9. Popular Força Máxima
      await supabase
        .from("workouts")
        .update({
          exercises_data: [
            { id: "748b1f1c-cab3-481a-a98d-2400921df0c4", name: "Agachamento Frontal", sets: 5, reps: "5", rest_time: 180 },
            { id: "7cce1b51-d3d2-40eb-abc1-21f85f6286fb", name: "Levantamento Terra", sets: 5, reps: "5", rest_time: 180 },
            { id: "1f288d7b-9a3b-4db5-aa8d-d9073a10f3d0", name: "Desenvolvimento Militar", sets: 5, reps: "5", rest_time: 180 },
            { id: "26b6acbb-be4f-4d2f-a99a-19619ba99946", name: "Supino Reto", sets: 5, reps: "5", rest_time: 180 },
            { id: "986c5e6c-5af3-4359-9de3-f1ffadb61842", name: "Remada Curvada", sets: 5, reps: "5", rest_time: 180 },
          ],
        })
        .eq("id", "d0490b22-56ae-4788-a05d-54ed83eac229");

      toast.success("Todos os treinos foram populados com exercícios!");
      onComplete?.();
    } catch (error) {
      console.error("Erro ao popular treinos:", error);
      toast.error("Erro ao popular treinos");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 bg-secondary/20 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Popular Treinos</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Clique para popular todos os treinos vazios com exercícios reais do banco de dados.
      </p>
      <Button onClick={populateWorkouts} disabled={isProcessing}>
        {isProcessing ? "Populando..." : "Popular Treinos"}
      </Button>
    </div>
  );
};
