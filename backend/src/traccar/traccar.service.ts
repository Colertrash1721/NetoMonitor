import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { Request } from 'express';

import { EventsGateway } from '../events/events.gateway';
import { Repository } from 'typeorm';
import { events } from 'src/types/events';

import { InjectRepository } from '@nestjs/typeorm';
import { Events } from './entities/events.entity';

import { DevicesService } from 'src/devices/devices.service';
import { RoutesService } from 'src/routes/routes.service';
import { device } from 'src/types/device';

@Injectable()
export class TraccarService {
  private ws: WebSocket | null = null;
  private readonly traccarApiUrl = process.env.My_Ip || 'http://128.85.27.70:8082';

  constructor(private readonly eventsGateway: EventsGateway,
    @InjectRepository(Events) private eventRepository: Repository<Events>,
    private readonly deviceService: DevicesService,
    private readonly routeService: RoutesService,
  ) { }

  async openTraccarWS(jsessionId: string) {
    // ✅ Corrige protocolo
    const wsProtocol = this.traccarApiUrl.startsWith('https') ? 'wss' : 'ws';
    const cleanHost = this.traccarApiUrl.replace(/^https?:\/\//, '');
    const wsUrl = `${wsProtocol}://${cleanHost}/socket`;

    console.log(`🌐 Abriendo WS a: ${wsUrl}`);

    this.ws = new WebSocket(wsUrl, {
      headers: {
        Cookie: jsessionId,
      },
    });

    this.ws.on('open', () => {
      console.log('✅ WS Traccar abierto');
    });

    this.ws.on('message', async (data) => {
      try {
        const payload = JSON.parse(data.toString());
        if (!payload || typeof payload !== 'object') {
          console.error('❌ Payload WS no es un objeto válido:', data);
          return;
        }
        // Reemitir a todos los clientes Socket.IO
        this.eventsGateway.broadcastTraccarEvent(payload);
        if (Array.isArray(payload.events)) {
          for (const event of payload.events) {
            await this.createEvent(event);
          }
        }
      } catch (err) {
        console.error('❌ Error parseando payload WS:', err);
      }
    });

    this.ws.on('close', () => {
      console.log('🔒 WS Traccar cerrado');
    });

    this.ws.on('error', (err) => {
      console.error('❌ WS Error', err);
    });
  }

  async createEvent(event: events) {
  try {
    const device = await this.deviceService.findDeviceById(event.deviceId);

    if (!device) {
      throw new HttpException('No existe este dispositivo', HttpStatus.NOT_FOUND);
    }

    const deviceName = device.name;
    const route = await this.routeService.findRouteByDeviceName(deviceName);

    const newEvent = await this.eventRepository.create({
      idEvent: event.id,
      idRoute: route?.idRute,
      deviceName: deviceName,
      eventType: event.attributes?.alarm
    })

    return await this.eventRepository.save(newEvent)

  } catch (err) {
    console.error('❌ Error en createEvent:', err);
  }
}

}
