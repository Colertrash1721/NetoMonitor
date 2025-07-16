import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TraccarController } from './traccar/traccar.controller';
import { EventsGateway } from './events/events.gateway';
import { DevicesModule } from './devices/devices.module';
import { RoutesModule } from './routes/routes.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 🛠️ Configura TypeORM con variables del entorno
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get<string>('DB_USER'),
        password: config.get<string>('DB_PASS'),
        database: config.get<string>('DB_NAME'),
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    AuthModule, DevicesModule, RoutesModule],
  controllers: [AppController, TraccarController],
  providers: [AppService, EventsGateway],
})
export class AppModule {}
