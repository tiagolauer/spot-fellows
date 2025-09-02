-- Create check_ins table to store location history
CREATE TABLE public.check_ins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  location_point GEOMETRY(POINT, 4326),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  street_name TEXT,
  street_number TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  postal_code TEXT,
  formatted_address TEXT,
  checked_in_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- Create policies for check_ins
CREATE POLICY "Users can view their own check-ins" 
ON public.check_ins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own check-ins" 
ON public.check_ins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_check_ins_user_id ON public.check_ins(user_id);
CREATE INDEX idx_check_ins_checked_in_at ON public.check_ins(checked_in_at DESC);

-- Create function to get user's last check-in time
CREATE OR REPLACE FUNCTION public.get_user_last_checkin(p_user_id UUID)
RETURNS TIMESTAMP WITH TIME ZONE
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT checked_in_at
  FROM public.check_ins
  WHERE user_id = p_user_id
  ORDER BY checked_in_at DESC
  LIMIT 1;
$$;

-- Create function to save check-in
CREATE OR REPLACE FUNCTION public.save_checkin(
  p_latitude DOUBLE PRECISION,
  p_longitude DOUBLE PRECISION,
  p_street_name TEXT DEFAULT NULL,
  p_street_number TEXT DEFAULT NULL,
  p_city TEXT DEFAULT NULL,
  p_state TEXT DEFAULT NULL,
  p_country TEXT DEFAULT NULL,
  p_postal_code TEXT DEFAULT NULL,
  p_formatted_address TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  checkin_id UUID;
  last_checkin TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Check if user can check in (5 minute cooldown)
  SELECT get_user_last_checkin(auth.uid()) INTO last_checkin;
  
  IF last_checkin IS NOT NULL AND last_checkin > (now() - interval '5 minutes') THEN
    RAISE EXCEPTION 'Você deve aguardar 5 minutos entre check-ins. Último check-in: %', last_checkin;
  END IF;

  -- Insert check-in
  INSERT INTO public.check_ins (
    user_id,
    location_point,
    latitude,
    longitude,
    street_name,
    street_number,
    city,
    state,
    country,
    postal_code,
    formatted_address
  )
  VALUES (
    auth.uid(),
    ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326),
    p_latitude,
    p_longitude,
    p_street_name,
    p_street_number,
    p_city,
    p_state,
    p_country,
    p_postal_code,
    p_formatted_address
  )
  RETURNING id INTO checkin_id;

  -- Update user's last location
  UPDATE public.users 
  SET 
    location_point = ST_SetSRID(ST_MakePoint(p_longitude, p_latitude), 4326),
    street_name = p_street_name,
    street_number = p_street_number,
    city = p_city,
    state = p_state,
    country = p_country,
    postal_code = p_postal_code,
    last_location_update = now()
  WHERE id = auth.uid();

  RETURN checkin_id;
END;
$$;