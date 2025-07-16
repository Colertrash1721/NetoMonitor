'use client'
import { usePathname } from "next/navigation";

import Aside from '@/components/tracking_view/aside';
import ControlPanel from '@/components/tracking_view/controlPanel';
import ClientMap from '@/components/tracking_view/map';

export default function Layout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    return (
        <main className="min-h-screen w-full">
            {pathname === '/tracking_view' ? (
                <div className="grid grid-rows-1 md:grid-cols-[35%_65%] h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <Aside>
                        <ControlPanel />
                    </Aside>
                    <section className='p-4 overflow-hidden'>
                        <ClientMap />
                    </section>
                </div>

            ) :
                <div className="grid md:grid-cols-[3%_97%] h-screen w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <Aside />
                    {children}
                </div>
            }
        </main>
    );
}