-- Ativar extensão PostGIS para geolocalização
CREATE EXTENSION IF NOT EXISTS postgis;

-- Adicionar colunas de geolocalização na tabela users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS location_point geometry(Point, 4326),
ADD COLUMN IF NOT EXISTS street_name text,
ADD COLUMN IF NOT EXISTS street_number text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS country text,
ADD COLUMN IF NOT EXISTS last_location_update timestamp with time zone DEFAULT now();

-- Criar índice espacial para melhor performance em consultas de geolocalização
CREATE INDEX IF NOT EXISTS idx_users_location_point ON public.users USING GIST (location_point);

-- Criar função para atualizar localização do usuário
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

-- Criar função para buscar usuários próximos (para funcionalidade "Quem está aqui")
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