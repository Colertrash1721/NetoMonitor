export interface events {
 id: number,
 deviceId: number,
 type: string,
 eventTime,
 attributes?: {
    alarm: string,
 }
}