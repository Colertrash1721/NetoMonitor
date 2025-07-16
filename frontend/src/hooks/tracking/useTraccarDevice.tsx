// src/hooks/useTraccarSocket.ts
'use client'

import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Position, Event } from '@/types/traccar';

type UseTraccarSocketProps = {
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>;
  setGatewayData: React.Dispatch<React.SetStateAction<any>>;
  setMessage: React.Dispatch<React.SetStateAction<string>>;
  setLoginStatus: React.Dispatch<React.SetStateAction<string>>;
};

export function useTraccarSocket({
  setPositions,
  setEvents,
  setGatewayData,
  setMessage,
  setLoginStatus,
}: UseTraccarSocketProps) {
  useEffect(() => {
    let socket: Socket;

    const connectSocket = () => {
      socket = io('http://192.168.2.117:3000', {
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('✅ Conectado al Gateway');
        setLoginStatus('Conectado al Gateway');
      });

      socket.on('traccarEvent', (payload: any) => {
        if (payload.positions) {
          setPositions(prev => {
            const updated = [...prev];
            payload.positions.forEach((newPos: Position) => {
              const index = updated.findIndex(p => p.id === newPos.id);
              if (index !== -1) updated[index] = newPos;
              else updated.push(newPos);
            });
            return updated;
          });
        }

        if (payload.events) {
          setEvents(prev => {
            const updated = [...prev];
            payload.events.forEach((newEvent: Event) => {
              const index = updated.findIndex(e => e.deviceId === newEvent.deviceId);
              if (index !== -1) updated[index] = newEvent;
              else updated.push(newEvent);
            });
            return updated;
          });
          console.log('🚨 Events:', payload.events);
        }

        setGatewayData(payload);
      });

      socket.on('messageToClient', (msg: any) => {
        console.log('💬 MessageToClient:', msg);
        setMessage(msg);
      });

      socket.on('disconnect', () => {
        console.log('❌ Desconectado del Gateway');
        setLoginStatus('Desconectado del Gateway');
      });
    };

    connectSocket();

    return () => {
      socket?.disconnect();
      console.log('🔒 Socket.IO cerrado');
    };
  }, [setPositions, setEvents, setGatewayData, setMessage, setLoginStatus]);
}
