CREATE TABLE dontforget_item_list (
    item_id INTEGER
        REFERENCES dontforget_items(id) ON DELETE SET NULL,
    list_id INTEGER
        REFERENCES dontforget_lists(id) ON DELETE CASCADE NOT NULL
);
CREATE UNIQUE INDEX dontforget_item_list_indd ON dontforget_item_list(item_id, list_id);