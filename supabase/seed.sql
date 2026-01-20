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