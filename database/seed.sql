

INSERT INTO orientations (name) VALUES 
    ('unspecified'),
    ('heterosexual'),
    ('gay'),
    ('lesbian'),
    ('bisexual'),
    ('pansexual'),
    ('asexual'),
    ('demisexual'),
    ('queer'),
    ('questioning')
ON CONFLICT (name) DO NOTHING;

INSERT INTO genders (name) VALUES 
    ('unspecified'),
    ('male'),
    ('female'),
    ('non-binary'),
    ('genderfluid'),
    ('agender'),
    ('transgender'),
    ('genderqueer'),
    ('two-spirit'),
    ('other')
ON CONFLICT (name) DO NOTHING;

INSERT INTO pronouns (name) VALUES 
    ('unspecified'),
    ('he/him'),
    ('she/her'),
    ('they/them'),
    ('xe/xir'),
    ('ze/zir'),
    ('it/its'),
    ('any pronouns'),
    ('ask me'),
    ('no pronouns')
ON CONFLICT (name) DO NOTHING;

INSERT INTO tags (name) VALUES 
    ('board'),
    ('art'), 
    ('music'),
    ('shops'),
    ('tours'),
    ('comics')
ON CONFLICT (name) DO NOTHING;


-- Posts and post_tags will be created by separate script after users are created
-- See create_postgresql_data.py for post and post_tags creation

INSERT INTO awards (name, description, threshold_points, prize_amount_yen) VALUES 
    ('Welcome Member', 'First steps in our community', 10, 0),
    ('Active Contributor', 'Regular participation and engagement', 100, 500),
    ('Community Builder', 'Helping others and fostering connections', 500, 2000),
    ('Content Creator', 'Sharing valuable content and creativity', 1000, 5000),
    ('Community Champion', 'Outstanding leadership and support', 2500, 10000),
    ('LGBTQ+ Advocate', 'Promoting awareness and positive change', 5000, 20000)
ON CONFLICT (name) DO NOTHING;

INSERT INTO content_items (item_type, title, creator, release_year) VALUES 
    ('book', 'Call Me By Your Name', 'André Aciman', 2007),
    ('movie', 'Moonlight', 'Barry Jenkins', 2016),
    ('drama', 'Pose', 'Ryan Murphy', 2018),
    ('comic', 'The Prince and the Dressmaker', 'Jen Wang', 2018),
    ('book', 'Red: A Crayon''s Story', 'Michael Hall', 2015),
    ('movie', 'Love, Simon', 'Greg Berlanti', 2018)
ON CONFLICT DO NOTHING;
