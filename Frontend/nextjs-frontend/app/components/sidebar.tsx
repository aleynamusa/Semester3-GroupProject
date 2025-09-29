'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import logo from '../../public/yourlogo.png';
import { SignOutButton } from './signoutButton';

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        // {
        //     name: 'Account',
        //     href: '/account',
        //     icon: <i className="fa fa-user-circle-o text-white" style={{fontSize: '24px'}} />},
        {
            name: 'Machine Monitoring',
            href: '/machine-dashboard',
            icon: <i className="fa fa-exclamation-circle text-white" style={{fontSize: '24px'}}></i>
        },
        {
            name: 'Mold Graph',
            href: '/moldgraph',
            icon: <i className="fa fa-pie-chart" aria-hidden="true"></i>
        },
        {
            name: 'Mold Health',
            href: '/mold-health',
            icon: <i className="fa fa-check-square-o text-white" style={{fontSize: '24px'}}></i>
        },
    ];

    const [open, setOpen] = useState(false);

    return (
        <div
            className={`bg-[#222523] text-white fixed h-screen transition-all duration-300 z-20
            ${open ? 'w-60' : 'w-0 md:w-60'} overflow-hidden`}
        >

            <div className="flex flex-col h-full">

                <div className="flex justify-center mt-6 mb-4">
                    <div className="relative w-35 h-35">
            <Image
            src={logo}
            fill
            style={{ objectFit: "contain" }} alt="Default avatar" />
          </div>
        </div>

        <nav className="mt-4 flex-1 px-2">
          <ul className="flex flex-col space-y-2">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className={`flex items-center w-full rounded-md px-3 py-2 transition-colors duration-200
                      ${active ? 'bg-gray-800 text-[#00A527]' : 'text-gray-300 hover:text-white hover:bg-gray-700 text-[1.1rem]'}`}
                    aria-current={active ? 'page' : undefined}
                  >
                    <div className="w-10 flex justify-center">
                      {link.icon}
                    </div>

                    <div className="flex-1 text-center">
                      {link.name}
                    </div>

                    <div className="w-10" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="px-[4rem] pb-6">
          <SignOutButton />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
