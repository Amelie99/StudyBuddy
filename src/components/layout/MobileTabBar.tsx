'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS_CONFIG, type NavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function MobileTabBar() {
  const pathname = usePathname();

  const isActive = (item: NavItem) => {
    if (item.matchSubpaths) {
      return pathname.startsWith(item.href);
    }
    return pathname === item.href;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-card shadow-top md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {NAV_ITEMS_CONFIG.filter(item => ['/dashboard', '/partner-finden', '/chats', '/mein-profil'].includes(item.href)).slice(0,4).map((item) => ( // Show limited items for mobile
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors',
              isActive(item) ? 'text-primary' : ''
            )}
            aria-current={isActive(item) ? 'page' : undefined}
          >
            <item.icon className={cn('h-6 w-6', isActive(item) ? 'text-primary' : '')} />
            <span className="mt-1 text-xs">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
