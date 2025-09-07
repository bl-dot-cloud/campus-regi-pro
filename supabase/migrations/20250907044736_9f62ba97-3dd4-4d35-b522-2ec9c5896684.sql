-- Create a trigger to insert profiles on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Only insert if a profile doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.user_id = NEW.id) THEN
    INSERT INTO public.profiles (
      user_id,
      full_name,
      matric_number,
      department,
      level,
      fees_paid,
      admin_created,
      temporary_password
    ) VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'New Student'),
      COALESCE(NEW.raw_user_meta_data ->> 'matric_number', CONCAT('MATRIC-', left(NEW.id::text, 8))),
      COALESCE(NEW.raw_user_meta_data ->> 'department', 'General Studies'),
      COALESCE(NEW.raw_user_meta_data ->> 'level', 'ND1'),
      false,
      false,
      NULL
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();