-- Create courses table for course management
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_code TEXT NOT NULL UNIQUE,
  course_title TEXT NOT NULL,
  units INTEGER NOT NULL,
  semester TEXT NOT NULL,
  level TEXT NOT NULL,
  department TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Create policies for course access (publicly readable, admin only write)
CREATE POLICY "Courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (true);

-- Create course_registrations table to track student registrations
CREATE TABLE public.course_registrations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  academic_session TEXT NOT NULL,
  semester TEXT NOT NULL,
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'active',
  UNIQUE(user_id, course_id, academic_session)
);

-- Enable Row Level Security
ALTER TABLE public.course_registrations ENABLE ROW LEVEL SECURITY;

-- Create policies for course registrations
CREATE POLICY "Users can view their own registrations" 
ON public.course_registrations 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own registrations" 
ON public.course_registrations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own registrations" 
ON public.course_registrations 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for course timestamp updates
CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample courses
INSERT INTO public.courses (course_code, course_title, units, semester, level, department, description) VALUES
('CSC101', 'Introduction to Computer Science', 3, 'First', 'ND1', 'Computer Science', 'Basic concepts of computer science and programming'),
('CSC102', 'Computer Programming I', 4, 'First', 'ND1', 'Computer Science', 'Introduction to programming using a high-level language'),
('CSC201', 'Data Structures and Algorithms', 3, 'First', 'ND2', 'Computer Science', 'Study of data structures and algorithm design'),
('CSC202', 'Database Management Systems', 3, 'Second', 'ND2', 'Computer Science', 'Introduction to database concepts and SQL'),
('MTH101', 'General Mathematics I', 3, 'First', 'ND1', 'Mathematics', 'Basic mathematics for technical students'),
('MTH102', 'General Mathematics II', 3, 'Second', 'ND1', 'Mathematics', 'Continuation of basic mathematics'),
('ENG101', 'Use of English I', 2, 'First', 'ND1', 'General Studies', 'Communication skills and English language'),
('ENG102', 'Use of English II', 2, 'Second', 'ND1', 'General Studies', 'Advanced communication skills');

-- Add admin_created column to profiles to track admin-created students
ALTER TABLE public.profiles 
ADD COLUMN admin_created BOOLEAN DEFAULT false,
ADD COLUMN temporary_password TEXT DEFAULT NULL;