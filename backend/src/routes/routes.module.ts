import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Routes } from './entities/route.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Routes])],
  controllers: [RoutesController],
  providers: [RoutesService],
  exports: [RoutesService]
})
export class RoutesModule {}
