'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, ClipboardCheck, FileCheck, Calendar, Award, QrCode } from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Members', icon: Users },
  { href: '/admin/check-ins', label: 'Check-ins', icon: ClipboardCheck },
  { href: '/admin/waivers', label: 'Waivers', icon: FileCheck },
  { href: '/admin/classes', label: 'Classes', icon: Calendar },
  { href: '/admin/promotions', label: 'Promotions', icon: Award },
  { href: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="bg-black/30 backdrop-blur-sm border-b border-gray-800/50 sticky top-[73px] md:top-[81px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 md:gap-2 overflow-x-auto py-2 scrollbar-hide">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 md:px-4 md:py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-white text-black shadow-lg shadow-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-gray-500'}`} />
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
