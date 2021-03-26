ALTER TABLE list_items ADD COLUMN notes TEXT;

CREATE TABLE list_comments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  comment TEXT NOT NULL,
  list_id uuid NOT NULL,
  item_id uuid,
  user_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  updated_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT list_comments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_list_id
      FOREIGN KEY(list_id)
	  REFERENCES lists(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_item_id
      FOREIGN KEY(item_id)
	  REFERENCES list_items(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_user_id
      FOREIGN KEY(user_id)
	  REFERENCES app_users(id)
    ON DELETE CASCADE
);