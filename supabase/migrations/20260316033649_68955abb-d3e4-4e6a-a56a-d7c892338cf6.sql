
CREATE TABLE public.lesson_evaluations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  instructor_id uuid NOT NULL,
  skill_name text NOT NULL,
  score integer NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.lesson_evaluations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors can view own evaluations"
  ON public.lesson_evaluations FOR SELECT
  TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can insert own evaluations"
  ON public.lesson_evaluations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update own evaluations"
  ON public.lesson_evaluations FOR UPDATE
  TO authenticated
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete own evaluations"
  ON public.lesson_evaluations FOR DELETE
  TO authenticated
  USING (auth.uid() = instructor_id);

CREATE INDEX idx_lesson_evaluations_student ON public.lesson_evaluations(student_id);
CREATE INDEX idx_lesson_evaluations_lesson ON public.lesson_evaluations(lesson_id);
