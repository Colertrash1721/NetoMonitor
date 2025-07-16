import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { RoutesService } from './routes.service';

@Controller('routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get('')
  getAllRoutes(){
    return this.routesService.findAllRoutes()
  }
  @Get(':deviceName')
  getRouteByDeviceName(@Param('deviceName') deviceName: string){
    return this.routesService.findRouteByDeviceName(deviceName)
  }
  @Put(':deviceName')
  DeleteRouteByDeviceName(@Param('deviceName') deviceName: string){
    return this.routesService.deleteRouteByDeviceName(deviceName)
  }
}
