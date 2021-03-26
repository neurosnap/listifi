CREATE TABLE activity_feed (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  creator_id uuid NOT NULL,
  subject_type character varying(255) NOT NULL,
  subject_id uuid NOT NULL,
  activity_type character varying(255) NOT NULL,
  metadata jsonb,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  updated_at timestamp without time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT activity_feed_pkey PRIMARY KEY (id)
);