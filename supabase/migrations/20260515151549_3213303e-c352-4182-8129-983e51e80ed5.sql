DROP POLICY IF EXISTS "Anyone can join beta" ON public.beta_users;

CREATE POLICY "Anyone can join beta with valid email"
ON public.beta_users
FOR INSERT
TO anon, authenticated
WITH CHECK (
  email IS NOT NULL
  AND length(email) <= 255
  AND email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);
