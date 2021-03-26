
CREATE TABLE email_verifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying(255) NOT NULL,
  code character varying(255) NOT NULL,
  used_at timestamp without time zone DEFAULT NULL,
  created_at timestamp without time zone NOT NULL DEFAULT NOW(),
  CONSTRAINT email_verification_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX email_verifications_code ON email_verifications (code);

ALTER TABLE app_users RENAME COLUMN validated TO verified;