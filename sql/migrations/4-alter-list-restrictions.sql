ALTER TABLE lists ALTER COLUMN description DROP NOT NULL;
ALTER TABLE lispy_users ADD COLUMN username character varying(255);
ALTER TABLE lispy_users ADD CONSTRAINT unique_username UNIQUE (username);