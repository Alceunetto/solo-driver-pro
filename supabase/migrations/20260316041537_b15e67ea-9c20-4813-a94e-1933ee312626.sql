
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can insert own profile with safe defaults"
ON public.profiles
FOR INSERT
TO public
WITH CHECK (
  auth.uid() = id
  AND role = 'instructor'
  AND plan = 'free'
  AND subscription_status = 'active'
  AND student_limit = 3
);
