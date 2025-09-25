'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        {
            name: 'Account',
            href: '/account',
            icon: <i className="fa fa-user-circle-o text-white" style={{fontSize: '24px'}} />},
        {
            name: 'Machine Monitoring',
            href: '/machine_monitoring',
            icon: <i className="fa fa-exclamation-circle text-white" style={{fontSize: '24px'}}></i>
        },
        {
            name: 'Mold Health',
            href: '#',
            icon: <i className="fa fa-check-square-o text-white" style={{fontSize: '24px'}}></i>},
    ];

    return (
        <div className="flex">

            <div
                className="bg-gray-800 text-white fixed h-screen transition-all duration-300 z-10 w-1/6"
            >
                <div className="flex flex-col items-center">
                    <img
                        className="w-20 h-20 rounded-sm p-8"
                        src="/img"
                        alt="Default avatar"
                    />

                    <div className="mt-4 flex flex-col space-y-4">
                        {links.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200
        ${pathname === link.href
                                    ? ''
                                    : 'text-gray-300 hover:text-white hover:bg-gray-700'
                                }`}
                                style={pathname === link.href ? {
                                    color: 'green',
                                    textDecoration: 'underline'
                                } : {}}
                            >

                                {link.icon}   {link.name}
                            </Link>
                        ))}
                    </div>

                    <div className="absolute bottom-4 w-full flex justify-center">
                        <button
                            type="button"
                            className="text-white bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700
                                       hover:bg-gradient-to-br focus:ring-4 focus:outline-none
                                       focus:ring-blue-300 dark:focus:ring-blue-800 font-medium
                                       rounded-lg text-sm px-5 py-2.5 text-center"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default Sidebar;
