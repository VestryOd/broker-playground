export interface OutboxEvent {
  id: number;
  event_type: string;
  payload: Record<string, unknown>;
  published: boolean;
  created_at: Date;
}
