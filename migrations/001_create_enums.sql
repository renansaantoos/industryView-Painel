-- =============================================================================
-- INDUSTRYVIEW DATABASE MIGRATION
-- File: 001_create_enums.sql
-- Description: Custom ENUM types for the IndustryView database
-- Author: DBA Migration Agent
-- Date: 2026-02-05
-- =============================================================================

-- Drop existing types if they exist (for clean migration)
DROP TYPE IF EXISTS payment_status_enum CASCADE;
DROP TYPE IF EXISTS inventory_log_type_enum CASCADE;

-- =============================================================================
-- ENUM: payment_status_enum
-- Description: Payment status for subscriptions
-- =============================================================================
CREATE TYPE payment_status_enum AS ENUM (
    'pending',
    'paid',
    'failed',
    'refunded',
    'canceled'
);
COMMENT ON TYPE payment_status_enum IS 'Status of payment transactions';

-- =============================================================================
-- ENUM: inventory_log_type_enum
-- Description: Type of inventory movement (entry or exit)
-- Note: Original Xano uses boolean for this - converting to proper enum
-- =============================================================================
CREATE TYPE inventory_log_type_enum AS ENUM (
    'entry',
    'exit'
);
COMMENT ON TYPE inventory_log_type_enum IS 'Type of inventory movement - entry (addition) or exit (removal)';

-- =============================================================================
-- FUNCTION: update_updated_at_column()
-- Description: Trigger function to automatically update updated_at timestamp
-- =============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function to automatically set updated_at to current timestamp on row update';

-- =============================================================================
-- FUNCTION: generate_normalized_text()
-- Description: Normalize text by removing accents and converting to lowercase
-- =============================================================================
CREATE OR REPLACE FUNCTION normalize_text(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(
        TRANSLATE(
            input_text,
            'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ',
            'AAAAAAACEEEEIIIIDNOOOOOOUUUUYBsaaaaaaaceeeeiiiidnoooooouuuuyby'
        )
    );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION normalize_text(TEXT) IS 'Normalizes text by removing diacritics and converting to lowercase for search purposes';

-- =============================================================================
-- EXTENSION: pg_trgm for text search
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;

COMMENT ON EXTENSION pg_trgm IS 'Text similarity measurement and index searching based on trigrams';
COMMENT ON EXTENSION unaccent IS 'Text search dictionary that removes accents';
