'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  bloodType: z.string().min(2, 'Required').max(5, 'Invalid'),
  allergies: z.string().optional(),
  prescriptions: z.string().optional(),
  emergencyContact: z.string().min(10, 'Enter a valid phone number').optional(),
});

type QrInfo = z.infer<typeof formSchema>;

export default function MyQrInfoPage() {
  const { getTranslation } = useLanguage();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<QrInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodType: '',
      allergies: '',
      prescriptions: '',
      emergencyContact: '',
    },
  });

  useEffect(() => {
    async function fetchQrInfo() {
      if (!userId) return;
      setIsLoading(true);
      try {
        const docRef = doc(db, 'users', userId, 'qrInfo', 'data');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as QrInfo;
          form.reset(data);
          generateQrCode(data);
        }
      } catch (error) {
        console.error('Error fetching QR info:', error);
      }
      setIsLoading(false);
    }
    fetchQrInfo();
  }, [userId, form]);

  const generateQrCode = (data: QrInfo) => {
    const qrData = `
Blood Type: ${data.bloodType}
Allergies: ${data.allergies || 'None'}
Prescriptions: ${data.prescriptions || 'None'}
Emergency Contact: ${data.emergencyContact || 'None'}
    `.trim();
    setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(qrData)}`);
  };

  async function onSubmit(values: QrInfo) {
    if (!userId) {
      toast({ title: 'Error', description: 'You must be logged in to save data.', variant: 'destructive' });
      return;
    }
    try {
      const docRef = doc(db, 'users', userId, 'qrInfo', 'data');
      await setDoc(docRef, values);
      generateQrCode(values);
      toast({ title: 'Success', description: 'Your information has been saved.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save information.', variant: 'destructive' });
      console.error('Error saving QR info:', error);
    }
  }

  const translations = {
    title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
    description: { en: 'Keep your emergency info up to date.', am: 'የድንገተኛ ጊዜ መረጃዎን ወቅታዊ ያድርጉ።', om: 'Odeeffannoo yeroo hatattamaa kee haaromsi.' },
    bloodType: { en: 'Blood Type', am: 'የደም አይነት', om: 'Gosa Dhiigaa' },
    bloodTypePlaceholder: { en: 'e.g., A+', am: 'ለምሳሌ፣ A+', om: 'Fkn, A+' },
    allergies: { en: 'Allergies', am: 'አለርጂዎች', om: 'Aleerjiiwwan' },
    allergiesPlaceholder: { en: 'e.g., Peanuts, Penicillin', am: 'ለምሳሌ፣ ኦቾሎኒ፣ ፔኒሲሊን', om: 'Fkn, Ocholoonii, Penisiliinii' },
    prescriptions: { en: 'Current Prescriptions', am: 'የአሁኑ የሐኪም ማዘዣዎች', om: 'Ajajawwan Qorichaa Ammaa' },
    prescriptionsPlaceholder: { en: 'e.g., Amoxicillin 500mg', am: 'ለምሳሌ፣ አሞክሲሲሊን 500mg', om: 'Fkn, Amoxicillin 500mg' },
    emergencyContact: { en: 'Emergency Contact', am: 'የድንገተኛ ጊዜ ዕውቂያ', om: 'Quunnamtii Yeroo Hatattamaa' },
    emergencyContactPlaceholder: { en: 'e.g., +1234567890', am: 'ለምሳሌ፣ +1234567890', om: 'Fkn, +1234567890' },
    saveBtn: { en: 'Save Information', am: 'መረጃ አስቀምጥ', om: 'Odeeffannoo Olkaa\'i' },
    qrTitle: { en: 'Your Emergency QR Code', am: 'የእርስዎ የድንገተኛ QR ኮድ', om: 'Koodii QR Ariifachiisaa Kee' },
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl text-primary-foreground">{getTranslation(translations.title)}</h1>
        <p className="text-muted-foreground">{getTranslation(translations.description)}</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField control={form.control} name="bloodType" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getTranslation(translations.bloodType)}</FormLabel>
                    <FormControl><Input placeholder={getTranslation(translations.bloodTypePlaceholder)} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <FormField control={form.control} name="allergies" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getTranslation(translations.allergies)}</FormLabel>
                    <FormControl><Input placeholder={getTranslation(translations.allergiesPlaceholder)} {...field} /></FormControl>
                  </FormItem>
                )} />
              <FormField control={form.control} name="prescriptions" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getTranslation(translations.prescriptions)}</FormLabel>
                    <FormControl><Input placeholder={getTranslation(translations.prescriptionsPlaceholder)} {...field} /></FormControl>
                  </FormItem>
                )} />
              <FormField control={form.control} name="emergencyContact" render={({ field }) => (
                  <FormItem>
                    <FormLabel>{getTranslation(translations.emergencyContact)}</FormLabel>
                    <FormControl><Input type="tel" placeholder={getTranslation(translations.emergencyContactPlaceholder)} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getTranslation(translations.saveBtn)}
              </Button>
            </form>
          </Form>

          {qrCodeUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">{getTranslation(translations.qrTitle)}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Image src={qrCodeUrl} alt="Emergency QR Code" width={256} height={256} />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
