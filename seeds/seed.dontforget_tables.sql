BEGIN;

TRUNCATE
  dontforget_lists,
  dontforget_items,
  dontforget_item_list,
  dontforget_nextlist,
  dontforget_item_nextlist 
  RESTART IDENTITY CASCADE;

INSERT INTO dontforget_lists (name)
VALUES
  ('List 1'),
  ('List 2');

INSERT INTO dontforget_nextlist (name)
VALUES
  ('NList 1'),
  ('NList 2'),
  ('NList 3'),
  ('NList 4'),
  ('NList 5');



INSERT INTO dontforget_items (name)
VALUES
  ('Item 1'),
  ('Item 2'),
  ('Item 3');
INSERT INTO dontforget_item_list (item_id, list_id)
VALUES
  (1, 1),
  (2, 1),
  (1, 2),
  (3, 1);

INSERT INTO dontforget_item_nextlist (item_id, list_id)
VALUES
  (1, 1),
  (1, 4),
  (2, 1),
  (3, 4),
  (2, 5),
  (3, 1);
COMMIT;

        