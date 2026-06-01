-- Migration 006: forge_config for landing-forge Shopify integration
ALTER TABLE landings ADD COLUMN IF NOT EXISTS forge_config JSONB DEFAULT NULL;
