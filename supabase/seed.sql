insert into product_categories (name, is_active)
values
  ('iPhone', true)
on conflict do nothing;

insert into products (name, capacity, color, condition)
values
  ('iPhone 17 Pro', '256GB', 'シルバー', '未開封'),
  ('iPhone 17 Pro', '256GB', 'コズミックオレンジ', '未開封'),
  ('iPhone 17 Pro', '256GB', 'ディープブルー', '未開封'),
  ('iPhone 17 Pro Max', '256GB', 'シルバー', '未開封'),
  ('iPhone 17 Pro Max', '256GB', 'コズミックオレンジ', '未開封'),
  ('iPhone 17 Pro Max', '256GB', 'ディープブルー', '未開封')
on conflict do nothing;

insert into suppliers (name)
values
  ('アップルストアオンライン'),
  ('アップルストア心斎橋'),
  ('アップルストア梅田'),
  ('アップルストア銀座'),
  ('Amazon'),
  ('楽天モバイル')
on conflict do nothing;

insert into buyers (name)
values
  ('買取一丁目'),
  ('森森買取'),
  ('モバステ'),
  ('モバイル一番')
on conflict do nothing;

insert into payment_accounts (name)
values
  ('楽天カード'),
  ('メルカード'),
  ('Amazonカード'),
  ('PayPayカード'),
  ('三井住友カード'),
  ('現金')
on conflict do nothing;
