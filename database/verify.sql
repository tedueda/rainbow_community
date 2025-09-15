
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Table users does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Table profiles does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
        RAISE EXCEPTION 'Table posts does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'comments') THEN
        RAISE EXCEPTION 'Table comments does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'reactions') THEN
        RAISE EXCEPTION 'Table reactions does not exist';
    END IF;
    
    RAISE NOTICE 'PASS: All required tables exist';
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_posts_user_created') THEN
        RAISE EXCEPTION 'Index idx_posts_user_created does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_comments_post_created') THEN
        RAISE EXCEPTION 'Index idx_comments_post_created does not exist';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_user_read_created') THEN
        RAISE EXCEPTION 'Index idx_notifications_user_read_created does not exist';
    END IF;
    
    RAISE NOTICE 'PASS: Required indexes exist';
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM orientations WHERE name = 'unspecified') THEN
        RAISE EXCEPTION 'Default orientation data missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM genders WHERE name = 'unspecified') THEN
        RAISE EXCEPTION 'Default gender data missing';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pronouns WHERE name = 'unspecified') THEN
        RAISE EXCEPTION 'Default pronoun data missing';
    END IF;
    
    RAISE NOTICE 'PASS: Reference data exists';
END $$;

DO $$
DECLARE
    test_user_id INTEGER;
    test_post_id INTEGER;
    test_comment_id INTEGER;
BEGIN
    INSERT INTO users (email, password_hash, display_name) 
    VALUES ('test@example.com', 'hashed_password', 'Test User')
    RETURNING id INTO test_user_id;
    
    INSERT INTO profiles (user_id, handle, bio) 
    VALUES (test_user_id, 'testuser', 'Test bio');
    
    INSERT INTO posts (user_id, title, body, visibility) 
    VALUES (test_user_id, 'Test Post', 'This is a test post', 'public')
    RETURNING id INTO test_post_id;
    
    INSERT INTO comments (post_id, user_id, body) 
    VALUES (test_post_id, test_user_id, 'Test comment')
    RETURNING id INTO test_comment_id;
    
    INSERT INTO reactions (user_id, target_type, target_id, reaction_type) 
    VALUES (test_user_id, 'post', test_post_id, 'like');
    
    INSERT INTO point_events (user_id, event_type, points, ref_type, ref_id) 
    VALUES (test_user_id, 'post_created', 10, 'post', test_post_id);
    
    RAISE NOTICE 'PASS: DML operations successful';
    
    DELETE FROM point_events WHERE user_id = test_user_id;
    DELETE FROM reactions WHERE user_id = test_user_id;
    DELETE FROM comments WHERE id = test_comment_id;
    DELETE FROM posts WHERE id = test_post_id;
    DELETE FROM profiles WHERE user_id = test_user_id;
    DELETE FROM users WHERE id = test_user_id;
END $$;

DO $$
DECLARE
    test_user_id INTEGER;
    constraint_violated BOOLEAN := FALSE;
