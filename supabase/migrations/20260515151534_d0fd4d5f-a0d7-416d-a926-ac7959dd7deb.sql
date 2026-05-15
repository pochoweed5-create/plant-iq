CREATE TABLE public.beta_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.beta_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join beta"
ON public.beta_users
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
