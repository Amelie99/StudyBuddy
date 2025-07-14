
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { lerninteressenOptions, verfuegbarkeitOptions, studiengangOptions, semesterOptions } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, User, MessageSquare } from 'lucide-react';
import type { AppUser } from '@/lib/types';
import { collection, getDocs, query, where, QueryConstraint } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

const searchSchema = z.object({
  studiengang: z.string().optional(),
  semester: z.string().optional(),
  lerninteressen: z.array(z.string()).optional(),
  verfuegbarkeit: z.array(z.string()).optional(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

const approvedHosts = ['i.imgur.com', 'placehold.co'];
const getSafeAvatar = (url?: string) => {
    try {
        if (!url || !approvedHosts.some(host => new URL(url).hostname === host)) {
            return 'https://i.imgur.com/8bFhU43.jpeg';
        }
        return url;
    } catch (_e) {
        return 'https://i.imgur.com/8bFhU43.jpeg';
    }
};

const UserResultCard = ({ user }: { user: AppUser }) => {
    const safeAvatar = getSafeAvatar(user.photoURL);
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
                <Link href={`/profil/${user.uid}`} className="flex items-center gap-4">
                     <Avatar className="h-12 w-12">
                        <AvatarImage src={safeAvatar} alt={user.displayName || 'Avatar'} />
                        <AvatarFallback>{user.displayName?.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{user.displayName}</p>
                        <p className="text-sm text-muted-foreground">{user.studiengang} - {user.semester}. Semester</p>
                    </div>
                </Link>
                <Button variant="outline" size="sm" asChild>
                    <Link href={`/chats/${user.uid}`}>
                        <MessageSquare className="mr-2 h-4 w-4"/>
                        Nachricht
                    </Link>
                </Button>
            </CardContent>
        </Card>
    )
}

export default function PartnerSuchePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AppUser[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { currentUser } = useAuth();

  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      studiengang: '',
      semester: '',
      lerninteressen: [],
      verfuegbarkeit: [],
    },
  });

  async function onSubmit(data: SearchFormValues) {
    setIsLoading(true);
    setHasSearched(true);

    try {
        const usersRef = collection(db, 'users');
        let conditions: QueryConstraint[] = [];
        
        // Firestore is limited. We can reliably filter by one 'where' and one 'array-contains-any'.
        // Let's prioritize Studiengang for the DB query.
        if (data.studiengang && data.studiengang !== 'all') {
            conditions.push(where('studiengang', '==', data.studiengang));
        }

        const q = query(usersRef, ...conditions);
        const querySnapshot = await getDocs(q);
        
        const allFoundUsers = querySnapshot.docs
            .map(doc => ({ ...doc.data(), uid: doc.id } as AppUser));

        // Now, we filter the results on the client side for more complex logic
        const filteredResults = allFoundUsers.filter(user => {
            if (user.uid === currentUser?.uid) return false; // Exclude current user

            const semesterMatch = !data.semester || data.semester === 'all' || user.semester === data.semester;
            const interessenMatch = !data.lerninteressen || data.lerninteressen.length === 0 || data.lerninteressen.some(interesse => user.lerninteressen?.includes(interesse));
            const verfuegbarkeitMatch = !data.verfuegbarkeit || data.verfuegbarkeit.length === 0 || data.verfuegbarkeit.some(zeit => user.verfuegbarkeit?.includes(zeit));

            return semesterMatch && interessenMatch && verfuegbarkeitMatch;
        });
        
        setResults(filteredResults);
        
    } catch (error) {
        console.error("Error searching for users:", error);
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-3xl font-bold text-foreground">Detailsuche</h1>
        
        <Card>
            <CardHeader>
                <CardTitle>Partner finden</CardTitle>
                <CardDescription>Nutze die Filter, um den perfekten Lernpartner zu finden.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="studiengang" render={({ field }) => (<FormItem><FormLabel>Studiengang</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Alle Studiengänge" /></SelectTrigger></FormControl><SelectContent><SelectItem value="all">Alle</SelectItem>{studiengangOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                            <FormField control={form.control} name="semester" render={({ field }) => (<FormItem><FormLabel>Semester</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Alle Semester" /></SelectTrigger></FormControl><SelectContent><SelectItem value="all">Alle</SelectItem>{semesterOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.label}</SelectItem>)}</SelectContent></Select></FormItem>)} />
                        </div>
                        <FormField control={form.control} name="lerninteressen" render={() => (
                            <FormItem>
                                <FormLabel>Lerninteressen</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {lerninteressenOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="lerninteressen" render={({ field }) => {
                                        return (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>);
                                    }} />
                                ))}
                                </div><FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="verfuegbarkeit" render={() => (
                            <FormItem>
                                <FormLabel>Verfügbarkeit</FormLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {verfuegbarkeitOptions.map((item) => (
                                    <FormField key={item.id} control={form.control} name="verfuegbarkeit" render={({ field }) => {
                                        return (<FormItem className="flex flex-row items-center space-x-3 space-y-0"><FormControl><Checkbox checked={field.value?.includes(item.id)} onCheckedChange={(checked) => { return checked ? field.onChange([...(field.value || []), item.id]) : field.onChange(field.value?.filter((value) => value !== item.id));}} /></FormControl><FormLabel className="font-normal">{item.label}</FormLabel></FormItem>);
                                    }} />
                                ))}
                                </div><FormMessage />
                            </FormItem>
                        )} />
                        <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                            Suchen
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        {hasSearched && (
            <Card>
                <CardHeader>
                    <CardTitle>Ergebnisse ({results.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {isLoading ? (
                         <div className="flex justify-center items-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : results.length > 0 ? (
                        results.map(user => <UserResultCard key={user.uid} user={user} />)
                    ) : (
                        <div className="text-center text-muted-foreground p-8">
                            <User className="mx-auto h-12 w-12 mb-4" />
                            <p>Keine passenden Profile gefunden.</p>
                            <p className="text-sm">Versuche, deine Filter anzupassen.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        )}
    </div>
  );
}
