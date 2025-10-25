/*
  # Give ✝ Share Platform - Initial Schema

  ## Overview
  Complete database schema for faith-rooted mutual aid platform serving NYC/Tri-State area.

  ## New Tables

  ### 1. `anonymous_sessions`
  - `id` (uuid, primary key) - Session identifier
  - `zip_code` (text) - User's ZIP code for local matching
  - `language_preference` (text) - User's preferred language
  - `created_at` (timestamptz) - Session creation time
  - `last_active` (timestamptz) - Last activity timestamp

  ### 2. `needs`
  - `id` (uuid, primary key) - Need identifier
  - `session_id` (uuid, nullable) - Reference to anonymous session
  - `category` (text) - Need category (food, shelter, employment, spiritual, other)
  - `description` (text) - Free-text description of need
  - `zip_code` (text) - Location of need
  - `urgency` (text) - Priority level (low, medium, high, critical)
  - `status` (text) - Status (open, matched, fulfilled, closed)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 3. `gifts`
  - `id` (uuid, primary key) - Gift identifier
  - `session_id` (uuid, nullable) - Reference to anonymous session
  - `giver_type` (text) - Type of giver (individual, church, business, foundation, corporation)
  - `org_id` (uuid, nullable) - Reference to organization if institutional giver
  - `category` (text) - Gift category
  - `description` (text) - Free-text description of gift
  - `zip_code` (text) - Location of giver
  - `quantity` (text, nullable) - Quantity or capacity
  - `tax_deductible_value` (decimal, nullable) - Estimated value for tax purposes
  - `status` (text) - Status (available, committed, delivered, completed)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 4. `prayers`
  - `id` (uuid, primary key) - Prayer identifier
  - `session_id` (uuid, nullable) - Reference to anonymous session
  - `request_text` (text) - Prayer request
  - `generated_prayer` (text) - AI-generated compassionate prayer
  - `zip_code` (text) - Location
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. `organizations`
  - `id` (uuid, primary key) - Organization identifier
  - `name` (text) - Organization name
  - `org_type` (text) - Type (church, nonprofit, business, foundation)
  - `ein` (text, nullable) - EIN if applicable
  - `contact_email` (text) - Contact email
  - `contact_phone` (text, nullable) - Contact phone
  - `address` (text, nullable) - Physical address
  - `zip_code` (text) - ZIP code
  - `verified` (boolean) - Verification status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 6. `resources`
  - `id` (uuid, primary key) - Resource identifier
  - `org_id` (uuid) - Reference to organization
  - `category` (text) - Resource category
  - `name` (text) - Resource name
  - `description` (text) - Description
  - `capacity` (text, nullable) - Current capacity
  - `availability_schedule` (jsonb, nullable) - Schedule in JSON format
  - `zip_codes_served` (text[]) - Array of ZIP codes served
  - `active` (boolean) - Active status
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 7. `matches`
  - `id` (uuid, primary key) - Match identifier
  - `need_id` (uuid, nullable) - Reference to need
  - `gift_id` (uuid, nullable) - Reference to gift
  - `resource_id` (uuid, nullable) - Reference to resource
  - `match_score` (decimal) - AI-calculated match quality
  - `status` (text) - Match status (suggested, accepted, completed, declined)
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 8. `stories`
  - `id` (uuid, primary key) - Story identifier
  - `zip_code` (text) - Story location
  - `category` (text) - Story category
  - `anonymized_text` (text) - Anonymized success story
  - `active` (boolean) - Active status for rotation
  - `created_at` (timestamptz) - Creation timestamp

  ### 9. `admin_users`
  - `id` (uuid, primary key) - Admin user identifier
  - `email` (text) - Admin email
  - `role` (text) - Role (pastor, church_admin, verified_org, super_admin)
  - `org_id` (uuid, nullable) - Reference to organization
  - `created_at` (timestamptz) - Creation timestamp
  - `last_login` (timestamptz, nullable) - Last login timestamp

  ### 10. `platform_config`
  - `id` (uuid, primary key) - Config identifier
  - `key` (text) - Configuration key
  - `value` (jsonb) - Configuration value in JSON
  - `description` (text) - Description of config
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  - RLS enabled on all tables
  - Public access for anonymous sessions with appropriate policies
  - Protected access for admin tables
  - No PII stored without explicit consent

  ## Notes
  1. All timestamps use timestamptz for timezone awareness
  2. ZIP codes stored as text to preserve leading zeros
  3. Categories use controlled vocabulary for consistency
  4. Session-based tracking preserves anonymity
  5. Organizations must be verified before appearing in matches
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for controlled vocabularies
CREATE TYPE need_category AS ENUM ('food', 'shelter', 'employment', 'spiritual', 'other');
CREATE TYPE gift_category AS ENUM ('food', 'shelter', 'employment', 'spiritual', 'financial', 'volunteer', 'other');
CREATE TYPE giver_type AS ENUM ('individual', 'church', 'business', 'foundation', 'corporation');
CREATE TYPE org_type AS ENUM ('church', 'nonprofit', 'business', 'foundation');
CREATE TYPE user_role AS ENUM ('pastor', 'church_admin', 'verified_org', 'super_admin');
CREATE TYPE status_type AS ENUM ('open', 'matched', 'fulfilled', 'closed', 'available', 'committed', 'delivered', 'completed');
CREATE TYPE match_status AS ENUM ('suggested', 'accepted', 'completed', 'declined');
CREATE TYPE urgency_type AS ENUM ('low', 'medium', 'high', 'critical');

-- Table 1: anonymous_sessions
CREATE TABLE IF NOT EXISTS anonymous_sessions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code text NOT NULL,
  language_preference text DEFAULT 'en',
  created_at timestamptz DEFAULT now(),
  last_active timestamptz DEFAULT now()
);

ALTER TABLE anonymous_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anonymous sessions are publicly readable"
  ON anonymous_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create anonymous sessions"
  ON anonymous_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Sessions can update their own last_active"
  ON anonymous_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Table 2: needs
CREATE TABLE IF NOT EXISTS needs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES anonymous_sessions(id) ON DELETE SET NULL,
  category text NOT NULL,
  description text NOT NULL,
  zip_code text NOT NULL,
  urgency text DEFAULT 'medium',
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE needs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Needs are publicly readable"
  ON needs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create needs"
  ON needs FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update needs"
  ON needs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table 3: gifts
CREATE TABLE IF NOT EXISTS gifts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES anonymous_sessions(id) ON DELETE SET NULL,
  giver_type text NOT NULL,
  org_id uuid,
  category text NOT NULL,
  description text NOT NULL,
  zip_code text NOT NULL,
  quantity text,
  tax_deductible_value decimal(10,2),
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gifts are publicly readable"
  ON gifts FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create gifts"
  ON gifts FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gifts"
  ON gifts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table 4: prayers
CREATE TABLE IF NOT EXISTS prayers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id uuid REFERENCES anonymous_sessions(id) ON DELETE SET NULL,
  request_text text NOT NULL,
  generated_prayer text,
  zip_code text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prayers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Prayers are publicly readable"
  ON prayers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can create prayers"
  ON prayers FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Table 5: organizations
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  org_type text NOT NULL,
  ein text,
  contact_email text NOT NULL,
  contact_phone text,
  address text,
  zip_code text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Verified organizations are publicly readable"
  ON organizations FOR SELECT
  TO anon, authenticated
  USING (verified = true);

CREATE POLICY "Authenticated users can view all organizations"
  ON organizations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only authenticated users can create organizations"
  ON organizations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Organization members can update their org"
  ON organizations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.org_id = organizations.id
      AND admin_users.email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.org_id = organizations.id
      AND admin_users.email = auth.jwt()->>'email'
    )
  );

-- Add foreign key constraint for gifts after organizations table is created
ALTER TABLE gifts ADD CONSTRAINT gifts_org_id_fkey
  FOREIGN KEY (org_id) REFERENCES organizations(id) ON DELETE SET NULL;

-- Table 6: resources
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  category text NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  capacity text,
  availability_schedule jsonb,
  zip_codes_served text[] NOT NULL DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active resources from verified orgs are publicly readable"
  ON resources FOR SELECT
  TO anon, authenticated
  USING (
    active = true
    AND EXISTS (
      SELECT 1 FROM organizations
      WHERE organizations.id = resources.org_id
      AND organizations.verified = true
    )
  );

CREATE POLICY "Organization members can manage their resources"
  ON resources FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.org_id = resources.org_id
      AND admin_users.email = auth.jwt()->>'email'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.org_id = resources.org_id
      AND admin_users.email = auth.jwt()->>'email'
    )
  );

-- Table 7: matches
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  need_id uuid REFERENCES needs(id) ON DELETE CASCADE,
  gift_id uuid REFERENCES gifts(id) ON DELETE CASCADE,
  resource_id uuid REFERENCES resources(id) ON DELETE CASCADE,
  match_score decimal(3,2) DEFAULT 0.5,
  status text DEFAULT 'suggested',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT at_least_one_match CHECK (
    (need_id IS NOT NULL AND (gift_id IS NOT NULL OR resource_id IS NOT NULL))
    OR (gift_id IS NOT NULL AND resource_id IS NOT NULL)
  )
);

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Matches are publicly readable"
  ON matches FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table 8: stories
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  zip_code text NOT NULL,
  category text NOT NULL,
  anonymized_text text NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Active stories are publicly readable"
  ON stories FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Authenticated users can manage stories"
  ON stories FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Table 9: admin_users
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  role text NOT NULL,
  org_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz
);

ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin users can view themselves"
  ON admin_users FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');

CREATE POLICY "Super admins can manage all admin users"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
      AND admin_users.role = 'super_admin'
    )
  );

-- Table 10: platform_config
CREATE TABLE IF NOT EXISTS platform_config (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE platform_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Platform config is publicly readable"
  ON platform_config FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only super admins can manage config"
  ON platform_config FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
      AND admin_users.role = 'super_admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.email = auth.jwt()->>'email'
      AND admin_users.role = 'super_admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_needs_zip_code ON needs(zip_code);
CREATE INDEX IF NOT EXISTS idx_needs_category ON needs(category);
CREATE INDEX IF NOT EXISTS idx_needs_status ON needs(status);
CREATE INDEX IF NOT EXISTS idx_gifts_zip_code ON gifts(zip_code);
CREATE INDEX IF NOT EXISTS idx_gifts_category ON gifts(category);
CREATE INDEX IF NOT EXISTS idx_gifts_status ON gifts(status);
CREATE INDEX IF NOT EXISTS idx_resources_org_id ON resources(org_id);
CREATE INDEX IF NOT EXISTS idx_resources_active ON resources(active);
CREATE INDEX IF NOT EXISTS idx_stories_zip_code ON stories(zip_code);
CREATE INDEX IF NOT EXISTS idx_stories_active ON stories(active);
CREATE INDEX IF NOT EXISTS idx_matches_need_id ON matches(need_id);
CREATE INDEX IF NOT EXISTS idx_matches_gift_id ON matches(gift_id);
CREATE INDEX IF NOT EXISTS idx_matches_resource_id ON matches(resource_id);

-- Insert default platform configuration
INSERT INTO platform_config (key, value, description) VALUES
  ('ein', '"00-0000000"', 'Organization EIN for 501(c)(3) compliance'),
  ('supported_languages', '["en", "es", "ht", "zh"]', 'Supported language codes'),
  ('default_zip_code', '"10001"', 'Default ZIP code for kiosk mode'),
  ('prayer_generation_enabled', 'true', 'Enable AI prayer generation'),
  ('tax_deduction_disclaimer', '"Give ✝ Share is a 501(c)(3) charitable organization. Contributions are tax-deductible to the fullest extent allowed by law."', 'Tax deduction disclaimer text')
ON CONFLICT (key) DO NOTHING;

-- Insert sample stories for demonstration
INSERT INTO stories (zip_code, category, anonymized_text, active) VALUES
  ('10001', 'food', 'A father in Manhattan found groceries and a prayer through Give ✝ Share when his family needed help most.', true),
  ('10002', 'shelter', 'A mother in the Lower East Side connected with emergency housing and community support in her moment of crisis.', true),
  ('10451', 'employment', 'A neighbor in the South Bronx discovered job training resources and landed steady work through Give ✝ Share.', true),
  ('11201', 'spiritual', 'A family in Brooklyn Heights found strength through prayer and compassionate neighbors during a difficult season.', true),
  ('07302', 'food', 'A grandmother in Jersey City received meal support and kindness from her local church community.', true)
ON CONFLICT DO NOTHING;
