'use client'
import React, { useEffect, useState } from 'react'
import Icons from '../ui/icons'
import { usePathname } from 'next/navigation'
import useLogout from '@/hooks/auth/useLogout'

export default function Aside({ children }: { children?: React.ReactNode }) {
    const {logout} = useLogout();
    const pathname = usePathname();
    const [isHome, setisHome] = useState(true)

    useEffect(() => {
        pathname === '/tracking_view' ? setisHome(true) : setisHome(false)

    }, [pathname])


    return (
        <section className="text-black dark:text-white w-full h-full">
            <div className={`${isHome ? "grid grid-cols-[10%_90%]" : ""} h-full w-full bg-gray-100 dark:bg-gray-900`}>
                <aside className='bg-brand-blue flex flex-col items-center justify-between h-full min-w-[50px]'>
                    <div>
                        <Icons name="bxs-home" link='tracking_view/'/>
                        <Icons name="bxs-devices" link='devices'/>
                        <Icons name="bx-user-circle" link='drivers'/>
                        <Icons name="bx-notepad" link='report'/>
                    </div>
                    <div>
                        <Icons name="bx-door-open" bg={true} onClick={logout}/>
                    </div>

                </aside>
                {isHome &&
                    <section className='overflow-y-auto custom-scrollbar'>
                        {children}
                    </section>
                }
            </div>
        </section>
    )
}
