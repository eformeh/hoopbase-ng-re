/*
  # Basketball Courts Schema

  1. New Tables
    - `courts`
      - `id` (uuid, primary key)
      - `name` (text)
      - `address` (text)
      - `description` (text)
      - `images` (text array)
      - `rating` (numeric)
      - `total_ratings` (integer)
      - `is_busy` (boolean)
      - `busy_times` (text array)
      - `free_access` (boolean)
      - `entrance_fee` (text)
      - `has_lighting` (boolean)
      - `surface` (text)
      - `basket_height` (text)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `court_comments`
      - `id` (uuid, primary key)
      - `court_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `text` (text)
      - `rating` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create courts table
CREATE TABLE IF NOT EXISTS courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  description text,
  images text[] DEFAULT ARRAY[]::text[],
  rating numeric DEFAULT 0,
  total_ratings integer DEFAULT 0,
  is_busy boolean DEFAULT false,
  busy_times text[] DEFAULT ARRAY[]::text[],
  free_access boolean DEFAULT true,
  entrance_fee text,
  has_lighting boolean DEFAULT false,
  surface text,
  basket_height text,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create court comments table
CREATE TABLE IF NOT EXISTS court_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  court_id uuid REFERENCES courts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_comments ENABLE ROW LEVEL SECURITY;

-- Policies for courts
CREATE POLICY "Courts are viewable by everyone"
  ON courts
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create courts"
  ON courts
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update courts"
  ON courts
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policies for court comments
CREATE POLICY "Comments are viewable by everyone"
  ON court_comments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON court_comments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own comments"
  ON court_comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON court_comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);