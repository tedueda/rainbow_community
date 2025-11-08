-- Add new columns to matching_profiles table
-- Run this SQL directly on the PostgreSQL database

-- Check if columns exist before adding
DO $$ 
BEGIN
    -- Add nickname column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matching_profiles' AND column_name = 'nickname'
    ) THEN
        ALTER TABLE matching_profiles ADD COLUMN nickname VARCHAR(100);
    END IF;

    -- Add residence_detail column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matching_profiles' AND column_name = 'residence_detail'
    ) THEN
        ALTER TABLE matching_profiles ADD COLUMN residence_detail VARCHAR(100);
    END IF;

    -- Add hometown column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matching_profiles' AND column_name = 'hometown'
    ) THEN
        ALTER TABLE matching_profiles ADD COLUMN hometown VARCHAR(100);
    END IF;

    -- Add blood_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matching_profiles' AND column_name = 'blood_type'
    ) THEN
        ALTER TABLE matching_profiles ADD COLUMN blood_type VARCHAR(20);
    END IF;

    -- Add zodiac column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'matching_profiles' AND column_name = 'zodiac'
    ) THEN
        ALTER TABLE matching_profiles ADD COLUMN zodiac VARCHAR(20);
    END IF;
END $$;

-- Verify the columns were added
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'matching_profiles' 
  AND column_name IN ('nickname', 'residence_detail', 'hometown', 'blood_type', 'zodiac')
ORDER BY column_name;
