
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@/components/ui/label';

export default function BenachrichtigungenPage() {
    const router = useRouter();

    const generalSettings = [
        { id: 'push', label: 'Push-Benachrichtigungen aktivieren/deaktivieren', defaultChecked: true },
        { id: 'email', label: 'Benachrichtigungen per E-Mail erhalten', defaultChecked: true },
        { id: 'sound', label: 'Sound/Vibration bei Push aktivieren (mobil)', defaultChecked: false },
    ];

    const advancedSettings = [
        { id: 'newPartner', label: 'Benachrichtigung bei neuem Lernpartner', defaultChecked: true },
        { id: 'reminder', label: 'Erinnerung an geplante Lernzeiten', defaultChecked: true },
        { id: 'updates', label: 'Hinweise zu neuen Funktionen oder Updates', defaultChecked: true },
        { id: 'recommendations', label: 'Empfehlungen basierend auf Interessen', defaultChecked: false },
    ];

    return (
        <div className="container mx-auto py-8">
            <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Zurück zu den Einstellungen
            </Button>
            <Card className="max-w-2xl mx-auto">
                <CardHeader>
                    <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Benachrichtigungen</CardTitle>
                    <CardDescription>Verwalte, wie und wann du benachrichtigt wirst.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Allgemein</h3>
                        <div className="space-y-4">
                            {generalSettings.map(setting => (
                                <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <Label htmlFor={setting.id} className="flex-1 pr-4 cursor-pointer">{setting.label}</Label>
                                    <Switch id={setting.id} defaultChecked={setting.defaultChecked} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <Separator />
                     <div>
                        <h3 className="text-lg font-semibold mb-4">Erweitert</h3>
                        <div className="space-y-4">
                            {advancedSettings.map(setting => (
                                <div key={setting.id} className="flex items-center justify-between p-3 rounded-lg border">
                                    <Label htmlFor={setting.id} className="flex-1 pr-4 cursor-pointer">{setting.label}</Label>
                                    <Switch id={setting.id} defaultChecked={setting.defaultChecked}/>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
