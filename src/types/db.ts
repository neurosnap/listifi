/*
AUTOGENERATED FILE - DO NOT EDIT
--------------------------------
To edit this file, go to ./schema.ts
*/
/* eslint-disable @typescript-eslint/naming-convention */
export type JSONValue =
  | null
  | boolean
  | number
  | string
  | JSONObject
  | JSONArray;
export type JSONObject = { [k: string]: JSONValue };
export type JSONArray = JSONValue[];

export interface plugin_voting {
  id: string;
  list_id: string;
  item_id: string;
  user_id: string;
  created_at: Date;
}
export interface email_verifications {
  id: string;
  email: string;
  code: string;
  created_at: Date;
  used_at: Date | null;
}
export interface lists {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  public: boolean;
  created_at: Date;
  updated_at: Date;
  url_name: string;
  plugins: JSONValue;
  settings: JSONValue;
}
export interface list_stars {
  id: string;
  user_id: string;
  list_id: string;
  created_at: Date;
}
export interface plugin_suggestions {
  id: string;
  list_id: string;
  user_id: string;
  item_id: string | null;
  text: string;
  created_at: Date;
  updated_at: Date;
  rejected: boolean;
}
export interface list_comments {
  id: string;
  comment: string;
  list_id: string;
  item_id: string | null;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}
export interface list_items {
  id: string;
  text: string;
  list_id: string;
  created_at: Date;
  updated_at: Date;
  order: number;
  metadata: JSONValue;
  notes: string | null;
}
export interface plugins {
  id: string;
  name: string;
  description: string;
  created_at: Date;
  updated_at: Date;
}
export interface activity_feed {
  id: string;
  creator_id: string;
  subject_type: string;
  subject_id: string;
  activity_type: string;
  metadata: JSONValue;
  created_at: Date;
  updated_at: Date;
}
export interface app_users {
  id: string;
  email: string;
  passhash: string | null;
  created_at: Date;
  is_active: boolean;
  verified: boolean;
  picture: string | null;
  name: string | null;
  username: string;
  client_id: string | null;
  is_guest: boolean;
  updated_at: Date;
  email_notifications: boolean;
}

/* eslint-enable @typescript-eslint/naming-convention */
