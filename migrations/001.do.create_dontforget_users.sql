CREATE TABLE dontforget_users (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_name TEXT NOT NULL,
    password TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL
);
