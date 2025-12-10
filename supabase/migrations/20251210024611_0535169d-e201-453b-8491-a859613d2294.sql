
-- =====================================================
-- CORREÇÃO COMPLETA DAS POLÍTICAS DE STORAGE
-- =====================================================

-- Remover TODAS as políticas de storage existentes
DROP POLICY IF EXISTS "Admins can view all body photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view exercise GIFs" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload exercise GIFs" ON storage.objects;
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own body photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own body photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload body photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload own body photos" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own body photos" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can delete exercise GIFs" ON storage.objects;
DROP POLICY IF EXISTS "Only admins can update exercise GIFs" ON storage.objects;

-- =====================================================
-- AVATARS BUCKET - Público para leitura, restrito para escrita
-- =====================================================

-- Avatares são públicos para visualização (necessário para exibição)
CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'avatars');

-- Upload apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can upload their avatar" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Update apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can update their avatar" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Delete apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can delete their avatar" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- =====================================================
-- BODY-PHOTOS BUCKET - Restrito completamente
-- =====================================================

-- Visualização apenas pelo próprio usuário
CREATE POLICY "Users can view own body photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'body-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Upload apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can upload body photos" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'body-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Update apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can update body photos" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'body-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Delete apenas para usuários autenticados na sua própria pasta
CREATE POLICY "Users can delete body photos" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'body-photos' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- Admins podem ver todas as fotos (para moderação)
CREATE POLICY "Admins can view all body photos" ON storage.objects
FOR SELECT TO authenticated
USING (bucket_id = 'body-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- =====================================================
-- EXERCISE-GIFS BUCKET - Público para leitura, admin para escrita
-- =====================================================

-- GIFs de exercícios são públicos para visualização
CREATE POLICY "Exercise GIFs are publicly viewable" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'exercise-gifs');

-- Upload apenas para admins
CREATE POLICY "Only admins can upload exercise GIFs" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exercise-gifs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Update apenas para admins
CREATE POLICY "Only admins can update exercise GIFs" ON storage.objects
FOR UPDATE TO authenticated
USING (bucket_id = 'exercise-gifs' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- Delete apenas para admins
CREATE POLICY "Only admins can delete exercise GIFs" ON storage.objects
FOR DELETE TO authenticated
USING (bucket_id = 'exercise-gifs' AND public.has_role(auth.uid(), 'admin'::public.app_role));
