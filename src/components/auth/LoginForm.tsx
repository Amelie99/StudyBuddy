
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }),
  password: z.string().min(1, { message: 'Passwort ist erforderlich.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

// List of mock users for easy login
const mockUsers = [
    { email: 'max.mustermann@stud.haw-landshut.de', name: 'Max Mustermann' },
    { email: 'david.meier@stud.haw-landshut.de', name: 'David Meier' },
    { email: 'anna.schmidt@stud.haw-landshut.de', name: 'Anna Schmidt' },
    { email: 'julia.schneider@stud.haw-landshut.de', name: 'Julia Schneider' },
    { email: 'matthias.huber@stud.haw-landshut.de', name: 'Matthias Huber' },
];

export function LoginForm() {
  const { login, sendPasswordReset } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleLogin(email: string, password?: string) {
    setIsLoading(true);
    try {
      await login(email, password || 'password');
      // Redirect is handled by AuthContext on successful login
    } catch (error: any) {
      toast({
        title: 'Anmeldefehler',
        description: error.message || 'Anmeldung fehlgeschlagen. Bitte E-Mail und Passwort prüfen.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function onSubmit(values: LoginFormValues) {
    await handleLogin(values.email, values.password);
  }

  async function handlePasswordReset() {
    if (!resetEmail) {
      toast({ title: 'E-Mail erforderlich', description: 'Bitte geben Sie Ihre E-Mail-Adresse ein.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordReset(resetEmail);
      toast({ title: 'E-Mail gesendet', description: 'Wenn ein Konto mit dieser E-Mail existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet.' });
      setIsPasswordReset(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ title: 'Fehler', description: String(error?.message), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  if (isPasswordReset) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-center">Passwort zurücksetzen</h2>
          <p className="text-center text-sm text-muted-foreground">Geben Sie Ihre E-Mail ein, um einen Link zum Zurücksetzen zu erhalten.</p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-email">E-Mail</Label>
            <Input id="reset-email" type="email" placeholder="name@stud.haw-landshut.de" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} disabled={isLoading}/>
          </div>
          <Button onClick={handlePasswordReset} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Link senden
          </Button>
          <Button variant="link" onClick={() => setIsPasswordReset(false)} className="w-full">Zurück zum Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div>
          <h2 className="text-2xl font-bold tracking-tight text-center">Anmelden</h2>
          <p className="text-center text-sm text-muted-foreground">Wähle ein Demo-Konto oder gib deine Daten ein.</p>
        </div>

        {/* Demo User Buttons */}
        <div className="space-y-2">
            <Label>Als Demo-Nutzer anmelden</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {mockUsers.map(user => (
                    <Button key={user.email} variant="outline" onClick={() => handleLogin(user.email)} disabled={isLoading} >
                        {user.name}
                    </Button>
                ))}
            </div>
        </div>
      
        <div className="relative">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Oder manuell</span>
          </div>
        </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl><Input type="email" placeholder="name@stud.haw-landshut.de" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Passwort</FormLabel>
                <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Anmelden
          </Button>
          <div className="text-center text-sm">
            <Button variant="link" type="button" onClick={() => setIsPasswordReset(true)}>
              Passwort vergessen?
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
