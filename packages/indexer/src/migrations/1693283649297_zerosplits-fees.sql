-- Up Migration

CREATE TABLE "zerosplits_fees" (
  "hash" TEXT NOT NULL,
  "address" BYTEA NOT NULL,
  "api_key" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "zerosplits_fees"
  ADD CONSTRAINT "zerosplits_fees_pk"
  PRIMARY KEY ("hash");

-- Down Migration

DROP TABLE "zerosplits_fees";