
-- Drop the existing permissive UPDATE policy
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create a restricted UPDATE policy that only allows safe column changes
CREATE POLICY "Users can update own safe fields"
ON public.profiles
FOR UPDATE
TO public
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  AND plan = (SELECT p.plan FROM public.profiles p WHERE p.id = auth.uid())
  AND subscription_status = (SELECT p.subscription_status FROM public.profiles p WHERE p.id = auth.uid())
  AND student_limit = (SELECT p.student_limit FROM public.profiles p WHERE p.id = auth.uid())
);
