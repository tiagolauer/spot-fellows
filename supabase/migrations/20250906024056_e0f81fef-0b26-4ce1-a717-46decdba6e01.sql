-- Drop the integer version of get_nearby_users function to resolve conflict
DROP FUNCTION IF EXISTS public.get_nearby_users(user_latitude double precision, user_longitude double precision, radius_meters integer);

-- Ensure the double precision version exists with proper security
CREATE OR REPLACE FUNCTION public.get_nearby_users(
  user_latitude DOUBLE PRECISION,
  user_longitude DOUBLE PRECISION, 
  radius_meters DOUBLE PRECISION DEFAULT 1000
)
RETURNS TABLE (
  id TEXT,
  name TEXT,
  avatar_url TEXT,
  street_name TEXT,
  street_number TEXT,
  distance_meters DOUBLE PRECISION,
  last_location_update TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input parameters
  IF user_latitude IS NULL OR user_longitude IS NULL THEN
    RAISE EXCEPTION 'Latitude and longitude cannot be null';
  END IF;
  
  IF user_latitude < -90 OR user_latitude > 90 THEN
    RAISE EXCEPTION 'Invalid latitude value: %', user_latitude;
  END IF;
  
  IF user_longitude < -180 OR user_longitude > 180 THEN
    RAISE EXCEPTION 'Invalid longitude value: %', user_longitude;
  END IF;

  IF radius_meters <= 0 OR radius_meters > 50000 THEN
    RAISE EXCEPTION 'Invalid radius: must be between 1 and 50000 meters';
  END IF;

  RETURN QUERY
  SELECT 
    u.id::TEXT,
    u.name,
    u.avatar_url,
    u.street_name,
    u.street_number,
    ST_Distance(
      ST_GeogFromText('POINT(' || user_longitude || ' ' || user_latitude || ')'),
      ST_GeogFromText('POINT(' || ST_X(u.location_point::geometry) || ' ' || ST_Y(u.location_point::geometry) || ')')
    ) as distance_meters,
    u.last_location_update
  FROM public.users u
  WHERE 
    u.id != auth.uid()
    AND u.location_point IS NOT NULL
    AND u.last_location_update >= NOW() - INTERVAL '5 minutes'
    AND ST_DWithin(
      ST_GeogFromText('POINT(' || user_longitude || ' ' || user_latitude || ')'),
      ST_GeogFromText('POINT(' || ST_X(u.location_point::geometry) || ' ' || ST_Y(u.location_point::geometry) || ')'),
      radius_meters
    )
  ORDER BY distance_meters ASC
  LIMIT 50;
END;
$$;