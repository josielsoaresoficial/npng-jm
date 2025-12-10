-- Criar tabela para audit logs administrativos
CREATE TABLE public.admin_audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id uuid NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  details jsonb DEFAULT '{}',
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS - apenas admins podem visualizar e inserir logs
CREATE POLICY "Only admins can view audit logs" ON public.admin_audit_logs
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert audit logs" ON public.admin_audit_logs
FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));