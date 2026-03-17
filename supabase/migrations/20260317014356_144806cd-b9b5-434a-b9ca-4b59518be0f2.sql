
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'B';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS exam_date date;
