

SELECT 'Test 1: Basic table access' as test_name;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as post_count FROM posts;
SELECT COUNT(*) as tag_count FROM tags;
SELECT COUNT(*) as post_tag_count FROM post_tags;

SELECT 'Test 2: Posts by category (expecting 2 posts each)' as test_name;
SELECT t.name as category, COUNT(p.id) as post_count 
FROM tags t 
LEFT JOIN post_tags pt ON t.id = pt.tag_id 
LEFT JOIN posts p ON pt.post_id = p.id 
GROUP BY t.name 
ORDER BY t.name;

SELECT 'Test 3: Sample posts verification' as test_name;
SELECT p.title, t.name as category, p.created_at 
FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
ORDER BY p.created_at DESC 
LIMIT 6;

SELECT 'Test 4: DML permissions test' as test_name;
BEGIN;
INSERT INTO tags (name) VALUES ('test_tag_verify');
SELECT 'INSERT permission: PASS' as result;

UPDATE tags SET name = 'test_tag_verify_updated' WHERE name = 'test_tag_verify';
SELECT 'UPDATE permission: PASS' as result;

DELETE FROM tags WHERE name = 'test_tag_verify_updated';
SELECT 'DELETE permission: PASS' as result;
ROLLBACK;

SELECT 'Test 5: Category filtering test' as test_name;
SELECT 'board' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'board'
UNION ALL
SELECT 'art' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'art'
UNION ALL
SELECT 'music' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'music'
UNION ALL
SELECT 'shops' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'shops'
UNION ALL
SELECT 'tours' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'tours'
UNION ALL
SELECT 'comics' as category, COUNT(*) as post_count FROM posts p 
JOIN post_tags pt ON p.id = pt.post_id 
JOIN tags t ON pt.tag_id = t.id 
WHERE t.name = 'comics'
ORDER BY category;

SELECT 'Test 6: User authentication test' as test_name;
SELECT email, display_name, is_active 
FROM users 
WHERE email = 'tedyueda@gmail.com';

SELECT 'VERIFICATION COMPLETE' as status;
SELECT 'Expected results:' as note;
SELECT '- 3 users (ted, admin, anonymous)' as expectation;
SELECT '- 12 posts total' as expectation;
SELECT '- 6 category tags' as expectation;
SELECT '- 12 post-tag relationships' as expectation;
SELECT '- 2 posts per category' as expectation;
