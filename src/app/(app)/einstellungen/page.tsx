
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bell, Palette, Shield, Info, ChevronRight, Moon, Sun, Mail, Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import { PRIVACY_POLICY_URL } from '@/lib/constants';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from "next/image";


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
    href: '#', // Handled specially as a dialog
  },
];

const TikTokIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.03-4.83-.95-6.43-2.88-1.59-1.91-2.3-4.59-1.92-7.18.38-2.59 1.99-4.82 4.23-5.99.87-.45 1.82-.76 2.79-.92.02-3.33-.01-6.66.02-9.98Z"></path>
    </svg>
);


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

    <Card className="max-w-2xl bg-card/80 backdrop-blur-sm">
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {settingsOptions.map((option) => (
              <li key={option.id}>
                  {option.id === 'about' ? (
                      <Dialog>
                          <DialogTrigger asChild>
                              <div className="flex items-center p-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg w-full">
                                  <option.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                                  <div className="flex-grow">
                                      <p className="font-medium">{option.title}</p>
                                  </div>
                                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                              </div>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                  <DialogTitle className="text-center text-2xl">Über uns</DialogTitle>
                                  <DialogDescription className="text-center pt-4 text-base text-foreground">
                                  Von Amelie Braun und Annemarie Korber
                                  <br />
                                  Hochschule für angewandte Wissenschaften Landshut
                                  </DialogDescription>
                              </DialogHeader>
                              <div className="flex justify-center items-center pt-4 gap-4">
                                  <Button variant="default" size="icon" className="rounded-full h-12 w-12"><Instagram className="h-6 w-6" /></Button>
                                  <Button variant="default" size="icon" className="rounded-full h-12 w-12"><TikTokIcon className="h-6 w-6" /></Button>
                                  <Button variant="default" size="icon" className="rounded-full h-12 w-12"><Youtube className="h-6 w-6" /></Button>
                                  <Button variant="default" size="icon" className="rounded-full h-12 w-12"><Linkedin className="h-6 w-6" /></Button>
                                  <Button variant="default" size="icon" className="rounded-full h-12 w-12"><Facebook className="h-6 w-6" /></Button>
                              </div>
                          </DialogContent>
                      </Dialog>
                  ) : option.href ? (
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
