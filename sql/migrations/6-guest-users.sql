ALTER TABLE app_users ADD COLUMN client_id uuid;
ALTER TABLE app_users ADD COLUMN is_guest boolean DEFAULT false;