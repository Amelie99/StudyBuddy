'use client';

import { Loader2 } from 'lucide-react';
// useEffect, useRouter, useAuth have been removed as AuthContext now handles redirection logic for the root page.

export default function HomePage() {
  // AuthContext will handle redirection from '/', so this page
  // will likely only show briefly or if AuthContext is still loading.
  return (
    <div className="flex h-screen w-full items-center justify-center bg-transparent">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  );
}
