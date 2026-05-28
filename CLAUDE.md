# Broker Playground — Booking/Reservation System

Learning pet-project: Nest.js + PostgreSQL (raw SQL) + Redis + message brokers.
Goal: interview-ready backend skills (middle+/senior level).

## Tech Stack

- **Framework**: Nest.js (latest stable)
- **DB**: PostgreSQL via `pg` (raw SQL, no ORM — intentional)
- **Cache / coordination**: Redis via `ioredis`
- **Message brokers** (one per branch):
  - RabbitMQ (Docker, local)
  - Apache Kafka (Docker, KRaft mode, no ZooKeeper)
  - Google Pub/Sub (local emulator via `gcloud beta emulators pubsub`)
- **Infrastructure**: Docker Compose for all dependencies
- **TypeScript**: strict mode

## Branch Strategy

- `main` — Nest.js + Postgres + Redis, fully working application
- `feat/rabbitmq` — same app + RabbitMQ integration
- `feat/kafka` — same app + Kafka integration
- `feat/pubsub` — same app + Google Pub/Sub integration

All broker branches diverge from `main` after Phase 5 is complete.
Same use-case across all three branches for direct comparison.

## API Surface

- `GET /events` — list events (cached)
- `GET /events/:id/seats` — available seats (cached)
- `POST /reservations` — create reservation (transaction + SELECT FOR UPDATE)
- `POST /reservations/:id/pay` — pay (Redis lock + outbox event)
- `DELETE /reservations/:id` — cancel
- `GET /health` — liveness + readiness

---

## Learning Plan

### Phase 1 — Foundation (`main`)

**Step 1.1** Docker Compose (pg + redis), Nest.js init, `ConfigModule` with env validation
- Concepts: 12-factor app, fail-fast on startup, Joi/zod for env schema
- Interview: why validate env at startup vs runtime?

**Step 1.2** `DatabaseModule` — custom `pg.Pool` provider
- Concepts: connection pool (min/max/idleTimeout), pool vs single connection, connection leak
- Interview: how to size a pool for 1000 RPS? what is `max` and how does it relate to Postgres `max_connections`?

**Step 1.3** Migration runner — simple script, `schema_migrations` table
- Concepts: migration idempotency, `IF NOT EXISTS`, up-only vs up/down, zero-downtime migrations
- Interview: how to add a NOT NULL column without downtime on 50M rows?

**Step 1.4** `GET /health` — liveness + readiness, ping pg + redis
- Concepts: liveness vs readiness vs startup probe, connection draining on shutdown
- Interview: difference between liveness and readiness? when does k8s kill the pod?

---

### Phase 2 — Postgres Deep Dive

**Step 2.1** DB schema: `users`, `events`, `seats`, `reservations`, `payments_log` + seed data
- Concepts: FK constraints, `CHECK` constraints, `ENUM` vs `VARCHAR`, indexes on FK
- Interview: why is an FK without an index a problem?

**Step 2.2** `EventsModule`, `SeatsModule` — repositories with raw SQL, typed
- Concepts: Repository pattern without ORM, type safety via interfaces, parameterized queries (SQL injection protection)
- Interview: ORM vs raw SQL trade-offs at senior level

**Step 2.3** `POST /reservations` — transaction + `SELECT FOR UPDATE`
- Concepts: ACID, isolation levels (Read Committed / Repeatable Read / Serializable), `SELECT FOR UPDATE`, `FOR UPDATE NOWAIT`, deadlock detection
- Interview: what happens without `FOR UPDATE` with two parallel requests for the same seat? how does Postgres detect deadlocks?

**Step 2.4** `GET /events/:id/seats` — `EXPLAIN ANALYZE`, composite index
- Concepts: seq scan vs index scan vs bitmap index scan, partial index, `EXPLAIN` vs `EXPLAIN ANALYZE`, cost model
- Interview: how to read a query plan? when does Postgres ignore an index?

**Step 2.5** Background worker (`@Cron`) — releasing expired reservations via `SKIP LOCKED`
- Concepts: `SKIP LOCKED` vs `FOR UPDATE`, advisory locks, canonical job queue pattern on pg
- Interview: implement a job queue on Postgres without Redis or brokers. what's wrong with `SELECT WHERE status = 'pending' LIMIT 1 FOR UPDATE`?

---

### Phase 3 — Redis Layer

**Step 3.1** Cache-aside for venue layout: cache → miss → pg → set
- Concepts: cache-aside vs write-through vs write-behind, TTL, cache stampede / thundering herd, stale-while-revalidate
- Interview: when is write-through better than cache-aside? what is thundering herd and how to prevent it?

**Step 3.2** Distributed lock: `SET NX EX` on reservation creation (10-min hold)
- Concepts: atomicity of `SET NX EX`, Lua scripts for compare-and-delete, why single Redis ≠ Redlock, fencing token
- Interview: what's wrong with `SETNX` + `EXPIRE` as two commands? when do you need Redlock?

