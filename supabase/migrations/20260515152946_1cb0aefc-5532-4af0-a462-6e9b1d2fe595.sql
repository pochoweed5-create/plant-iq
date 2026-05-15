CREATE TABLE public.usuarios_beta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  correo_electronico TEXT NOT NULL UNIQUE,
  creado_en TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.usuarios_beta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can join beta with valid email"
ON public.usuarios_beta
FOR INSERT
TO anon, authenticated
WITH CHECK (
  correo_electronico IS NOT NULL
  AND length(correo_electronico) <= 255
  AND correo_electronico ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
);