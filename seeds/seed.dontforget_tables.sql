BEGIN;

TRUNCATE
  dontforget_users,
  dontforget_lists,
  dontforget_items
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
  ('List 3', 'Now',1),
  ('List 4', 'Now',2),
  ('List 5', 'Now',3),
  ('List 6', 'Now',3),
  ('List 7', 'Next',3);

INSERT INTO dontforget_items (item_name, list_id, user_id)
VALUES
  ('Item 1', 1, 1),
  ('Item 2', 2, 1),
  ('Item 3', 3, 2),
  ('Item 4', 4, 2),
  ('Item 5', 5, 3),
  ('Item 6', 6, 3),
  ('Item 7', 5, 3),
  ('Item 8', 6, 3),
  ('Item 9', 7, 3);

COMMIT;

        