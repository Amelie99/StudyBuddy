
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bell, Palette, Shield, Info, ChevronRight, Moon, Sun, Mail } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { PRIVACY_POLICY_URL } from '@/lib/constants';


const settingsOptions = [
  {
    id: 'notifications',
    title: 'Benachrichtigungen',
    icon: Bell,
    href: '/einstellungen/benachrichtigungen',
  },
  {
    id: 'design',
    title: 'Design',
    icon: Palette,
    href: null, // Indicates it's not a link
  },
  {
    id: 'privacy',
    title: 'Datenschutz',
    icon: Shield,
    href: PRIVACY_POLICY_URL,
  },
  {
    id: 'feedback',
    title: 'Feedback',
    icon: Mail,
    href: '/einstellungen/feedback',
  },
  {
    id: 'about',
    title: 'Über uns',
    icon: Info,
    href: '#',
  },
];

function ThemeSwitch() {
    const { theme, setTheme } = useTheme();
    const [isMounted, setIsMounted] = React.useState(false);

    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }

    const isDark = theme === 'dark';

    return (
         <div className="flex items-center space-x-2">
            <Sun className={`h-5 w-5 transition-colors ${!isDark ? 'text-primary' : 'text-muted-foreground'}`}/>
            <Switch
                id="theme-switch"
                checked={isDark}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                aria-label="Theme-Schalter"
            />
            <Moon className={`h-5 w-5 transition-colors ${isDark ? 'text-primary' : 'text-muted-foreground'}`}/>
        </div>
    )
}


export default function EinstellungenPage() {
  return (
    <div className="container mx-auto py-8">
       <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Einstellungen</h1>
        <p className="text-muted-foreground">Verwalten Sie Ihre Konto- und App-Einstellungen.</p>
       </div>

      <Card className="max-w-2xl">
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {settingsOptions.map((option) => (
                <li key={option.id}>
                    {option.href ? (
                         <Link 
                            href={option.href} 
                            target={option.href.startsWith('http') ? '_blank' : undefined}
                            rel={option.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                            className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background">
                            <div className="flex items-center p-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg">
                                <option.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                                <div className="flex-grow">
                                    <p className="font-medium">{option.title}</p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                        </Link>
                    ) : (
                         <div className="flex items-center p-4">
                            <option.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                            <div className="flex-grow">
                                <p className="font-medium">{option.title}</p>
                            </div>
                            {option.id === 'design' && <ThemeSwitch />}
                        </div>
                    )}
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
