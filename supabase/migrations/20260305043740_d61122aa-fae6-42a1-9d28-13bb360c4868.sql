-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ── Profiles table ──
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'instructor' CHECK (role IN ('instructor', 'admin')),
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'monthly', 'annual')),
  student_limit INTEGER NOT NULL DEFAULT 3,
  subscription_status TEXT NOT NULL DEFAULT 'active' CHECK (subscription_status IN ('active', 'canceled', 'past_due', 'trialing')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── Students table ──
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT,
  cpf TEXT,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  total_lessons INTEGER NOT NULL DEFAULT 0,
  completed_lessons INTEGER NOT NULL DEFAULT 0,
  paid BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own students" ON public.students
  FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can insert own students" ON public.students
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update own students" ON public.students
  FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete own students" ON public.students
  FOR DELETE USING (auth.uid() = instructor_id);

CREATE INDEX idx_students_instructor ON public.students(instructor_id);

-- ── Lessons table ──
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  student_name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  meeting_location TEXT NOT NULL DEFAULT '',
  end_location TEXT NOT NULL DEFAULT '',
  meeting_address TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'pratica' CHECK (type IN ('pratica', 'baliza', 'simulado', 'avaliacao')),
  status TEXT NOT NULL DEFAULT 'agendada' CHECK (status IN ('agendada', 'em_andamento', 'concluida', 'cancelada')),
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own lessons" ON public.lessons
  FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can insert own lessons" ON public.lessons
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update own lessons" ON public.lessons
  FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete own lessons" ON public.lessons
  FOR DELETE USING (auth.uid() = instructor_id);

CREATE INDEX idx_lessons_instructor_date ON public.lessons(instructor_id, date);

-- ── Expenses table ──
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('fuel', 'maintenance', 'tax', 'other')),
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own expenses" ON public.expenses
  FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can insert own expenses" ON public.expenses
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update own expenses" ON public.expenses
  FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete own expenses" ON public.expenses
  FOR DELETE USING (auth.uid() = instructor_id);

CREATE INDEX idx_expenses_instructor_date ON public.expenses(instructor_id, date);

-- ── Vehicles table ──
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL DEFAULT '',
  year INTEGER NOT NULL DEFAULT 2024,
  plate TEXT NOT NULL DEFAULT '',
  current_km INTEGER NOT NULL DEFAULT 0,
  oil_change_km INTEGER NOT NULL DEFAULT 0,
  fuel_type TEXT NOT NULL DEFAULT 'flex' CHECK (fuel_type IN ('gasolina', 'etanol', 'flex', 'diesel')),
  avg_consumption NUMERIC(5,2) NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own vehicles" ON public.vehicles
  FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can insert own vehicles" ON public.vehicles
  FOR INSERT WITH CHECK (auth.uid() = instructor_id);
CREATE POLICY "Instructors can update own vehicles" ON public.vehicles
  FOR UPDATE USING (auth.uid() = instructor_id);
CREATE POLICY "Instructors can delete own vehicles" ON public.vehicles
  FOR DELETE USING (auth.uid() = instructor_id);

CREATE INDEX idx_vehicles_instructor ON public.vehicles(instructor_id);