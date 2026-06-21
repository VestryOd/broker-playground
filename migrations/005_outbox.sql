CREATE TABLE outbox (
  id          SERIAL PRIMARY KEY,
  event_type  VARCHAR(100) NOT NULL,
  payload     JSONB NOT NULL,
  published   BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_outbox_unpublished ON outbox (created_at) WHERE published = false;
