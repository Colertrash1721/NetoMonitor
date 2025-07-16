import { forwardRef,Module } from "@nestjs/common";
import { TraccarService } from "./traccar.service";
import { TraccarController } from "./traccar.controller";
import { EventsGateway } from "../events/events.gateway";
import { RoutesModule } from "src/routes/routes.module";
import { DevicesModule } from "src/devices/devices.module";
import { Events } from "./entities/events.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [RoutesModule, 
    forwardRef(() => DevicesModule),
    TypeOrmModule.forFeature([Events])
  ],
  controllers: [TraccarController],
  providers: [TraccarService, EventsGateway],
  exports: [TraccarService],
})
export class TraccarModule {}