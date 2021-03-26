CREATE EXTENSION "uuid-ossp";

CREATE TABLE lispy_users (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  email character varying(255) NOT NULL,
  passhash character varying(255) NOT NULL,
  created_at timestamp without time zone DEFAULT NOW(),
  is_active boolean DEFAULT true,
  validated boolean DEFAULT false,
  CONSTRAINT lispy_user_pkey PRIMARY KEY (id),
  CONSTRAINT unique_email UNIQUE (email)
);