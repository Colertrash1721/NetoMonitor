"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { fetchDevices, fetchPositions } from "@/services/traccar/fetchDevices";
import { useTraccarSocket } from "@/hooks/tracking/useTraccarDevice";
import { Device, Position } from "@/types/traccar";
import { fetchAllRoutes } from "@/services/routes/fetchRoutes";

// ICONOS personalizados
const truckIcon = new L.Icon({
  iconUrl: "/icons/truck.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const startIcon = new L.Icon({
  iconUrl: "/icons/start.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const endIcon = new L.Icon({
  iconUrl: "/icons/end.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const center: [number, number] = [18.4861, -69.9312];

export default function ClientMap() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [routeLines, setRouteLines] = useState<[number, number][][]>([]);

  const [events, setEvents] = useState<any[]>([]);
  const [gatewayData, setGatewayData] = useState<any>(null);
  const [message, setMessage] = useState<string>('');
  const [loginStatus, setLoginStatus] = useState<string>('');

  // 👉 WS actualiza posiciones y eventos en tiempo real
  useTraccarSocket({
    setPositions,
    setEvents,
    setGatewayData,
    setMessage,
    setLoginStatus,
  });

  // 🚩 Dispositivos y rutas base
  useEffect(() => {
    const loadRoutes = async (deviceList: Device[]) => {
      try {
        const rou = await fetchAllRoutes();

        // Crear set de nombres de dispositivos (en minúsculas)
        const deviceNames = new Set(deviceList.map(d => d.name?.toLowerCase().trim()));

        console.log("DISPOSITIVOS:", Array.from(deviceNames));

        // Filtrar rutas que coincidan con algún nombre de dispositivo
        const filteredRoutes = rou.filter((route: any) =>
          deviceNames.has(route.device_Name?.toLowerCase().trim())
        );

        console.log("RUTAS FILTRADAS:", filteredRoutes);

        setRoutes(filteredRoutes);
      } catch (error) {
        console.error("Error fetching routes:", error);
      }
    };

    const init = async () => {
      try {
        const dev = await fetchDevices();
        const pos = await fetchPositions();

        setDevices(dev);
        setPositions(pos);

        await loadRoutes(dev); // ← Pasar dispositivos directamente
      } catch (e) {
        console.error("Error cargando datos:", e);
      }
    };

    init();
  }, []);

  // 🔗 Cuando se cargan rutas, calcula líneas
  useEffect(() => {
    const fetchRouteLines = async () => {
      if (!routes.length) return;

      const lines: [number, number][][] = [];

      for (const route of routes) {
        const origin = [parseFloat(route.Startlatitud), parseFloat(route.Startlongitud)];
        const destination = [parseFloat(route.Endlatitud), parseFloat(route.Endlongitud)];

        try {
          const resp = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${destination[1]},${destination[0]}?overview=full&geometries=geojson`
          );
          const data = await resp.json();

          if (data.routes && data.routes[0]) {
            const coordinates: [number, number][] = data.routes[0].geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );
            lines.push(coordinates);
          }
        } catch (err) {
          console.error("OSRM error:", err);
        }
      }

      setRouteLines(lines);
    };

    fetchRouteLines();
  }, [routes]);

  return (
    <MapContainer
      center={center}
      zoom={10}
      scrollWheelZoom={true}
      style={{ width: "100%", height: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ✅ MARCADORES: Dispositivos + Posición viva */}
      {devices.map(device => {
        const pos = positions.find(p => p.deviceId === device.id);
        if (!pos) return null;

        return (
          <Marker
            key={device.id}
            position={[pos.latitude!, pos.longitude!]}
            icon={truckIcon}
          >
            <Popup>
              {`Device: ${device.name} (ID: ${device.id})`}
            </Popup>
          </Marker>
        );
      })}

      {/* Inicio y fin de rutas */}
      {routes.map((route: any, idx: number) => {
        const start: [number, number] = [
          parseFloat(route.Startlatitud),
          parseFloat(route.Startlongitud),
        ];
        const end: [number, number] = [
          parseFloat(route.Endlatitud),
          parseFloat(route.Endlongitud),
        ];

        return (
          <div key={`route-markers-${idx}`}>
            <Marker position={start} icon={startIcon}>
              <Popup>Inicio de ruta</Popup>
            </Marker>
            <Marker position={end} icon={endIcon}>
              <Popup>Fin de ruta</Popup>
            </Marker>
          </div>
        );
      })}

      {/* ✅ POLYLINES calculadas */}
      {routeLines.map((line, idx) => (
        <Polyline key={`line-${idx}`} positions={line} pathOptions={{ color: "blue" }} />
      ))}
    </MapContainer>
  );
}
