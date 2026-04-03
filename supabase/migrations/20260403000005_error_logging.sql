-- Phase 5: Error Logging for Intelligence Pipeline
ALTER TABLE public.publications 
ADD COLUMN IF NOT EXISTS error_message TEXT;
