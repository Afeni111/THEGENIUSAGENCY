-- ================================================================
-- THE GENIUS AGENCY — REALTIME NOTIFICATION TRIGGERS
-- ================================================================

-- 1. Function to handle new messages
CREATE OR REPLACE FUNCTION handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    v_recipient_id UUID;
    v_sender_name TEXT;
    v_convo_client_id UUID;
    v_convo_expert_id UUID;
    v_convo_admin_id UUID;
BEGIN
    -- Get conversation details
    SELECT client_id, expert_id, admin_id INTO v_convo_client_id, v_convo_expert_id, v_convo_admin_id
    FROM conversations WHERE id = NEW.conversation_id;

    -- Get sender name
    SELECT full_name INTO v_sender_name FROM profiles WHERE id = NEW.sender_id;

    -- Determine recipient
    IF NEW.sender_role = 'client' THEN
        -- Notify expert if assigned, else admin
        v_recipient_id := COALESCE(v_convo_expert_id, v_convo_admin_id);
    ELSE
        -- Admin/Expert sent, notify client
        v_recipient_id := v_convo_client_id;
    END IF;

    -- Insert notification if recipient is not sender and not null
    IF v_recipient_id IS NOT NULL AND v_recipient_id != NEW.sender_id THEN
        INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            v_recipient_id,
            'New Message from ' || COALESCE(v_sender_name, 'The Genius Agency'),
            CASE 
                WHEN NEW.message_type = 'normal' THEN LEFT(NEW.content, 100)
                WHEN NEW.message_type = 'offer' THEN 'You received a new offer.'
                WHEN NEW.message_type = 'delivery' THEN 'Work has been delivered.'
                ELSE 'System update received.'
            END,
            'new_message',
            NEW.conversation_id,
            'conversation'
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Trigger for messages
DROP TRIGGER IF EXISTS tr_new_message_notif ON messages;
CREATE TRIGGER tr_new_message_notif
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION handle_new_message_notification();

-- 3. Function to handle conversation status updates
CREATE OR REPLACE FUNCTION handle_conversation_status_notification()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        -- Notify client of status change
        INSERT INTO notifications (user_id, title, body, type, reference_id, reference_type)
        VALUES (
            NEW.client_id,
            'Project Status Updated',
            'Your project status is now: ' || NEW.status,
            'status_update',
            NEW.id,
            'conversation'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger for conversations
DROP TRIGGER IF EXISTS tr_convo_status_notif ON conversations;
CREATE TRIGGER tr_convo_status_notif
AFTER UPDATE OF status ON conversations
FOR EACH ROW EXECUTE FUNCTION handle_conversation_status_notification();

-- 5. Enable Realtime for notifications table if not already
ALTER TABLE notifications REPLICA IDENTITY FULL;

-- Ensure it's in the realtime publication
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'notifications'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END $$;
