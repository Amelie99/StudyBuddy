
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
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' }),
  password: z.string().min(1, { message: 'Passwort ist erforderlich.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { sendPasswordReset } = useAuth();


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function handleDemoLogin() {
    setIsLoading(true);
    try {
      // Hardcoded login for demonstration purposes
      await login('max.mustermann@stud.haw-landshut.de', 'password');
      // Redirect is handled by AuthContext
    } catch (error: any) {
      toast({
        title: 'Anmeldefehler',
        description: String(error?.message || 'Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.'),
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
      setShowPasswordReset(false);
      setResetEmail('');
    } catch (error: any) {
      toast({ title: 'Fehler', description: String(error?.message || 'Fehler beim Senden der E-Mail zum Zurücksetzen des Passworts.'), variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }


  if (showPasswordReset) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-center">Passwort zurücksetzen</h2>
          <p className="text-center text-sm text-muted-foreground">
            Geben Sie Ihre E-Mail-Adresse ein, um Ihr Passwort zurückzusetzen.
          </p>
        </div>
        <div className="space-y-4">
          <div>
            <Label htmlFor="reset-email">E-Mail</Label>
            <Input 
              id="reset-email" 
              type="email" 
              placeholder="name@stud.haw-landshut.de" 
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)} 
              disabled={isLoading}
            />
          </div>
          <Button onClick={handlePasswordReset} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Link zum Zurücksetzen senden
          </Button>
          <Button variant="link" onClick={() => setShowPasswordReset(false)} className="w-full">
            Zurück zum Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <div className="text-center text-sm text-muted-foreground bg-secondary p-3 rounded-md">
            Für Demozwecke ist keine Eingabe erforderlich. Klicken Sie einfach auf "Anmelden".
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@stud.haw-landshut.de" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="button" onClick={handleDemoLogin} className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Anmelden
        </Button>
        <div className="text-center text-sm">
          <Button variant="link" type="button" onClick={() => setShowPasswordReset(true)}>
            Passwort vergessen?
          </Button>
        </div>
      </form>
    </Form>
  );
}
