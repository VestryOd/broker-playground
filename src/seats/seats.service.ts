import {Injectable, NotFoundException} from "@nestjs/common";
import { SeatsRepository } from "./seats.repository";
import { Seat } from "../common/types/seat.types";

@Injectable()
export class SeatsService {
  constructor(private readonly seatsRepository: SeatsRepository) {
  }

  findAllAvailable(event_id: number): Promise<Seat[]> {
    return this.seatsRepository.findAvailableByEventId((event_id));
  }

  findByEventId(event_id: number): Promise<Seat[]> {

    return this.seatsRepository.findByEventId(event_id);
  }
}