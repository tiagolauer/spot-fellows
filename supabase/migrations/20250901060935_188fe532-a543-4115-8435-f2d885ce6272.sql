-- Corrigir problemas de segurança detectados

-- 1. Corrigir search_path nas funções (Security Definer)
DROP FUNCTION IF EXISTS public.update_user_location(uuid, double precision, double precision, text, text, text, text, text, text);
DROP FUNCTION IF EXISTS public.get_nearby_users(double precision, double precision, double precision);
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recriar função handle_new_user com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, name, joined_at)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'first_name' || ' ' || NEW.raw_user_meta_data->>'last_name',
      NEW.email
    ),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- Recriar função update_user_location com search_path seguro
CREATE OR REPLACE FUNCTION public.update_user_location(
  user_id uuid,
  latitude double precision,
  longitude double precision,
  street_name_param text DEFAULT NULL,
  street_number_param text DEFAULT NULL,
  city_param text DEFAULT NULL,
  state_param text DEFAULT NULL,
  postal_code_param text DEFAULT NULL,
  country_param text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users 
  SET 
    location_point = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
    street_name = street_name_param,
    street_number = street_number_param,
    city = city_param,
    state = state_param,
    postal_code = postal_code_param,
    country = country_param,
    last_location_update = now()
  WHERE id = user_id;
END;
$$;

-- Recriar função get_nearby_users com search_path seguro
CREATE OR REPLACE FUNCTION public.get_nearby_users(
  user_latitude double precision,
  user_longitude double precision,
  radius_meters double precision DEFAULT 1000
)
RETURNS TABLE (
  id uuid,
  name text,
  avatar_url text,
  street_name text,
  street_number text,
  distance_meters double precision,
  last_location_update timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar_url,
    u.street_name,
    u.street_number,
    ST_Distance(
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography,
      u.location_point::geography
    ) AS distance_meters,
    u.last_location_update
  FROM public.users u
  WHERE 
    u.location_point IS NOT NULL
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint(user_longitude, user_latitude), 4326)::geography,
      u.location_point::geography,
      radius_meters
    )
    AND u.id != auth.uid() -- Excluir o próprio usuário
  ORDER BY distance_meters ASC;
END;
$$;

-- Garantir que todas as políticas RLS estejam ativas na tabela users
-- (não deveria ser necessário, mas por precaução)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;