import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Routes } from './entities/route.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RoutesService {
  constructor(@InjectRepository(Routes) private routeRepository: Repository<Routes>) { }

  async findAllRoutes() {
    return this.routeRepository.find();
  }

  async findRouteByDeviceName(deviceName: string) {
    const findRoute = await this.routeRepository.findOne({
      where: { device_Name: deviceName },
    });
    if (!findRoute) {
      return null;
    }
    return findRoute
  }
  
  async deleteRouteByDeviceName(deviceName: string) {
    const foundRoute = await this.routeRepository.findOne({
      where: {
        device_Name: deviceName,
      },
    });

    if (!foundRoute) {
      throw new HttpException(
        `No se encontró una ruta para el dispositivo "${deviceName}"`,
        HttpStatus.NOT_FOUND,
      );
    }

    await this.routeRepository.remove(foundRoute);

    return {
      message: `Ruta eliminada para el dispositivo "${deviceName}"`,
      data: foundRoute,
    };
  }
}
