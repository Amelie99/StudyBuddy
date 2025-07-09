
import { Suspense } from 'react';
import EventErstellenForm from '@/components/kalender/EventErstellenForm';
import { Loader2 } from 'lucide-react';

export default function EventErstellenPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <EventErstellenForm />
    </Suspense>
  );
}
