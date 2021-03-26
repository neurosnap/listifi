CREATE TABLE lists (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  title character varying(255) NOT NULL,
  description character varying(255) NOT NULL,
  owner_id uuid NOT NULL,
  public boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT NOW(),
  updated_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT unique_title UNIQUE (title),
  CONSTRAINT list_pkey PRIMARY KEY (id),
  CONSTRAINT fk_owner
      FOREIGN KEY(owner_id)
	  REFERENCES lispy_users(id)
);

CREATE TABLE list_items (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  text character varying(255) NOT NULL,
  list_id uuid NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  updated_at timestamp without time zone DEFAULT NOW(),
  CONSTRAINT list_items_pkey PRIMARY KEY (id),
  CONSTRAINT fk_list_id
      FOREIGN KEY(list_id)
	  REFERENCES lists(id)
    ON DELETE CASCADE
);