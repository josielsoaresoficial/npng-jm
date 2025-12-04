-- Limpar subscriptions antigas que usavam chaves VAPID anteriores
-- Necessário porque as novas chaves VAPID invalidam todas as subscriptions existentes
TRUNCATE TABLE push_subscriptions;