CREATE TABLE plugins (
  id character varying(255) NOT NULL,
  name character varying(255) NOT NULL,
  description character varying(255) NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  updated_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT unique_id UNIQUE (id),
  CONSTRAINT plugins_pkey PRIMARY KEY (id)
);

ALTER TABLE lists ADD COLUMN plugins jsonb;
ALTER TABLE lists ADD COLUMN settings jsonb;

CREATE TABLE plugin_voting (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  list_id uuid NOT NULL,
  item_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT plugin_voting_pkey PRIMARY KEY (id),
  CONSTRAINT fk_list_id
      FOREIGN KEY(list_id)
	  REFERENCES lists(id),
  CONSTRAINT fk_item_id
      FOREIGN KEY(item_id)
	  REFERENCES list_items(id),
    CONSTRAINT fk_user_id
      FOREIGN KEY(user_id)
	  REFERENCES app_users(id)
);
/* CREATE TABLE list_plugins (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  list_id uuid NOT NULL,
  plugin_id uuid NOT NULL,
  CONSTRAINT list_plugins_pkey PRIMARY KEY (id),
  CONSTRAINT fk_list_id
      FOREIGN KEY(list_id)
	  REFERENCES lists(id),
    CONSTRAINT fk_plugin_id
      FOREIGN KEY(plugin_id)
	  REFERENCES plugins(id)
); */