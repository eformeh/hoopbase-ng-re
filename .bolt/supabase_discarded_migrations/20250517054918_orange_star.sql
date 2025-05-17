/*
  # Notifications and User Preferences Schema

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `type` (text)
      - `title` (text)
      - `message` (text)
      - `data` (jsonb)
      - `read` (boolean)
      - `created_at` (timestamp)

    - `user_locations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `latitude` (numeric)
      - `longitude` (numeric)
      - `last_updated` (timestamp)

    - Add notification preferences to profiles table

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}'::jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  last_updated timestamptz DEFAULT now()
);

-- Add notification preferences to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{
  "court_availability": true,
  "game_invitations": true,
  "review_responses": true,
  "nearby_courts": true,
  "event_reminders": true
}'::jsonb;

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_locations ENABLE ROW LEVEL SECURITY;

-- Policies for notifications
CREATE POLICY "Users can view own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for user_locations
CREATE POLICY "Users can view own location"
  ON user_locations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own location"
  ON user_locations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own location"
  ON user_locations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);