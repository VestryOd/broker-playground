export type SeatStatus = 'available' | 'held' | 'reserved';

export interface Seat {
  id: number;
  event_id: number;
  row: string;
  number: number;
  status: SeatStatus;
}
