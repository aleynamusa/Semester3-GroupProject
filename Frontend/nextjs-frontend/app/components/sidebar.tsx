'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignOutButton } from './signoutButton';
import ThemeToggle from './ThemeToggle';
import { createClient } from '@/lib/supabase/client';

const Sidebar = () => {
    const pathname = usePathname();

    // Fetch user username
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
  const supabase = createClient();

  const fetchUser = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) {
      console.error('Failed to get user', error);
      return;
    }

    const user = 'user' in data ? data.user : data;

    // Access username from user_metadata
    if (user?.user_metadata?.username) {
      setUsername(user.user_metadata.username);
    }
  };

  fetchUser();
}, []);

    const links = [
        // {
        //     name: 'Account',
        //     href: '/account',
        //     icon: <i className="fa fa-user-circle-o text-white" style={{fontSize: '24px'}} />},
        {
            name: 'Machine Monitoring',
            href: '/machine-dashboard',
            icon: <i className="fa fa-exclamation-circle text-white" style={{fontSize: '28px'}}></i>
        },
        {
            name: 'Mold Health',
            href: '/mold-health',
            icon: <i className="fa fa-plus-square text-white" style={{fontSize: '26px'}}></i>
        },
        {
            name: 'Mold Graph',
            href: '/moldgraph',
            icon: <i className="fa fa-bar-chart text-white" style={{fontSize: '24px'}}></i>
        }
      ];

    const [open, setOpen] = useState(false);

    return (
        <div
            className={`bg-[#222523] text-white fixed h-screen transition-all duration-300 z-20
            ${open ? 'w-60' : 'w-0 md:w-60'} overflow-hidden`}
        >

        <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-600">
          <ThemeToggle />
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

        <div className="px-[4rem] pb-4 flex flex-col items-center">
          <SignOutButton />
          <p className="mt-2 text-[1rem] font-semibold text-gray-100 dark:text-gray-100 text-center">
            {username ? username : 'User'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
