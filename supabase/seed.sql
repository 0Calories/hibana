  insert into auth.users (id, email, encrypted_password, email_confirmed_at)
  values (
    '11111111-1111-1111-1111-111111111111',
    'ember@hibana.com',
    crypt('ember', gen_salt('bf')),
    now()
  );

  -- Test flames
  insert into flames (user_id, name, tracking_type, is_daily)
  values
    ('11111111-1111-1111-1111-111111111111', 'Meditation', 'time', true),
    ('11111111-1111-1111-1111-111111111111', 'Exercise', 'time', false),
    ('11111111-1111-1111-1111-111111111111', 'Read', 'count', true);

  -- Test user state 
  insert into user_state (user_id, sparks_balance)
  values ('11111111-1111-1111-1111-111111111111', 42069);

  -- Sample items
  insert into items (id, name, description, type, cost_sparks) values
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Sticky Note Pack', 'Open to get sticky notes to post on your wall', 'item', 100);

  -- Inventory entries for test user
  insert into user_inventory (user_id, item_id, quantity, is_equipped) values
    ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 1, false);

  -- Sample spark transactions (earn, earn, spend)
  insert into spark_transactions (user_id, amount, reason) values
    ('11111111-1111-1111-1111-111111111111', 100, 'seal'),
    ('11111111-1111-1111-1111-111111111111', 100, 'streak_bonus'),
    ('11111111-1111-1111-1111-111111111111', -50, 'purchase');
    