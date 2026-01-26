'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthStatus } from './AuthStatus';

export default function Header() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/focus', label: 'Focus' },
    { href: '/analysis', label: 'Analysis' },
    { href: '/tasks', label: 'Tasks' },
    { href: '/settings', label: 'Settings' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-md border-b border-gray-800/50">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
            Aegis
          </Link>
          
          <div className="flex items-center gap-6">
            <div className="flex gap-6">
              {links.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm transition-colors duration-200 ${
                    pathname === link.href
                      ? 'text-purple-400 font-medium'
                      : 'text-gray-400 hover:text-purple-300'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="border-l border-gray-700 pl-6">
              <AuthStatus />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
