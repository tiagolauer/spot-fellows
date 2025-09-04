-- Enable RLS on spatial_ref_sys table to fix security warning
ALTER TABLE spatial_ref_sys ENABLE ROW LEVEL SECURITY;

-- Create policy for spatial_ref_sys - this is a system table that should be readable by all
CREATE POLICY "Allow read access to spatial reference systems" ON spatial_ref_sys FOR SELECT USING (true);

-- Enable RLS on geometry_columns table 
ALTER TABLE geometry_columns ENABLE ROW LEVEL SECURITY;

-- Create policy for geometry_columns - this is a system table that should be readable by all
CREATE POLICY "Allow read access to geometry columns" ON geometry_columns FOR SELECT USING (true);

-- Enable RLS on geography_columns table 
ALTER TABLE geography_columns ENABLE ROW LEVEL SECURITY;

-- Create policy for geography_columns - this is a system table that should be readable by all
CREATE POLICY "Allow read access to geography columns" ON geography_columns FOR SELECT USING (true);