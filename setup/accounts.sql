-- Install uuid-ossp module to generate UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Setup accounts
CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR NOT NULL UNIQUE,
  password TEXT
);