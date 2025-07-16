'use client'
import React, { useEffect, useState } from 'react'
import {useDevice} from '@/hooks/devices/useDevice'

type props = {
  // Define any props if needed
  deviceName?: string;
  owner?: string;
  driver?: string;
  latitude?: number | string;
  longitude?: number | string;
  status?: string;
  charge?: number | string;
  event?: string;
}

// This component displays a list of items with their details.
export default function ItemList({ deviceName, owner, driver, latitude, longitude, status, charge, event }: props) {
  const [eventText, seteventText] = useState("");
  const {openDevice} = useDevice();

  useEffect(() => {

    if (event === "unlock") seteventText("Desbloqueado")
    else if (event === "lock") seteventText("Bloqueado")
    else if (event === "powerCut") seteventText("Cortado")
    else seteventText("")


  }, [event])

  return (
    <article className='flex flex-col gap-2 p-2 bg-white rounded-lg shadow-md mb-2'>
      <header className='flex items-center justify-between mb-2'>
        <div className="flex flex-row gap-2 text-3xl">
          <button className={`group ${event === "powerCut" ? 'bg-red-500' : event ? 'bg-amber-300' : 'bg-blue-300'} p-2 pl-4 pr-4 rounded btn-glow transition-all`}>
            <i className="bx bx-trip text-white group-hover:text-glow"></i>
          </button>
          <button className={`group ${event === "powerCut" ? 'bg-red-500' : event ? 'bg-amber-300' : 'bg-blue-300'} p-2 pl-4 pr-4 rounded btn-glow transition-all `} onClick={(e) => openDevice(deviceName)}>
            <i className="bx bx-lock-open text-white group-hover:text-glow"></i>
          </button>
        </div>
        <h2 className='text-xl font-semibold'>{deviceName}</h2>
      </header>
      <section className='flex items-center justify-between'>
        <p>Portador:</p>
        <p>{owner}</p>
      </section>
      <section className='flex items-center justify-between'>
        <p>Conductor:</p>
        <p>{driver}</p>
      </section>
      <section className='flex items-center justify-between'>
        <section className="flex flex-col gap-2">
          <p>Latitud:</p>
          <p>Longitud:</p></section>
        <section className="flex flex-col gap-2">
          <p>{latitude}</p>
          <p>{longitude}</p>
        </section>
      </section>
      <section className='flex items-center justify-between'>
        <p>Eventos:</p>
        <p>{eventText || event || "N/A"}</p>
      </section>
      <section className='flex items-center justify-between'>
        <p>Estado: {status}</p>
        <p>Carga: {charge}</p>
      </section>
    </article>
  )
}
