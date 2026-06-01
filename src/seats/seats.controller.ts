import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { SeatsService } from "./seats.service";

@Controller('events')
export class SeatsController {
  constructor(private readonly seatsService: SeatsService) {}

  @Get('/:eventId/seats')
  findSeatsByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.seatsService.findAllAvailable(eventId);
  }
}