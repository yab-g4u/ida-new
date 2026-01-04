'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useMemo, useRef } from 'react';
import QRCode from 'qrcode.react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/auth-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, Download } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

const formSchema = z.object({
  name: z.string().min(2, 'Required'),
  bloodType: z.string().min(1, 'Required').max(5, 'Invalid'),
  allergies: z.string().optional(),
  prescriptions: z.string().optional(),
  medicalNotes: z.string().optional(),
  qrData: z.string().optional(),
});

type QrInfo = z.infer<typeof formSchema>;

export default function MyQrInfoPage() {
  const { getTranslation } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [qrCodeValue, setQrCodeValue] = useState('');
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const form = useForm<QrInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      bloodType: '',
      allergies: '',
      prescriptions: '',
      medicalNotes: '',
      qrData: '',
    },
  });
  
  const translations = useMemo(() => ({
    title: { en: 'My Medical ID', am: 'የእኔ የህክምና መታወቂያ', om: 'Waraqaa Eenyummaa Yaalaa Koo' },
    description: { en: 'Keep your emergency info up to date. This QR code is your digital medical ID.', am: 'የድንገተኛ ጊዜ መረጃዎን ወቅታዊ ያድርጉ። ይህ የQR ኮድ የእርስዎ ዲጂታል የህክምና መታወቂያ ነው።', om: 'Odeeffannoo yeroo hatattamaa kee haaromsi. Koodiin QR kun waraqaa eenyummaa yaalaa dijitaalaa keeti.' },
    name: {en: 'Full Name', am: 'ሙሉ ስም', om: 'Maqaa Guutuu'},
    bloodType: { en: 'Blood Type', am: 'የደም አይነት', om: 'Gosa Dhiigaa' },
    bloodTypePlaceholder: { en: 'e.g., A+', am: 'ለምሳሌ፣ A+', om: 'Fkn, A+' },
    allergies: { en: 'Allergies', am: 'አለርጂዎች', om: 'Aleerjiiwwan' },
    allergiesPlaceholder: { en: 'e.g., Peanuts, Penicillin', am: 'ለምሳሌ፣ ኦቾሎኒ፣ ፔኒሲሊን', om: 'Fkn, Ocholoonii, Penisiliinii' },
    prescriptions: { en: 'Current Prescriptions', am: 'የአሁኑ የሐኪም ማዘዣዎች', om: 'Ajajawwan Qorichaa Ammaa' },
    prescriptionsPlaceholder: { en: 'e.g., Amoxicillin 500mg', am: 'ለምሳሌ፣ አሞክሲሲሊን 500mg', om: 'Fkn, Amoxicillin 500mg' },
    medicalNotes: {en: 'Medical Notes', am: 'የህክምና ማስታወሻዎች', om: 'Yaadannoowwan Yaalaa'},
    medicalNotesPlaceholder: {en: 'Chronic conditions, past surgeries, etc.', am: 'ሥር የሰደዱ በሽታዎች፣ ያለፉ ቀዶ ጥገናዎች፣ ወዘተ.', om: 'Dhukkuboota yeroo dheeraa, baqaqsanii yaaluu darbe, kkf.'},
    saveBtn: { en: 'Generate & Save Information', am: 'አመንጭ እና መረጃ አስቀምጥ', om: 'Uumi & Odeeffannoo Olkaa\'i' },
    qrTitle: { en: 'Your Emergency QR Code', am: 'የእርስዎ የድንገተኛ QR ኮድ', om: 'Koodii QR Ariifachiisaa Kee' },
    saveSuccess: { en: 'Your information has been summarized and saved.', am: 'የእርስዎ መረጃ ተጠቃልሎ ተቀምጧል።', om: 'Odeeffannoon kee gabaabfamee olkaa\'ameera.'},
    saveError: { en: 'Failed to save information.', am: 'መረጃ ማስቀመጥ አልተቻለም።', om: 'Odeeffannoo olkaa\'uun hin danda\'amne.'},
    noQrCode: { en: 'Your QR Code will appear here once you generate it.', am: 'የእርስዎ QR ኮድ ካመነጩት በኋላ እዚህ ይታያል።', om: 'Koodiin QR kee erga uumtee booda asitti mul\'ata.'},
    successTitle: {en: "Success", am: "ተሳክቷል", om: "Milkaa'eera"},
    errorTitle: {en: "Error", am: "ስህተት", om: "Dogoggora"},
    uniqueId: {en: "Your Unique ID", am: "የእርስዎ ልዩ መታወቂያ", om: "Eenyummaa Kee Isa Addaa"},
    summarizing: {en: "Generating...", am: "በማመንጨት ላይ...", om: "Uumamaa jira..."},
    downloadQR: { en: "Download QR", am: "QR አውርድ", om: "QR Buufadhu" },
    downloadSuccess: { en: "QR Code Downloaded", am: "QR ኮድ ወርዷል", om: "Koodiin QR Bu'eera" },
  }), [getTranslation]);
  
  useEffect(() => {
    if (!user?.uid) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    try {
      const storedData = localStorage.getItem(`ida-qr-info-${user.uid}`);
      if (storedData) {
        const data = JSON.parse(storedData) as QrInfo;
        form.reset(data);
        if (data.qrData) {
          setQrCodeValue(data.qrData);
        }
      } else {
         form.reset({ name: user.displayName || '' });
      }
    } catch (e) {
      console.warn("Could not access localStorage for QR info.");
    }
    setIsLoading(false);
  }, [user, form]);


  async function onSubmit(values: QrInfo) {
    if (!user?.uid) return;
    
    setIsSubmitting(true);

    try {
      const vitalInfo = {
        N: values.name,
        B: values.bloodType,
        A: values.allergies,
        M: values.prescriptions,
        C: values.medicalNotes,
      };

      const summarizedJson = JSON.stringify(vitalInfo);
      
      setQrCodeValue(summarizedJson);

      const finalValues = {
        ...values,
        qrData: summarizedJson,
      };

      localStorage.setItem(`ida-qr-info-${user.uid}`, JSON.stringify(finalValues));
      form.reset(finalValues);
      
      toast({ title: getTranslation(translations.successTitle), description: getTranslation(translations.saveSuccess) });
    } catch (error) {
      toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.saveError), variant: 'destructive' });
      console.error('Error saving QR info:', error);
    } finally {
        setTimeout(() => setIsSubmitting(false), 500);
    }
  }

  const handleDownload = () => {
    const canvas = qrCodeRef.current?.querySelector('canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `IDA_QR_Code_${user?.uid}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: getTranslation(translations.successTitle), description: getTranslation(translations.downloadSuccess) });
    }
  };

  return (
    <ScrollArea className="h-screen">
      <div className="p-4 md:p-6 space-y-6">
        <header>
          <h1 className="font-headline text-3xl md:text-4xl text-foreground">{getTranslation(translations.title)}</h1>
          <p className="text-muted-foreground text-sm md:text-base">{getTranslation(translations.description)}</p>
        </header>
        {user?.uid && (
          <Card className="bg-muted border-dashed">
              <CardHeader className='pb-2'>
                  <CardDescription>{getTranslation(translations.uniqueId)}</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="flex items-center gap-2 bg-background p-2 rounded-md">
                      <User className="h-4 w-4 text-muted-foreground"/>
                      <p className="text-xs text-muted-foreground font-mono break-all">{user.uid}</p>
                  </div>
              </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getTranslation(translations.name)}</FormLabel>
                      <FormControl><Input placeholder={getTranslation(translations.name)} {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
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
                <FormField control={form.control} name="medicalNotes" render={({ field }) => (
                    <FormItem>
                      <FormLabel>{getTranslation(translations.medicalNotes)}</FormLabel>
                      <FormControl><Textarea rows={4} placeholder={getTranslation(translations.medicalNotesPlaceholder)} {...field} /></FormControl>
                    </FormItem>
                  )} />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {getTranslation(translations.summarizing)}
                    </>
                  ) : (
                    getTranslation(translations.saveBtn)
                  )}
                </Button>
              </form>
            </Form>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">{getTranslation(translations.qrTitle)}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center items-center p-4">
                      {qrCodeValue ? (
                          <div ref={qrCodeRef} className='bg-white p-4 rounded-lg'>
                            <QRCode value={qrCodeValue} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} bgColor="white" fgColor="black" level="H" renderAs="canvas" />
                          </div>
                      ) : (
                          <div className="w-full aspect-square bg-muted rounded-md flex items-center justify-center text-muted-foreground text-center p-4">
                              <p>{getTranslation(translations.noQrCode)}</p>
                          </div>
                      )}
                    </CardContent>
                </Card>
                {qrCodeValue && (
                  <Button onClick={handleDownload} className="w-full gap-2">
                    <Download className="h-4 w-4" />
                    {getTranslation(translations.downloadQR)}
                  </Button>
                )}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
