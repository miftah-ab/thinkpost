-- ThinkPost AI — Initial Database Schema
-- Matches FRD Section 5 Data Dictionary exactly
-- Run this in the Supabase SQL Editor or via supabase db push

-- ============================================
-- Custom ENUM types
-- ============================================
CREATE TYPE memory_category AS ENUM ('topic', 'fact', 'tone_note', 'experience_detail', 'other');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- ============================================
-- Users table
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workos_user_id VARCHAR NOT NULL UNIQUE,
  email VARCHAR NOT NULL UNIQUE,
  name VARCHAR NOT NULL,
  read_only_mode BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Profile table (1:1 with users)
-- ============================================
CREATE TABLE profile (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  headline VARCHAR(150),
  bio TEXT,
  experience JSONB,  -- Schema: [{title, company, startDate, endDate, description}]
  skills JSONB,      -- Schema: string[]
  goals JSONB,       -- Schema: string[]
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Writing style table (1:1 with users)
-- ============================================
CREATE TABLE writing_style (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  tone VARCHAR NOT NULL,
  length VARCHAR NOT NULL,
  emoji_usage BOOLEAN NOT NULL,
  cta_style VARCHAR,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Memories table (N:1 with users)
-- ============================================
CREATE TABLE memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  key VARCHAR(100) NOT NULL,
  value TEXT NOT NULL,
  category memory_category NOT NULL DEFAULT 'other',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Posts table (N:1 with users)
-- ============================================
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================
-- Required indexes (FRD Section 5)
-- ============================================
-- Speeds up get_memories(category) filtering
CREATE INDEX idx_memories_user_category ON memories(user_id, category);

-- Supports paginated, filtered list_posts()
CREATE INDEX idx_posts_user_status_created ON posts(user_id, status, created_at);

-- ============================================
-- Auto-update updated_at triggers
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profile_updated_at
  BEFORE UPDATE ON profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_writing_style_updated_at
  BEFORE UPDATE ON writing_style
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
