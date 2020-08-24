BEGIN;

TRUNCATE
  dontforget_users,
  dontforget_lists,
  dontforget_items,
  dontforget_item_list
  RESTART IDENTITY CASCADE;

INSERT INTO dontforget_users (user_name, password)
VALUES
  ('tony', '$2a$12$.ms8.7X0jD.VcACW8Yi.k.lZGvbezTtTJijX16NlrrJl1jzo0IZ6S'),
  ('bruce', '$2a$12$5QmWzkrtJaVnlsJh53BR8OZoHAUwDyWw6Z8gMCrCJbhQMGe/I8W2G'),
  ('test', '$2a$12$lHK6LVpc15/ZROZcKU00QeiD.RyYq5dVlV/9m4kKYbGibkRc5l4Ne');

INSERT INTO dontforget_lists (list_name, type, user_id)
VALUES
  ('List 1', 'Now',1),
  ('List 2', 'Now',2),
  ('List 3', 'Next',3),
  ('List 4', 'Now',3),
  ('List 5', 'Next',3),
  ('List 6', 'Now',3);

INSERT INTO dontforget_items (item_name)
VALUES
  ('Item 1'),
  ('Item 2'),
  ('Item 3');

INSERT INTO dontforget_item_list (item_id, list_id)
VALUES
  (1, 1),
  (2, 1),
  (1, 2),
  (2, 6),
  (1, 5),
  (3, 6),
  (1, 6),
  (2, 5),
  (3, 5),
  (3, 1);

COMMIT;

        