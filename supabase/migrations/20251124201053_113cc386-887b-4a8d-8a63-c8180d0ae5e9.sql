-- Create storage bucket for exercise GIFs
INSERT INTO storage.buckets (id, name, public)
VALUES ('exercise-gifs', 'exercise-gifs', true);

-- Storage policies for exercise GIFs bucket
CREATE POLICY "Anyone can view exercise GIFs"
ON storage.objects FOR SELECT
USING (bucket_id = 'exercise-gifs');

CREATE POLICY "Authenticated users can upload exercise GIFs"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'exercise-gifs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update exercise GIFs"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'exercise-gifs' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete exercise GIFs"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'exercise-gifs' 
  AND auth.role() = 'authenticated'
);

-- Add INSERT policy for exercise_library table
CREATE POLICY "Authenticated users can create exercises"
ON public.exercise_library FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

-- Add UPDATE policy for exercise_library table
CREATE POLICY "Authenticated users can update exercises"
ON public.exercise_library FOR UPDATE
USING (auth.role() = 'authenticated');

-- Add DELETE policy for exercise_library table
CREATE POLICY "Authenticated users can delete exercises"
ON public.exercise_library FOR DELETE
USING (auth.role() = 'authenticated');