INSERT INTO users (email, name)
    VALUES
        ('b.kirby@mail.com', 'Bob Kirby'),
        ('s.connor@mail.com', 'Sara Connor');

INSERT INTO events (title, venue, starts_at)
    VALUES
        ('Concert 1', 'City Mall 1', '2026-06-10T19:00:00+00'),
        ('Concert 2', 'City Mall 2', '2026-06-15T19:00:00+00');

INSERT INTO seats (event_id, row, number)
    VALUES
          (1, 'A', 1),
          (1, 'A', 2),
          (1, 'A', 3),
          (1, 'A', 4),
          (1, 'A', 5),
          (1, 'B', 1),
          (1, 'B', 2),
          (1, 'B', 3),
          (1, 'B', 4),
          (1, 'B', 5);

-- 10 мест на событие 2
INSERT INTO seats (event_id, row, number)
    VALUES
        (2, 'A', 1),
        (2, 'A', 2),
        (2, 'A', 3),
        (2, 'A', 4),
        (2, 'A', 5),
        (2, 'B', 1),
        (2, 'B', 2),
        (2, 'B', 3),
        (2, 'B', 4),
        (2, 'B', 5);