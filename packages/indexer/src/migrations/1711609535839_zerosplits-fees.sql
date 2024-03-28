-- Up Migration

CREATE TABLE "zerosplits_fees" (
  "hash" TEXT NOT NULL,
  "address" BYTEA NOT NULL,
  "api_key" TEXT NOT NULL,
  "config" JSONB NOT NULL,
  "deployed" BOOLEAN NOT NULL DEFAULT FALSE,
  "deploy_threshold" NUMERIC(78, 0),
  "distribution_threshold" NUMERIC(78, 0),
  "tokens" JSONB NOT NULL,
  "last_distribution" TIMESTAMPTZ,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE "zerosplits_fees"
  ADD CONSTRAINT "zerosplits_fees_pk"
  PRIMARY KEY ("hash");

-- Down Migration

DROP TABLE "zerosplits_fees";