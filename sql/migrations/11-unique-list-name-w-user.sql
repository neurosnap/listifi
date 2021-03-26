ALTER TABLE lists DROP CONSTRAINT unique_title;
ALTER TABLE lists ADD COLUMN url_name character varying(255) NOT NULL;
ALTER TABLE lists ADD CONSTRAINT unique_name_for_user UNIQUE (owner_id, url_name);
ALTER TABLE list_stars DROP CONSTRAINT fk_list_id;
ALTER TABLE list_stars ADD CONSTRAINT fk_list_id
  FOREIGN KEY(list_id)
REFERENCES lists(id)
ON DELETE CASCADE;