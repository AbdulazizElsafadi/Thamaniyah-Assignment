-- Create table without status column
CREATE TABLE IF NOT EXISTS "program" (
  "id" BIGSERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "language" TEXT,
  "duration_seconds" INTEGER,
  "publication_date" DATE,
  "published_at" TIMESTAMPTZ
);

-- Indexes for faster search (no status index)
CREATE INDEX IF NOT EXISTS idx_program_title ON program USING GIN (to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_program_description ON program USING GIN (to_tsvector('english', description));
CREATE INDEX IF NOT EXISTS idx_program_category ON program(category);


