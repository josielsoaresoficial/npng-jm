-- Inserir o usuário como admin
INSERT INTO public.user_roles (user_id, role)
VALUES ('641f27e3-3dc7-4c8c-883b-8a0cc1cb696b', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;