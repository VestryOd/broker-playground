-- ENUM types
CREATE TYPE seat_status AS ENUM ('available', 'held', 'reserved');
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed');

-- users
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  name        VARCHAR(255) NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE events (
    id          SERIAL PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    venue       VARCHAR(255) NOT NULL,
    starts_at   TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE seats (
    id              SERIAL PRIMARY KEY,
    event_id        INTEGER NOT NULL REFERENCES events(id),
    row             VARCHAR(100) NOT NULL,
    number          INTEGER NOT NULL CHECK (number > 0),
    status          seat_status NOT NULL DEFAULT 'available',
    UNIQUE (event_id, row, number)
);

CREATE TABLE reservations (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    seat_id     INTEGER NOT NULL REFERENCES seats(id),
    status      reservation_status NOT NULL DEFAULT 'pending',
    expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '10 minutes',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments_log (
    id                  SERIAL PRIMARY KEY,
    reservation_id      INTEGER NOT NULL REFERENCES reservations(id),
    amount              NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    status              payment_status NOT NULL DEFAULT 'pending',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_background_worker ON reservations (expires_at) WHERE status = 'pending';
CREATE INDEX idx_reservations_seat_id ON reservations (seat_id);
CREATE INDEX idx_reservations_user_id ON reservations (user_id);
CREATE INDEX idx_payments_log_reservation_id ON payments_log (reservation_id);
CREATE UNIQUE INDEX idx_one_active_per_seat ON reservations (seat_id)
    WHERE status IN ('pending', 'confirmed');
