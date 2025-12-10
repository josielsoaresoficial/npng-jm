-- Adicionar políticas restritivas para prevenir modificação/exclusão de audit logs
-- Isso garante que logs de auditoria são imutáveis (append-only)

CREATE POLICY "No one can update audit logs" ON public.admin_audit_logs
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "No one can delete audit logs" ON public.admin_audit_logs
FOR DELETE TO authenticated
USING (false);