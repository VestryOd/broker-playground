import { Module } from "@nestjs/common";
import { SeatsService } from "./seats.service";
import { SeatsController } from "./seats.controller";
import { SeatsRepository } from "./seats.repository";
import { DatabaseModule } from "../database/database.module";
import { RedisModule } from "../redis/redis.module";

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [SeatsService, SeatsRepository],
  controllers: [SeatsController],
})
export class SeatsModule {}