BEGIN
    INSERT INTO users (email, password_hash, display_name) 
    VALUES ('constraint_test@example.com', 'hashed_password', 'Constraint Test User')
    RETURNING id INTO test_user_id;
    
    INSERT INTO profiles (user_id, handle) 
    VALUES (test_user_id, 'constrainttest');
    
    BEGIN
        INSERT INTO posts (user_id, title, body, visibility) 
        VALUES (test_user_id, 'Test', 'Test body', 'invalid_visibility');
        RAISE EXCEPTION 'CHECK constraint should have prevented invalid visibility';
    EXCEPTION
        WHEN check_violation THEN
            constraint_violated := TRUE;
    END;
    
    IF NOT constraint_violated THEN
        RAISE EXCEPTION 'Post visibility CHECK constraint not working';
    END IF;
    
    constraint_violated := FALSE;
    
    BEGIN
        INSERT INTO reactions (user_id, target_type, target_id, reaction_type) 
        VALUES (test_user_id, 'post', 1, 'invalid_reaction');
        RAISE EXCEPTION 'CHECK constraint should have prevented invalid reaction type';
    EXCEPTION
        WHEN check_violation THEN
            constraint_violated := TRUE;
    END;
    
    IF NOT constraint_violated THEN
        RAISE EXCEPTION 'Reaction type CHECK constraint not working';
    END IF;
    
    constraint_violated := FALSE;
    
    BEGIN
        INSERT INTO follows (follower_user_id, followee_user_id, status) 
        VALUES (test_user_id, test_user_id + 1, 'invalid_status');
        RAISE EXCEPTION 'CHECK constraint should have prevented invalid follow status';
    EXCEPTION
        WHEN check_violation THEN
            constraint_violated := TRUE;
    END;
    
    IF NOT constraint_violated THEN
        RAISE EXCEPTION 'Follow status CHECK constraint not working';
    END IF;
    
    RAISE NOTICE 'PASS: CHECK constraints working correctly';
    
    DELETE FROM profiles WHERE user_id = test_user_id;
    DELETE FROM users WHERE id = test_user_id;
END $$;

DO $$
DECLARE
    test_user_id INTEGER;
    constraint_violated BOOLEAN := FALSE;
BEGIN
    INSERT INTO users (email, password_hash, display_name) 
    VALUES ('unique_test@example.com', 'hashed_password', 'Unique Test User')
    RETURNING id INTO test_user_id;
    
    BEGIN
        INSERT INTO users (email, password_hash, display_name) 
        VALUES ('unique_test@example.com', 'hashed_password', 'Duplicate User');
        RAISE EXCEPTION 'UNIQUE constraint should have prevented duplicate email';
    EXCEPTION
        WHEN unique_violation THEN
            constraint_violated := TRUE;
    END;
    
    IF NOT constraint_violated THEN
        RAISE EXCEPTION 'Email UNIQUE constraint not working';
    END IF;
    
    RAISE NOTICE 'PASS: UNIQUE constraints working correctly';
    
    DELETE FROM users WHERE id = test_user_id;
END $$;

DO $$
DECLARE
    ddl_blocked BOOLEAN := FALSE;
BEGIN
    BEGIN
        EXECUTE 'CREATE TABLE test_ddl_table (id INTEGER)';
        RAISE EXCEPTION 'DDL operation should have been blocked for app_user';
    EXCEPTION
        WHEN insufficient_privilege THEN
            ddl_blocked := TRUE;
    END;
    
    IF NOT ddl_blocked THEN
        RAISE EXCEPTION 'app_user should not be able to perform DDL operations';
    END IF;
    
    RAISE NOTICE 'PASS: DDL operations correctly blocked for app_user';
END $$;

DO $$
DECLARE
    test_user_id INTEGER;
    fk_violated BOOLEAN := FALSE;
BEGIN
    INSERT INTO users (email, password_hash, display_name) 
    VALUES ('fk_test@example.com', 'hashed_password', 'FK Test User')
    RETURNING id INTO test_user_id;
    
    BEGIN
        INSERT INTO posts (user_id, title, body) 
        VALUES (99999, 'Test Post', 'This should fail');
        RAISE EXCEPTION 'Foreign key constraint should have prevented invalid user_id';
    EXCEPTION
        WHEN foreign_key_violation THEN
            fk_violated := TRUE;
    END;
    
    IF NOT fk_violated THEN
        RAISE EXCEPTION 'Foreign key constraint not working';
    END IF;
    
    RAISE NOTICE 'PASS: Foreign key constraints working correctly';
    
    DELETE FROM users WHERE id = test_user_id;
END $$;

DO $$
BEGIN
    RAISE NOTICE '=== ALL TESTS PASSED ===';
    RAISE NOTICE 'Database schema verification completed successfully';
    RAISE NOTICE 'app_user permissions are correctly configured';
END $$;
