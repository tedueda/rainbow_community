#!/usr/bin/env python3
"""
Add new columns to matching_profiles table
This script bypasses Alembic due to permission issues
"""
import os
import sys
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print("❌ DATABASE_URL not found in environment")
    sys.exit(1)

print(f"🔗 Connecting to database...")
print(f"   {DATABASE_URL.split('@')[1] if '@' in DATABASE_URL else 'local'}")

try:
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Start transaction
        trans = conn.begin()
        
        try:
            # Read SQL file
            with open('add_profile_columns.sql', 'r') as f:
                sql = f.read()
            
            print("\n📝 Executing SQL migration...")
            
            # Execute the SQL
            result = conn.execute(text(sql))
            
            # Fetch verification results
            rows = result.fetchall()
            
            print("\n✅ Migration completed successfully!")
            print("\n📊 Added columns:")
            print("-" * 60)
            for row in rows:
                col_name, data_type, max_length = row
                length_str = f"({max_length})" if max_length else ""
                print(f"  • {col_name:<20} {data_type}{length_str}")
            print("-" * 60)
            
            # Commit transaction
            trans.commit()
            print("\n✅ Transaction committed")
            
        except Exception as e:
            trans.rollback()
            print(f"\n❌ Error during migration: {e}")
            raise
            
except Exception as e:
    print(f"\n❌ Database connection error: {e}")
    sys.exit(1)

print("\n🎉 All done!")
