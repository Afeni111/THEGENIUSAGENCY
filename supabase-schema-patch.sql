-- ================================================================
-- THE GENIUS AGENCY — PATCH SCHEMA (run this if ENUMs already exist)
-- Paste this into a NEW query in Supabase SQL Editor and click Run
-- ================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- ENUMS (safe to re-run — skips if already exists)
-- ================================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('client', 'admin', 'expert');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'new_lead','discussing','offer_sent','payment_pending',
    'in_progress','under_review','delivered','revision',
    'completed','auto_completed','cancelled','refunded'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE offer_status AS ENUM ('draft','sent','accepted','rejected','expired','paid');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE message_type AS ENUM (
    'normal','system','offer','payment','delivery',
    'revision_request','completion','rating_prompt'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending','successful','failed','refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE payment_source AS ENUM ('agency_direct','fiverr','upwork');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('pending','reviewed','delivered','accepted','revision_requested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE file_type AS ENUM ('image','pdf','pptx','video','audio','document','other');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'client',
  full_name TEXT NOT NULL DEFAULT 'New User',
  email TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  phone TEXT,
  country TEXT,
  is_active BOOLEAN DEFAULT true,
  is_blocked BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- EXPERTS
CREATE TABLE IF NOT EXISTS experts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  skills TEXT[],
  location TEXT,
  image_url TEXT,
  upwork_url TEXT,
  fiverr_url TEXT,
  rating NUMERIC(3,1) DEFAULT 5.0,
  total_reviews INT DEFAULT 0,
  total_projects INT DEFAULT 0,
  completed_projects INT DEFAULT 0,
  response_time TEXT,
  availability TEXT DEFAULT 'Available',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROJECTS
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'New Project',
  description TEXT,
  status project_status NOT NULL DEFAULT 'new_lead',
  budget NUMERIC(12,2),
  deadline DATE,
  progress INT DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  payment_status payment_status DEFAULT 'pending',
  payment_source payment_source,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONVERSATIONS
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  admin_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  status project_status NOT NULL DEFAULT 'new_lead',
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  unread_client INT DEFAULT 0,
  unread_admin INT DEFAULT 0,
  unread_expert INT DEFAULT 0,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- MESSAGES
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_role user_role NOT NULL,
  message_type message_type NOT NULL DEFAULT 'normal',
  content TEXT,
  file_url TEXT,
  is_read BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ATTACHMENTS
CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_type file_type NOT NULL DEFAULT 'other',
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- OFFERS
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  delivery_days INT NOT NULL,
  revisions INT DEFAULT 1,
  description TEXT,
  milestones JSONB,
  status offer_status NOT NULL DEFAULT 'draft',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  offer_id UUID REFERENCES offers(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount NUMERIC(12,2) NOT NULL,
  currency TEXT DEFAULT 'NGN',
  source payment_source NOT NULL DEFAULT 'agency_direct',
  status payment_status NOT NULL DEFAULT 'pending',
  transaction_id TEXT,
  paystack_reference TEXT,
  metadata JSONB,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- DELIVERIES
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  submitted_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  delivered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  delivery_message TEXT,
  status delivery_status NOT NULL DEFAULT 'pending',
  expert_notes TEXT,
  admin_notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  delivered_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ
);

-- DELIVERY FILES
CREATE TABLE IF NOT EXISTS delivery_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type file_type DEFAULT 'other',
  file_size BIGINT,
  is_watermarked BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expert_id UUID NOT NULL REFERENCES experts(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  is_auto_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  type TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  actor_role user_role NOT NULL,
  action TEXT NOT NULL,
  reference_id UUID,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- PORTFOLIO
CREATE TABLE IF NOT EXISTS portfolio_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  expert_id UUID REFERENCES experts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  file_url TEXT,
  file_type file_type DEFAULT 'image',
  thumbnail_url TEXT,
  is_watermarked BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TYPING INDICATORS
CREATE TABLE IF NOT EXISTS typing_indicators (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_typing BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);

-- ================================================================
-- FUNCTIONS & TRIGGERS
-- ================================================================

-- Drop old triggers/functions cleanly before recreating
DROP FUNCTION IF EXISTS update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_conversation_on_message() CASCADE;

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME IN ('profiles','projects','conversations','experts','offers') THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated ON profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_projects_updated ON projects;
CREATE TRIGGER trg_projects_updated BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_conversations_updated ON conversations;
CREATE TRIGGER trg_conversations_updated BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_experts_updated ON experts;
CREATE TRIGGER trg_experts_updated BEFORE UPDATE ON experts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS trg_offers_updated ON offers;
CREATE TRIGGER trg_offers_updated BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'New User'),
    NEW.email,
    'client'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update conversation on new message
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations SET
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    updated_at = NOW(),
    unread_admin = CASE WHEN NEW.sender_role != 'admin' THEN unread_admin + 1 ELSE unread_admin END,
    unread_client = CASE WHEN NEW.sender_role != 'client' THEN unread_client + 1 ELSE unread_client END,
    unread_expert = CASE WHEN NEW.sender_role != 'expert' THEN unread_expert + 1 ELSE unread_expert END
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_new_message ON messages;
CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_on_message();

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE typing_indicators ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
DROP POLICY IF EXISTS "Users read own profile" ON profiles;
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Users update own profile" ON profiles;
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admin insert profiles" ON profiles;
CREATE POLICY "Admin insert profiles" ON profiles FOR INSERT WITH CHECK (true);

-- PROJECTS
DROP POLICY IF EXISTS "Clients see own projects" ON projects;
CREATE POLICY "Clients see own projects" ON projects FOR SELECT USING (client_id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admin full project access" ON projects;
CREATE POLICY "Admin full project access" ON projects FOR ALL USING (current_user_role() = 'admin');
DROP POLICY IF EXISTS "Client insert project" ON projects;
CREATE POLICY "Client insert project" ON projects FOR INSERT WITH CHECK (client_id = auth.uid());

-- CONVERSATIONS
DROP POLICY IF EXISTS "Client sees own conversations" ON conversations;
CREATE POLICY "Client sees own conversations" ON conversations FOR SELECT USING (client_id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admin full conversation access" ON conversations;
CREATE POLICY "Admin full conversation access" ON conversations FOR ALL USING (current_user_role() = 'admin');
DROP POLICY IF EXISTS "Client insert conversation" ON conversations;
CREATE POLICY "Client insert conversation" ON conversations FOR INSERT WITH CHECK (client_id = auth.uid());

-- MESSAGES
DROP POLICY IF EXISTS "Conversation participants see messages" ON messages;
CREATE POLICY "Conversation participants see messages" ON messages FOR SELECT
  USING (sender_id = auth.uid() OR EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = messages.conversation_id AND c.client_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));
DROP POLICY IF EXISTS "Participants send messages" ON messages;
CREATE POLICY "Participants send messages" ON messages FOR INSERT WITH CHECK (sender_id = auth.uid());
DROP POLICY IF EXISTS "Admin update messages" ON messages;
CREATE POLICY "Admin update messages" ON messages FOR UPDATE USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- OFFERS
DROP POLICY IF EXISTS "Client sees own offers" ON offers;
CREATE POLICY "Client sees own offers" ON offers FOR SELECT
  USING (current_user_role() = 'admin' OR EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = offers.conversation_id AND c.client_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Admin manages offers" ON offers;
CREATE POLICY "Admin manages offers" ON offers FOR ALL USING (current_user_role() = 'admin');

-- PAYMENTS
DROP POLICY IF EXISTS "Client sees own payments" ON payments;
CREATE POLICY "Client sees own payments" ON payments FOR SELECT USING (client_id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admin manages payments" ON payments;
CREATE POLICY "Admin manages payments" ON payments FOR ALL USING (current_user_role() = 'admin');
DROP POLICY IF EXISTS "Client insert payment" ON payments;
CREATE POLICY "Client insert payment" ON payments FOR INSERT WITH CHECK (client_id = auth.uid());

-- NOTIFICATIONS
DROP POLICY IF EXISTS "Users see own notifications" ON notifications;
CREATE POLICY "Users see own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "Admin insert notifications" ON notifications;
CREATE POLICY "Admin insert notifications" ON notifications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Users update own notifications" ON notifications;
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "Admin sees all logs" ON activity_logs;
CREATE POLICY "Admin sees all logs" ON activity_logs FOR SELECT USING (current_user_role() = 'admin');
DROP POLICY IF EXISTS "System inserts logs" ON activity_logs;
CREATE POLICY "System inserts logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- EXPERTS
DROP POLICY IF EXISTS "Anyone can read experts" ON experts;
CREATE POLICY "Anyone can read experts" ON experts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admin manages experts" ON experts;
CREATE POLICY "Admin manages experts" ON experts FOR ALL USING (current_user_role() = 'admin');

-- PORTFOLIO
DROP POLICY IF EXISTS "Anyone can read published portfolio" ON portfolio_items;
CREATE POLICY "Anyone can read published portfolio" ON portfolio_items FOR SELECT USING (is_published = true OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Admin manages portfolio" ON portfolio_items;
CREATE POLICY "Admin manages portfolio" ON portfolio_items FOR ALL USING (current_user_role() = 'admin');

-- TYPING
DROP POLICY IF EXISTS "Participants manage typing" ON typing_indicators;
CREATE POLICY "Participants manage typing" ON typing_indicators FOR ALL USING (user_id = auth.uid() OR current_user_role() = 'admin');

-- DELIVERIES
DROP POLICY IF EXISTS "Client sees own deliveries" ON deliveries;
CREATE POLICY "Client sees own deliveries" ON deliveries FOR SELECT
  USING (current_user_role() = 'admin' OR EXISTS (
    SELECT 1 FROM conversations c WHERE c.id = deliveries.conversation_id AND c.client_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Admin manages deliveries" ON deliveries;
CREATE POLICY "Admin manages deliveries" ON deliveries FOR ALL USING (current_user_role() = 'admin');

-- ATTACHMENTS
DROP POLICY IF EXISTS "Participants see attachments" ON attachments;
CREATE POLICY "Participants see attachments" ON attachments FOR SELECT
  USING (current_user_role() = 'admin' OR EXISTS (
    SELECT 1 FROM messages m JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = attachments.message_id AND c.client_id = auth.uid()
  ));
DROP POLICY IF EXISTS "Participants insert attachments" ON attachments;
CREATE POLICY "Participants insert attachments" ON attachments FOR INSERT WITH CHECK (true);

-- REVIEWS
DROP POLICY IF EXISTS "Client manages own reviews" ON reviews;
CREATE POLICY "Client manages own reviews" ON reviews FOR ALL USING (client_id = auth.uid() OR current_user_role() = 'admin');
DROP POLICY IF EXISTS "Anyone can read reviews" ON reviews;
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);

-- DELIVERY FILES
DROP POLICY IF EXISTS "Admin manages delivery files" ON delivery_files;
CREATE POLICY "Admin manages delivery files" ON delivery_files FOR ALL USING (current_user_role() = 'admin');
DROP POLICY IF EXISTS "Client sees delivery files" ON delivery_files;
CREATE POLICY "Client sees delivery files" ON delivery_files FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM deliveries d JOIN conversations c ON c.id = d.conversation_id
    WHERE d.id = delivery_files.delivery_id AND c.client_id = auth.uid()
  ));

-- INDEXES skipped (add manually after verifying table columns)
