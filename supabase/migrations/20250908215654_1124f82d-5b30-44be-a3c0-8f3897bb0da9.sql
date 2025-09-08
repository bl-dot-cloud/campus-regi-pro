-- Add academic_session field to courses table to match student registration form
ALTER TABLE public.courses 
ADD COLUMN academic_session text;