ALTER TABLE plugin_voting DROP CONSTRAINT fk_list_id;
ALTER TABLE plugin_voting ADD CONSTRAINT fk_list_id
  FOREIGN KEY(list_id)
REFERENCES lists(id)
ON DELETE CASCADE;

ALTER TABLE plugin_voting DROP CONSTRAINT fk_item_id;
ALTER TABLE plugin_voting ADD CONSTRAINT fk_item_id
  FOREIGN KEY(item_id)
REFERENCES list_items(id)
ON DELETE CASCADE;

ALTER TABLE plugin_voting DROP CONSTRAINT fk_user_id;
ALTER TABLE plugin_voting ADD CONSTRAINT fk_user_id
  FOREIGN KEY(user_id)
REFERENCES app_users(id)
ON DELETE CASCADE;