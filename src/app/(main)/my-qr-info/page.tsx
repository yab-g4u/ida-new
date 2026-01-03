'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode.react';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/auth-provider';
import { useFirestore } from '@/firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, X, User } from 'lucide-react';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Textarea } from '@/components/ui/textarea';
// import { summarizeMedicalInfo } from '@/ai/flows/summarize-medical-info';

// declare const Tesseract: any;

const formSchema = z.object({
  name: z.string().min(2, 'Required'),
  bloodType: z.string().min(1, 'Required').max(5, 'Invalid'),
  allergies: z.string().optional(),
  prescriptions: z.string().optional(),
  medicalNotes: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
  }).optional(),
  pdfUrl: z.string().url().optional(),
  pdfFileName: z.string().optional(),
  qrData: z.string().optional(),
});

type QrInfo = z.infer<typeof formSchema>;

export default function MyQrInfoPage() {
  const { getTranslation } = useLanguage();
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const storage = useMemo(() => db ? getStorage(db.app) : null, [db]);

  const form = useForm<QrInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.displayName || '',
      bloodType: '',
      allergies: '',
      prescriptions: '',
      medicalNotes: '',
      emergencyContact: { name: '', phone: '' },
      pdfUrl: '',
      pdfFileName: '',
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
    uploadPdf: { en: 'Upload Medical PDF', am: 'የህክምና PDF ስቀል', om: 'PDF Yaalaa Ol-Guuti' },
    uploadPdfDesc: { en: 'Upload a PDF with more medical details (optional).', am: 'ተጨማሪ የህክምና ዝርዝሮች ያለው PDF ይስቀሉ (አማራጭ)።', om: 'PDF tarreeffama yaalaa dabalataa qabu ol guuti (filannoo).' },
    uploadedFile: { en: 'Uploaded File:', am: 'የተሰቀለ ፋይል፡', om: 'Faayili Ol-Guutame:'},
    removeFile: {en: 'Remove', am: 'አስወግድ', om: 'Haqi'},
    newFile: { en: 'New:', am: 'አዲስ፡', om: 'Haaraa:'},
    loadingError: { en: 'Failed to load your information.', am: 'የእርስዎን መረጃ መጫን አልተቻለም።', om: 'Odeeffannoo kee feesisuun hin danda\'amne.'},
    loginError: { en: 'You must be logged in to save data.', am: 'መረጃ ለማስቀመጥ መግባት አለብዎት።', om: 'Odeeffannoo olkaa\'uuf seentu galmeessuu qabda.'},
    saveSuccess: { en: 'Your information has been summarized and saved.', am: 'የእርስዎ መረጃ ተጠቃልሎ ተቀምጧል።', om: 'Odeeffannoon kee gabaabfamee olkaa\'ameera.'},
    saveError: { en: 'Failed to save information.', am: 'መረጃ ማስቀመጥ አልተቻለም።', om: 'Odeeffannoo olkaa\'uun hin danda\'amne.'},
    invalidFile: { en: 'Please upload a PDF file.', am: 'እባክዎ የፒዲኤፍ ፋይል ይስቀሉ።', om: 'Maaloo faayilii PDF ol guutaa.'},
    pdfRemoveError: { en: 'Could not remove the PDF. Please try again.', am: 'ፒዲኤፉን ማስወገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።', om: 'PDFicha balleessuun hin danda\'amne. Irra deebi\'ii yaali.'},
    noQrCode: { en: 'Your QR Code will appear here once you generate it.', am: 'የእርስዎ QR ኮድ ካመነጩት በኋላ እዚህ ይታያል።', om: 'Koodiin QR kee erga uumtee booda asitti mul\'ata.'},
    errorTitle: {en: "Error", am: "ስህተት", om: "Dogoggora"},
    successTitle: {en: "Success", am: "ተሳክቷል", om: "Milkaa'eera"},
    invalidFileTitle: {en: "Invalid File", am: "የማይሰራ ፋይል", om: "Faayilii Sirrii Hin Taane"},
    uniqueId: {en: "Your Unique ID", am: "የእርስዎ ልዩ መታወቂያ", om: "Eenyummaa Kee Isa Addaa"},
    summarizing: {en: "Saving...", am: "በማስቀመጥ ላይ...", om: "Olkaa'amaa jira..."},
    ocrError: { en: 'Failed to read text from PDF.', am: 'ከፒዲኤፍ ጽሑፍ ማንበብ አልተቻለም።', om: 'PDF irraa barreeffama dubbisuun hin danda\'amne.'},
  }), [getTranslation]);
  
  useEffect(() => {
    if (!user?.uid || !db) {
        setIsLoading(false);
        return;
    };

    setIsLoading(true);
    const docRef = doc(db, 'qr-info', user.uid);
    
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as QrInfo;
          form.reset(data);
        } else {
           form.reset({
            name: user.displayName || '',
            bloodType: '',
            allergies: '',
            prescriptions: '',
            medicalNotes: '',
            emergencyContact: { name: '', phone: '' },
            qrData: '',
          });
        }
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching QR info:', error);
        toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.loadingError), variant: 'destructive' });
        setIsLoading(false);
      }
    );
    
    return () => unsubscribe();
  }, [user, db, toast, getTranslation, translations, form]);


  async function onSubmit(values: QrInfo) {
    if (!user?.uid || !db) {
      toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.loginError), variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);

    try {
      const docRef = doc(db, 'qr-info', user.uid);
      
      const vitalInfo = {
        N: values.name,
        B: values.bloodType,
        A: values.allergies,
        M: values.prescriptions,
        C: values.medicalNotes,
      };

      const summarizedJson = JSON.stringify(vitalInfo);

      const finalValues = {
        ...values,
        qrData: summarizedJson,
      };

      await setDoc(docRef, finalValues, { merge: true });
      form.reset(finalValues);
      setFileToUpload(null);
      toast({ title: getTranslation(translations.successTitle), description: getTranslation(translations.saveSuccess) });
    } catch (error) {
      toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.saveError), variant: 'destructive' });
      console.error('Error saving QR info:', error);
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileToUpload(file);
    } else if (file) {
      toast({ title: getTranslation(translations.invalidFileTitle), description: getTranslation(translations.invalidFile), variant: 'destructive' });
    }
  };
  
  const removePdf = async () => {
    if (!user?.uid || !storage) return;
    setIsSubmitting(true);
    const currentPdfUrl = form.getValues('pdfUrl');
    
    if (currentPdfUrl) {
        try {
            const fileRef = ref(storage, currentPdfUrl);
            await deleteObject(fileRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                 toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.pdfRemoveError), variant: 'destructive' });
                 console.error("Error removing PDF:", error);
                 setIsSubmitting(false);
                 return;
            }
        }
    }

    const updatedValues = {
        ...form.getValues(),
        pdfUrl: '',
        pdfFileName: ''
    };
    await setDoc(doc(db!, 'qr-info', user.uid), updatedValues, { merge: true });
    form.reset(updatedValues);
    setIsSubmitting(false);
  }

  const qrCodeValue = form.watch('qrData');

  return (
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

              <FormItem>
                <FormLabel>{getTranslation(translations.uploadPdf)}</FormLabel>
                <FormDescription>{getTranslation(translations.uploadPdfDesc)}</FormDescription>
                <FormControl>
                    <Input type="file" accept="application/pdf" onChange={handleFileChange} className="pt-2 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"/>
                </FormControl>
                 {fileToUpload && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2 pt-2">
                        <File className="h-4 w-4"/> <span>{getTranslation(translations.newFile)} {fileToUpload.name}</span>
                    </div>
                 )}
                 {!fileToUpload && form.getValues('pdfFileName') && (
                    <div className="text-sm font-medium flex items-center justify-between pt-2">
                        <div className='flex items-center gap-2'>
                            <File className="h-4 w-4 text-primary"/> 
                            <a href={form.getValues('pdfUrl')} target="_blank" rel="noopener noreferrer" className='text-primary hover:underline'>{form.getValues('pdfFileName')}</a>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={removePdf} disabled={isSubmitting}>
                            <X className="h-4 w-4 mr-1"/>
                            {getTranslation(translations.removeFile)}
                        </Button>
                    </div>
                 )}
              </FormItem>

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
                        <div className='bg-white p-4 rounded-lg'>
                           <QRCode value={qrCodeValue} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} bgColor="white" fgColor="black" level="H" />
                        </div>
                    ) : (
                        <div className="w-full aspect-square bg-muted rounded-md flex items-center justify-center text-muted-foreground text-center p-4">
                            <p>{getTranslation(translations.noQrCode)}</p>
                        </div>
                    )}
                  </CardContent>
              </Card>
          </div>
        </div>
      )}
    </div>
  );
}
