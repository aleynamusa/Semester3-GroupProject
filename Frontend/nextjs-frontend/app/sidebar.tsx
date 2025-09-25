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
        {/* Sidebar */}
            <div
                className="bg-gray-800 text-white fixed h-screen transition-all duration-300 z-10 w-1/7"
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
                                    ? '' // Remove tailwind classes for active state
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

            {/* for smaller screen */}
            {/*<div className={`flex-1 p-4 ${isOpen ? 'ml-64' : 'ml-0'}`}>*/}
            {/*    /!* Button fixed bottom center *!/*/}
            {/*    <div className="ml-auto">*/}
            {/*        <button*/}
            {/*            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"*/}
            {/*            onClick={() => setIsOpen(!isOpen)}*/}
            {/*        >*/}
            {/*            {isOpen ? (*/}
            {/*                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
            {/*                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />*/}
            {/*                </svg>*/}
            {/*            ) : (*/}
            {/*                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">*/}
            {/*                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />*/}
            {/*                </svg>*/}
            {/*            )}*/}
            {/*        </button>*/}
            {/*    </div>*/}
            {/*</div>*/}
        </div>
    );
};

export default Sidebar;
