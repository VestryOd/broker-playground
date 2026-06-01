export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: number;
  user_id: number;
  seat_id: number;
  status: ReservationStatus;
  expires_at: Date;
  created_at: Date;
}

export class CreateReservationDto {
  userId: number;
  seatId: number;
}
