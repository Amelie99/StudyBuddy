'use client';
// This page can be a distinct registration page if needed.
// For now, it redirects to /anmelden, which has a toggle between login and registration.
// This simplifies the UI to one entry point for auth.
// If a separate /registrierung page is strictly required, its content would be similar to 
// the registration part of AnmeldenPage.tsx.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegistrierungPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main login/signup page which has the toggle
    // and pass a query param to default to registration view if desired
    router.replace('/anmelden?view=register'); 
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <p>Weiterleitung zur Registrierung...</p>
    </div>
  );
}
