import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('events')
export class Events {
    @PrimaryColumn()
    idEvent: number;
    @Column()
    idRoute: number;
    @Column()
    deviceName: string;
    @Column()
    eventType: string;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    eventDate: Date;
}