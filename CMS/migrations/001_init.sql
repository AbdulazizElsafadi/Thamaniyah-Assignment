-- Users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);

-- User Roles
CREATE TYPE IF NOT EXISTS user_role AS ENUM ('admin', 'editor');
CREATE TABLE IF NOT EXISTS users_roles (
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role user_role NOT NULL,
  PRIMARY KEY (user_id, role)
);

-- User Sessions (note: original had a typo 'sessoins')
CREATE TABLE IF NOT EXISTS users_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

-- Audit Log
CREATE TYPE IF NOT EXISTS target_type AS ENUM ('program', 'user');
CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  actor_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  target_type target_type NOT NULL,
  target_id TEXT,
  meta JSONB,
  ip INET,
  ua TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Category
CREATE TABLE IF NOT EXISTS category (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- Program
CREATE TYPE IF NOT EXISTS program_status AS ENUM ('public', 'draft', 'archived');
CREATE TABLE IF NOT EXISTS program (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  status program_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  description TEXT,
  category_id INTEGER REFERENCES category(id) ON DELETE SET NULL,
  publication_date DATE,
  language TEXT,
  duration_seconds INTEGER
);

-- Program Published (materialized copy of public programs)
CREATE TABLE IF NOT EXISTS program_published (
  program_id INTEGER PRIMARY KEY REFERENCES program(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category_slug TEXT,
  language TEXT,
  duration_seconds INTEGER
);


