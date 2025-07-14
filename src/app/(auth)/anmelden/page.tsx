'use client';

import { useState } from 'react';
import Link from 'next/link';
import HochschuleLogo from '@/components/layout/HochschuleLogo';
import { PRIVACY_POLICY_URL } from '@/lib/constants';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegistrationForm } from '@/components/auth/RegistrationForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function AnmeldenPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="items-center text-center">
        <HochschuleLogo className="h-16 w-auto mb-4" />
        <CardTitle className="text-3xl font-bold tracking-tight">
          {isLoginView ? 'Willkommen zurück!' : 'Konto erstellen'}
        </CardTitle>
        <CardDescription>
          {isLoginView ? 'Melden Sie sich bei StudyBuddy an.' : `Registrieren Sie sich für StudyBuddy an der HS Landshut.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoginView ? (
          <LoginForm/>
        ) : (
          <RegistrationForm/>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-center space-y-4">
        <Button variant="link" onClick={() => setIsLoginView(!isLoginView)} className="text-sm">
          {isLoginView ? 'Noch kein Konto? Jetzt registrieren' : 'Bereits ein Konto? Anmelden'}
        </Button>
        <Link href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary underline">
          Datenschutzrichtlinie der Hochschule Landshut
        </Link>
      </CardFooter>
    </Card>
  );
}
