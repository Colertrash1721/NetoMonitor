import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';

@Controller('traccar')
export class TraccarController {
  constructor(private readonly eventsGateway: EventsGateway) {}

  // 👉 Para `forward` que siempre hace GET
  @Get('webhook')
  handleForwardGet(@Query() query: any) {
    console.log('🌐 [GET] Forward recibido de Traccar:', query);

    // Reenvía a todos los clientes WebSocket
    this.eventsGateway.broadcastTraccarEvent(query);

    return { status: 'ok', via: 'GET forward' };
  }

  // 👉 Para notificaciones tipo Webhook (si luego quieres usar POST)
  @Post('webhook')
  handleWebhookPost(@Body() payload: any) {
    console.log('🌐 [POST] Webhook recibido de Traccar:', payload);

    this.eventsGateway.broadcastTraccarEvent(payload);

    return { status: 'ok', via: 'POST webhook' };
  }
}