**Step 3.3** Rate limiting on `POST /reservations` — sliding window on sorted set
- Concepts: fixed window vs sliding window vs token bucket vs leaky bucket, implementation via `ZADD` + `ZREMRANGEBYSCORE` + `ZCARD`
- Interview: compare fixed window and sliding window by accuracy and memory. how to implement token bucket on Redis?

**Step 3.4** Redis Pub/Sub mini-demo + limitations breakdown
- Concepts: at-most-once, no persistence, no consumer groups, no backpressure
- Interview: when is Redis Pub/Sub enough? how does it fundamentally differ from Kafka/RabbitMQ?

---

### Phase 4 — Reliability

**Step 4.1** Graceful shutdown: SIGTERM → drain in-flight → close pool + redis
- Concepts: `SIGTERM` vs `SIGKILL`, `beforeApplicationShutdown` hook in Nest, connection draining
- Interview: what happens to a pg.Pool request on `kill -9`?

**Step 4.2** Structured logging + correlation ID
- Concepts: `pino` vs `winston`, JSON logs, correlation ID via `AsyncLocalStorage`, why `console.log` in production is bad
- Interview: how to trace a single request through 5 microservices without distributed tracing?

---

### Phase 5 — Outbox Pattern (bridge to brokers)

**Step 5.1** `outbox` table, transactional write: business data + event in one transaction
- Concepts: dual-write problem, transactional outbox as solution, exactly-once publishing
- Interview: what is dual-write? why is `saveOrder()` + `publishEvent()` an anti-pattern?

**Step 5.2** Outbox poller: `SKIP LOCKED` → read → "publish" (to log for now) → mark published
- Concepts: at-least-once vs exactly-once, idempotency key on consumer side, polling vs CDC (Debezium)
- Interview: how to guarantee exactly-once if the broker is at-least-once?

> After Phase 5: branch into `feat/rabbitmq`, `feat/kafka`, `feat/pubsub`.
> Each replaces "publish to log" with a real broker.

---

### Phase 6 — RabbitMQ (`feat/rabbitmq`)

**Step 6.1** RabbitMQ in Docker Compose, topology: exchange / queue / binding
- Concepts: direct vs topic vs fanout exchange, routing key, durable queue, exclusive queue
- Interview: why does an exchange exist? why can't you write directly to a queue?

**Step 6.2** Producer from outbox poller → RabbitMQ
- Concepts: publisher confirms, persistent messages (`delivery_mode: 2`), connection recovery
- Interview: how to guarantee a message isn't lost between producer and broker?

**Step 6.3** Two consumers: `payment-worker`, `notification-worker`
- Concepts: `ack` / `nack` / `reject`, prefetch (`basicQos`), competing consumers
- Interview: what happens to a message on `nack` without `requeue`? why `prefetch = 1`?

**Step 6.4** Retry + Dead Letter Exchange
- Concepts: exponential backoff via `x-message-ttl` + DLX, poison message, DLQ monitoring
- Interview: how to implement exponential backoff in RabbitMQ without an external scheduler?

---

### Phase 7 — Kafka (`feat/kafka`)

**Step 7.1** Kafka KRaft in Docker Compose, topic creation
- Concepts: partition, replication factor, offset, log retention (time vs size), compaction
- Interview: why is a partition the unit of parallelism? how to choose partition count?

**Step 7.2** Producer from outbox poller → Kafka
- Concepts: `acks` (0 / 1 / all), idempotent producer, batching (`linger.ms`, `batch.size`)
- Interview: difference between `acks=1` and `acks=all`? what is an idempotent producer?

**Step 7.3** Consumer group for payment + notification
- Concepts: consumer group, partition assignment, consumer lag, offset commit (auto vs manual), rebalance
- Interview: what happens during rebalance? why is `enable.auto.commit=true` risky?

**Step 7.4** Ordering via partition key (`reservation_id`)
- Concepts: ordering guaranteed per partition only, hot partition problem, key-based partitioning
- Interview: how to guarantee ordering in Kafka? what happens to ordering when you increase partition count?

---

### Phase 8 — Google Pub/Sub (`feat/pubsub`)

**Step 8.1** Emulator in Docker Compose, topic + subscription
- Concepts: topic vs subscription, push vs pull delivery, ack deadline, ordering key
- Interview: when is push better than pull? what is ack deadline and what happens when exceeded?

**Step 8.2** Producer + pull consumer
- Concepts: at-least-once, ordering keys (analogous to Kafka partition key), message attributes, flow control
- Interview: how to ensure ordering in Pub/Sub? compare with Kafka.

**Step 8.3** Dead Letter Topic + retry policy
- Concepts: retry policy in Pub/Sub vs Kafka vs RabbitMQ, `maxDeliveryAttempts`
- Interview: compare DLQ mechanism in all three brokers by API and behavior.

---

### Final Report

1. Project summary: what was built, architectural decisions, trade-offs
2. Broker comparison table: RabbitMQ vs Kafka vs Pub/Sub
3. All control questions with deep answers + interview follow-ups + edge cases
4. Topics for further study (MVCC, backpressure, exactly-once semantics, idempotency keys, outbox pattern deep-dive, etc.)
