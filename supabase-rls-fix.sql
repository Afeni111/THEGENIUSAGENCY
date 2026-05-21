-- ================================================================
-- THE GENIUS AGENCY — MESSAGING & RLS FIXES (CORRECTED)
-- ================================================================

-- 1. Ensure experts can view their own conversations
-- Check if experts table has profile_id column. If not, we use id.
-- Based on schema: CREATE TABLE experts ( id UUID PRIMARY KEY, profile_id UUID REFERENCES profiles(id) ... )
DROP POLICY IF EXISTS "Expert sees assigned conversations" ON conversations;
CREATE POLICY "Expert sees assigned conversations" ON conversations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM experts e
    WHERE e.id = conversations.expert_id AND e.profile_id = auth.uid()
  ));

-- 2. Ensure experts can view messages in their conversations
DROP POLICY IF EXISTS "Expert sees messages in conversations" ON messages;
CREATE POLICY "Expert sees messages in conversations" ON messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM conversations c
    JOIN experts e ON e.id = c.expert_id
    WHERE c.id = messages.conversation_id AND e.profile_id = auth.uid()
  ));

-- 3. Ensure experts can send messages in their conversations
DROP POLICY IF EXISTS "Expert sends messages in conversations" ON messages;
CREATE POLICY "Expert sends messages in conversations" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() 
    AND EXISTS (
      SELECT 1 FROM conversations c
      JOIN experts e ON e.id = c.expert_id
      WHERE c.id = messages.conversation_id AND e.profile_id = auth.uid()
    )
  );

-- 4. Fix Conversations RLS (Client + Admin + Expert) - Consolidating
DROP POLICY IF EXISTS "Client sees own conversations" ON conversations;
DROP POLICY IF EXISTS "Admin full conversation access" ON conversations;
DROP POLICY IF EXISTS "Users see their conversations" ON conversations;
CREATE POLICY "Users see their conversations" ON conversations FOR SELECT
  USING (
    client_id = auth.uid() 
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM experts e
      WHERE e.id = conversations.expert_id AND e.profile_id = auth.uid()
    )
  );

-- 5. Fix Messages RLS (Client + Admin + Expert) - Consolidating
DROP POLICY IF EXISTS "Conversation participants see messages" ON messages;
DROP POLICY IF EXISTS "Participants see messages" ON messages;
CREATE POLICY "Participants see messages" ON messages FOR SELECT
  USING (
    sender_id = auth.uid()
    OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
    OR EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id 
      AND (
        c.client_id = auth.uid() 
        OR EXISTS (
          SELECT 1 FROM experts e
          WHERE e.id = c.expert_id AND e.profile_id = auth.uid()
        )
      )
    )
  );

-- 6. Ensure sender_id and sender_role are consistent with auth
DROP POLICY IF EXISTS "Participants send messages" ON messages;
CREATE POLICY "Participants send messages" ON messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
      OR EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id 
        AND (
          c.client_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM experts e
            WHERE e.id = c.expert_id AND e.profile_id = auth.uid()
          )
        )
      )
    )
  );
