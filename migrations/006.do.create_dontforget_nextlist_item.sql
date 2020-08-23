CREATE TABLE dontforget_item_nextlist (
    item_id INTEGER
        REFERENCES dontforget_items(id) ON DELETE SET NULL,
    nextlist_id INTEGER
        REFERENCES dontforget_nextlist(id) ON DELETE CASCADE NOT NULL
);
CREATE UNIQUE INDEX dontforget_item_nextlist_indd ON dontforget_item_nextlist(item_id, nextlist_id);