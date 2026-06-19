export const REDIS_CLIENT = 'REDIS_CLIENT';

export const REDIS_KEYS = {
  eventsAll: 'events:all',
  seatsAvailableByEvent: (eventId: number) => `seats:available:event:${eventId}`,
  seatsByEvent: (eventId: number) => `seats:event:${eventId}`,
  seatLock: (seatId: number) => `seat:lock:${seatId}`,
  reservationsRateLimit: (userId: number) => `rate:reservations:user:${userId}`,
};

export const REDIS_TTL = {
  eventsAll: 60,
  seatsAvailable: 60,
  seatsByEvent: 30,
  seatLock: 600,
  rateLimitWindowSec: 60,
  rateLimitMax: 5,
};
