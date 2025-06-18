'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { HAW_LANDSHUT_EMAIL_DOMAIN } from '@/lib/constants';
import { Loader2 } from 'lucide-react';

const registrationSchema = z.object({
  email: z.string().email({ message: 'Ungültige E-Mail-Adresse.' })
    .refine(email => email.endsWith(HAW_LANDSHUT_EMAIL_DOMAIN), {
      message: `Nur E-Mails der Domain ${HAW_LANDSHUT_EMAIL_DOMAIN} sind erlaubt.`,
    }),
  password: z.string().min(6, { message: 'Passwort muss mindestens 6 Zeichen lang sein.' }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein.',
  path: ['confirmPassword'], // path to field that gets the error
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

interface RegistrationFormProps {
  onSwitchToLogin: () => void;
}

export function RegistrationForm({ onSwitchToLogin }: RegistrationFormProps) {
  const { register } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: RegistrationFormValues) {
    setIsLoading(true);
    try {
      await register(data.email, data.password);
      // Redirect to /profil-erstellen is handled by AuthContext/AuthGuard
      toast({
        title: 'Registrierung erfolgreich',
        description: 'Sie werden nun zur Profilerstellung weitergeleitet.',
      });
    } catch (error: any) {
      toast({
        title: 'Registrierungsfehler',
        description: error.message || 'Registrierung fehlgeschlagen. Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>E-Mail</FormLabel>
              <FormControl>
                <Input type="email" placeholder={`name${HAW_LANDSHUT_EMAIL_DOMAIN}`} {...field} />
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
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Passwort bestätigen</FormLabel>
              <FormControl>
                <Input type="password" placeholder="********" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Registrieren
        </Button>
      </form>
    </Form>
  );
}
