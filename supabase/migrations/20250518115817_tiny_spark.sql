/*
  # Create favorites table and functions

  1. New Tables
    - `favorite_courts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references users)
      - `court_id` (uuid, references courts)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for user access
*/

-- Create favorites table
CREATE TABLE IF NOT EXISTS favorite_courts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users ON DELETE CASCADE,
  court_id uuid REFERENCES courts ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, court_id)
);

-- Enable RLS
ALTER TABLE favorite_courts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own favorites"
  ON favorite_courts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites"
  ON favorite_courts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own favorites"
  ON favorite_courts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);