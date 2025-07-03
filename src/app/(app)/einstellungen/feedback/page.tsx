'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Send, ArrowLeft } from 'lucide-react';

const feedbackSchema = z.object({
  feedback: z.string().min(10, { message: 'Feedback muss mindestens 10 Zeichen lang sein.' }).max(2000, { message: 'Feedback darf maximal 2000 Zeichen lang sein.' }),
});

type FeedbackFormValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FeedbackFormValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedback: '',
    },
  });

  async function onSubmit(data: FeedbackFormValues) {
    setIsLoading(true);
    console.log('Feedback submitted:', data.feedback);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Feedback gesendet!',
      description: 'Vielen Dank für dein Feedback. Wir wissen das zu schätzen.',
    });
    router.back();
    setIsLoading(false);
  }

  return (
    <div className="container mx-auto py-8">
       <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück zu den Einstellungen
        </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight">Feedback geben</CardTitle>
          <CardDescription>Hast du Vorschläge, Wünsche oder einen Fehler gefunden? Lass es uns wissen!</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="feedback"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dein Feedback</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Schreibe hier dein Feedback..."
                        className="min-h-[150px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Feedback absenden
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
