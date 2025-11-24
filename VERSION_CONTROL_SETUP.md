# Hook Version Control System

Complete version control system for managing multiple versions of hooks with licensing and bundle options.

## Database Setup

Run these SQL queries in Supabase SQL Editor:

```sql
-- Create hook_versions table
CREATE TABLE IF NOT EXISTS hook_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  version_type TEXT NOT NULL,
  version_number TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  waveform_data JSONB,
  duration INTEGER NOT NULL,
  file_size INTEGER,
  price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(hook_id, version_type)
);

-- Create version_purchases table
CREATE TABLE IF NOT EXISTS version_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID REFERENCES purchases(id) ON DELETE CASCADE,
  version_id UUID NOT NULL REFERENCES hook_versions(id) ON DELETE CASCADE,
  price_paid DECIMAL(10, 2) NOT NULL,
  license_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create version_bundles table
CREATE TABLE IF NOT EXISTS version_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hook_id UUID NOT NULL REFERENCES hooks(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  version_ids UUID[] NOT NULL,
  bundle_price DECIMAL(10, 2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_hook_versions_hook_id ON hook_versions(hook_id);
CREATE INDEX idx_version_purchases_version_id ON version_purchases(version_id);
CREATE INDEX idx_version_bundles_hook_id ON version_bundles(hook_id);

-- Enable RLS
ALTER TABLE hook_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE version_bundles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "view_active_versions" ON hook_versions FOR SELECT USING (is_active = true);
CREATE POLICY "manage_own_versions" ON hook_versions FOR ALL USING (
  hook_id IN (SELECT id FROM hooks WHERE producer_id = auth.uid())
);

CREATE POLICY "view_own_purchases" ON version_purchases FOR SELECT USING (
  purchase_id IN (SELECT id FROM purchases WHERE buyer_id = auth.uid())
);

CREATE POLICY "view_active_bundles" ON version_bundles FOR SELECT USING (is_active = true);
CREATE POLICY "manage_own_bundles" ON version_bundles FOR ALL USING (
  hook_id IN (SELECT id FROM hooks WHERE producer_id = auth.uid())
);
```

## Version Types

- **Original**: Main version of the hook
- **Radio Edit**: Clean/shortened version for radio
- **Extended**: Longer version with additional sections
- **Instrumental**: Version without vocals
- **Acapella**: Vocals only version
- **Stems**: Individual track stems for mixing

## Features

### For Producers
- Upload multiple versions of each hook
- Set individual pricing for each version
- Create bundles with discounts
- Compare versions side-by-side
- Track version sales analytics
- Manage version availability

### For Buyers
- Preview all available versions
- Compare versions with waveform visualization
- Purchase individual versions or bundles
- Save money with bundle discounts
- Download purchased versions

## Usage

### Producer Dashboard
Navigate to Profile > My Hooks > Select Hook > Version Control tab

### Buyer Experience
Browse hooks > View Details > Select Versions tab > Choose versions or bundles

## Edge Function

Create `create-version-checkout` edge function for handling version purchases with Stripe integration.
