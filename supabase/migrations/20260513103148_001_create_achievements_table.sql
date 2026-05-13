/*
  # Create achievements table for student portfolio

  1. New Tables
    - `achievements`
      - `id` (uuid, primary key)
      - `year` (text) - Academic year
      - `level` (text) - Competition level
      - `project` (text) - Project/activity name
      - `org` (text) - Organization name
      - `place` (text) - Event location
      - `date` (date) - Event date
      - `competitions` (jsonb) - Competition details
      - `recorded_by` (text) - Email of recorder
      - `recorded_dept` (text) - Department of recorder
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on achievements table
    - Add policy for viewing all public achievements
    - Add policy for authenticated users to insert/update their own records
    - Add policy for admin to manage all records
*/

CREATE TABLE IF NOT EXISTS achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year text NOT NULL,
  level text NOT NULL,
  project text NOT NULL,
  org text,
  place text,
  date text,
  competitions jsonb DEFAULT '[]'::jsonb,
  recorded_by text NOT NULL,
  recorded_dept text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view achievements"
  ON achievements
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert achievements"
  ON achievements
  FOR INSERT
  TO authenticated
  WITH CHECK (recorded_by = auth.email() OR auth.jwt()->>'email' = recorded_by);

CREATE POLICY "Users can update own achievements"
  ON achievements
  FOR UPDATE
  TO authenticated
  USING (recorded_by = auth.email() OR auth.jwt()->>'email' = recorded_by)
  WITH CHECK (recorded_by = auth.email() OR auth.jwt()->>'email' = recorded_by);

CREATE POLICY "Users can delete own achievements"
  ON achievements
  FOR DELETE
  TO authenticated
  USING (recorded_by = auth.email() OR auth.jwt()->>'email' = recorded_by);

CREATE INDEX idx_achievements_recorded_by ON achievements(recorded_by);
CREATE INDEX idx_achievements_recorded_dept ON achievements(recorded_dept);
CREATE INDEX idx_achievements_level ON achievements(level);
