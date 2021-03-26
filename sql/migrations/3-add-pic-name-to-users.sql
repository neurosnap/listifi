ALTER TABLE lispy_users ADD picture character varying(255);
ALTER TABLE lispy_users ADD name character varying(255);
ALTER TABLE lispy_users ALTER COLUMN passhash DROP NOT NULL;
