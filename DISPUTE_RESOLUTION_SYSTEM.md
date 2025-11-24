# Comprehensive Dispute Resolution System

## Database Schema

Run this SQL in your Supabase SQL editor:

```sql
-- Create disputes table
CREATE TABLE IF NOT EXISTS disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_number TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payout', 'licensing', 'copyright', 'refund', 'other')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'escalated', 'resolved', 'closed')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  complainant_id UUID NOT NULL REFERENCES auth.users(id),
  respondent_id UUID REFERENCES auth.users(id),
  hook_id UUID REFERENCES hooks(id),
  purchase_id UUID REFERENCES purchases(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMPTZ,
  refund_amount DECIMAL(10,2),
  refund_processed BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES auth.users(id),
  escalated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dispute evidence table
CREATE TABLE IF NOT EXISTS dispute_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id),
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dispute messages table
CREATE TABLE IF NOT EXISTS dispute_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create dispute activity log
CREATE TABLE IF NOT EXISTS dispute_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispute_id UUID NOT NULL REFERENCES disputes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_disputes_complainant ON disputes(complainant_id);
CREATE INDEX idx_disputes_respondent ON disputes(respondent_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_type ON disputes(type);
CREATE INDEX idx_dispute_evidence_dispute ON dispute_evidence(dispute_id);
CREATE INDEX idx_dispute_messages_dispute ON dispute_messages(dispute_id);
CREATE INDEX idx_dispute_activity_dispute ON dispute_activity(dispute_id);

-- Enable RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispute_activity ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their disputes" ON disputes
  FOR SELECT USING (auth.uid() = complainant_id OR auth.uid() = respondent_id OR auth.uid() = assigned_to);

CREATE POLICY "Users can create disputes" ON disputes
  FOR INSERT WITH CHECK (auth.uid() = complainant_id);

CREATE POLICY "Users can view evidence" ON dispute_evidence
  FOR SELECT USING (EXISTS (SELECT 1 FROM disputes WHERE id = dispute_id AND (complainant_id = auth.uid() OR respondent_id = auth.uid())));

CREATE POLICY "Users can upload evidence" ON dispute_evidence
  FOR INSERT WITH CHECK (uploaded_by = auth.uid());

CREATE POLICY "Users can view messages" ON dispute_messages
  FOR SELECT USING (EXISTS (SELECT 1 FROM disputes WHERE id = dispute_id AND (complainant_id = auth.uid() OR respondent_id = auth.uid())));

CREATE POLICY "Users can send messages" ON dispute_messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());
```

## Edge Functions

See DISPUTE_EDGE_FUNCTIONS.md for complete edge function code.

## Features

- Ticket creation with evidence upload
- Real-time messaging between parties
- Admin review dashboard
- Automated notifications
- Escalation workflows
- Resolution tracking with refund processing
- Activity logging
- Multi-currency support
