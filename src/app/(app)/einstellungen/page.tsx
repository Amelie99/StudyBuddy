
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Bell, Palette, Shield, Info, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

const settingsOptions = [
  {
    title: 'Benachrichtigungen',
    icon: Bell,
    href: '#',
  },
  {
    title: 'Design',
    icon: Palette,
    href: '#',
  },
  {
    title: 'Datenschutz',
    icon: Shield,
    href: '#',
  },
  {
    title: 'Über uns',
    icon: Info,
    href: '#',
  },
];

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
                <li key={option.title}>
                    <Link href={option.href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-background">
                        <div className="flex items-center p-4 hover:bg-accent/50 transition-colors cursor-pointer rounded-lg">
                            <option.icon className="h-5 w-5 mr-4 text-muted-foreground" />
                            <div className="flex-grow">
                                <p className="font-medium">{option.title}</p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </Link>
                </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
