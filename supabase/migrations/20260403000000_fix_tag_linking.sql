-- Refine Tag Linking for Phase 3
-- Add unique constraint to prevent duplicate links (redundant since PK is (publication_id, tag_id), but good for clarity)
-- Add indexes for performance in "Taste Graph" queries

CREATE INDEX IF NOT EXISTS idx_publication_hub_tags_tag_id ON public.publication_hub_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_publication_hub_tags_publication_id ON public.publication_hub_tags(publication_id);

-- Optional: Function to sync tags array to junction table (backwards compatibility or transition)
-- For now we'll just use the junction table in the code.
