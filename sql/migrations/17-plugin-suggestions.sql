CREATE TABLE plugin_suggestions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  list_id uuid NOT NULL,
  user_id uuid NOT NULL,
  item_id uuid,
  text character varying(255) NOT NULL,
  rejected boolean NOT NULL DEFAULT false,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT plugin_suggestion_pkey PRIMARY KEY (id),
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

ALTER TABLE app_users ADD COLUMN email_notifications boolean NOT NULL DEFAULT true;