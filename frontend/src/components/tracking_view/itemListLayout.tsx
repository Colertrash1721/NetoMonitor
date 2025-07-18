'use client'
import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import ItemList from './itemList';
import useSound from 'use-sound';

import { fetchAssignedDrivers, fetchDevices, fetchDrivers, fetchPositions } from '@/services/traccar/fetchDevices';
import { AssignedDriver, Device, Event, Position } from '@/types/traccar';
import { useTraccarSocket } from '@/hooks/tracking/useTraccarDevice';

type props = {
  filter?: string;
};

export default function ItemListLayout({ filter }: props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [drivers, setDrivers] = useState([]);
  const [assigned, setAssigned] = useState<AssignedDriver[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [gatewayData, setGatewayData] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loginStatus, setLoginStatus] = useState<string>('');
  const [playNotification] = useSound('/sound/notification.mp3', { volume: 0.5 });
  const [playAlarm] = useSound('/sound/alarma.mp3', { volume: 1 });

  useEffect(() => {
    const unlock = () => {
      playNotification(); // solo para desbloquear el audio
      window.removeEventListener('click', unlock);
    };
    window.addEventListener('click', unlock);
    return () => window.removeEventListener('click', unlock);
  }, []);

  useTraccarSocket({
    setPositions,
    setEvents,
    setGatewayData,
    setMessage,
    setLoginStatus,
  });

  useEffect(() => {
    const load = async () => {
      const [d, dr, a, p] = await Promise.all([
        fetchDevices(),
        fetchDrivers(),
        fetchAssignedDrivers(),
        fetchPositions(),
      ]);   
      setDevices(d);
      setDrivers(dr);
      setAssigned(a);
      setPositions(p);
      setLoading(false);
    };
    load();
  }, []);

  useEffect(() => {
    events.forEach((event) => {
      const eventId = event.id;
      // Si ya hay un timeout para este evento, no lo crees de nuevo
      if ((window as any)[`timeout_${eventId}`]) return;

      // Mostrar alerta
      let message = event.attributes?.message || '';
      message = message
        .replace(/unlock/gi, 'desbloqueado')
        .replace(/lock/gi, 'bloqueado')
        .replace(/Power Cut/gi, 'Cortado');

      if (message.includes('Cortado')) {
        playAlarm()
      } else {
        playNotification()
      }

      Swal.fire({
        position: 'bottom',
        text: `Alerta dispositivo ${message}`,
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
        showClass: {
          popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
        },
        hideClass: {
          popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
        },
        backdrop: false
      });

      // ⏳ Eliminar este evento después de 5 minutos
      const timeoutId = setTimeout(() => {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        delete (window as any)[`timeout_${eventId}`];
      }, 2 * 60 * 1000); // 2 minutos

      // Guardar referencia para evitar duplicados
      (window as any)[`timeout_${eventId}`] = timeoutId;
    });
  }, [events]);

  return (
    devices.length > 0 || drivers.length > 0 || assigned.length > 0 ? (
      devices
        .filter(device =>
          device.name?.toLowerCase().includes(filter?.toLowerCase() || "")
        ).sort((a, b) => {
          const hasEventA = events.some(e => e.deviceId === a.id);
          const hasEventB = events.some(e => e.deviceId === b.id);
          return Number(hasEventB) - Number(hasEventA);
        })
        .map(device => {
          const assignedDriver = assigned.find(a => a.deviceId === device.id);
          const position = positions.find(p => p.id === device.positionId || p.deviceId === device.id);
          const event = events.find(e => e.deviceId === device.id);

          return (
            <ItemList
              key={device.id}
              deviceName={device.name || "N/A"}
              driver={assignedDriver?.drivers?.map(d => d.name).join(', ') || 'No asignado'}
              owner={device.attributes?.portador || "No asignado"}
              status={device.status}
              charge={`${position?.attributes?.batteryLevel}%` || "N/A"}
              latitude={position?.latitude || "N/A"}
              longitude={position?.longitude || "N/A"}
              event={event?.attributes?.alarm}
            />
          );
        })
    ) : null
  );
}
