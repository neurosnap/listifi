CREATE TABLE list_stars (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  list_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT list_stars_pkey PRIMARY KEY (id),
  CONSTRAINT fk_user_id
      FOREIGN KEY(user_id)
	  REFERENCES app_users(id),
  CONSTRAINT fk_list_id
      FOREIGN KEY(list_id)
	  REFERENCES lists(id)
);
ALTER TABLE lists DROP COLUMN stars;