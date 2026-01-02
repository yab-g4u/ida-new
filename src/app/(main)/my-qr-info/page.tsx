'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState, useMemo } from 'react';
import QRCode from 'qrcode.react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/contexts/auth-provider';
import { useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, File, X } from 'lucide-react';
import { getStorage } from 'firebase/storage';

const formSchema = z.object({
  bloodType: z.string().min(2, 'Required').max(5, 'Invalid'),
  allergies: z.string().optional(),
  prescriptions: z.string().optional(),
  emergencyContact: z.string().min(10, 'Enter a valid phone number').optional(),
  pdfUrl: z.string().url().optional(),
  pdfFileName: z.string().optional(),
});

type QrInfo = z.infer<typeof formSchema>;

export default function MyQrInfoPage() {
  const { getTranslation } = useLanguage();
  const { user } = useAuth();
  const db = useFirestore();
  const { toast } = useToast();
  const [qrData, setQrData] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const storage = useMemo(() => db ? getStorage(db.app) : null, [db]);

  const form = useForm<QrInfo>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bloodType: '',
      allergies: '',
      prescriptions: '',
      emergencyContact: '',
      pdfUrl: '',
      pdfFileName: ''
    },
  });

  const translations = useMemo(() => ({
    title: { en: 'My QR Info', am: 'የእኔ QR መረጃ', om: 'Odeeffannoo QR Koo' },
    description: { en: 'Keep your emergency info up to date. This QR code is your digital medical ID.', am: 'የድንገተኛ ጊዜ መረጃዎን ወቅታዊ ያድርጉ። ይህ የQR ኮድ የእርስዎ ዲጂታል የህክምና መታወቂያ ነው።', om: 'Odeeffannoo yeroo hatattamaa kee haaromsi. Koodiin QR kun waraqaa eenyummaa yaalaa dijitaalaa keeti.' },
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
    uploadPdf: { en: 'Upload Medical PDF', am: 'የህክምና PDF ስቀል', om: 'PDF Yaalaa Ol-Guuti' },
    uploadPdfDesc: { en: 'Upload a PDF with more medical details (optional).', am: 'ተጨማሪ የህክምና ዝርዝሮች ያለው PDF ይስቀሉ (አማራጭ)።', om: 'PDF tarreeffama yaalaa dabalataa qabu ol guuti (filannoo).' },
    uploadedFile: { en: 'Uploaded File:', am: 'የተሰቀለ ፋይል፡', om: 'Faayili Ol-Guutame:'},
    removeFile: {en: 'Remove', am: 'አስወግድ', om: 'Haqi'},
    newFile: { en: 'New:', am: 'አዲስ፡', om: 'Haaraa:'},
    loadingError: { en: 'Failed to load your information.', am: 'የእርስዎን መረጃ መጫን አልተቻለም።', om: 'Odeeffannoo kee feesisuun hin danda\'amne.'},
    loginError: { en: 'You must be logged in to save data.', am: 'መረጃ ለማስቀመጥ መግባት አለብዎት።', om: 'Odeeffannoo olkaa\'uuf seentu galmeessuu qabda.'},
    saveSuccess: { en: 'Your information has been saved.', am: 'የእርስዎ መረጃ ተቀምጧል።', om: 'Odeeffannoon kee olkaa\'ameera.'},
    saveError: { en: 'Failed to save information.', am: 'መረጃ ማስቀመጥ አልተቻለም።', om: 'Odeeffannoo olkaa\'uun hin danda\'amne.'},
    invalidFile: { en: 'Please upload a PDF file.', am: 'እባክዎ የፒዲኤፍ ፋይል ይስቀሉ።', om: 'Maaloo faayilii PDF ol guutaa.'},
    pdfRemoveError: { en: 'Could not remove the PDF. Please try again.', am: 'ፒዲኤፉን ማስወገድ አልተቻለም። እባክዎ እንደገና ይሞክሩ።', om: 'PDFicha balleessuun hin danda\'amne. Irra deebi\'ii yaali.'},
    noQrCode: { en: 'Your QR Code will appear here once you save your information.', am: 'የእርስዎ QR ኮድ መረጃዎን ካስቀመጡ በኋላ እዚህ ይታያል።', om: 'Koodiin QR kee odeeffannoo kee erga olkaa\'attee booda asitti mul\'ata.'},
    errorTitle: {en: "Error", am: "ስህተት", om: "Dogoggora"},
    successTitle: {en: "Success", am: "ተሳክቷል", om: "Milkaa'eera"},
    invalidFileTitle: {en: "Invalid File", am: "የማይሰራ ፋይል", om: "Faayilii Sirrii Hin Taane"},
  }), [getTranslation]);
  
  const generateQrData = (data: Partial<QrInfo>) => {
    const dataForQr = {
        bloodType: data.bloodType || 'N/A',
        allergies: data.allergies || 'None',
        prescriptions: data.prescriptions || 'None',
        emergencyContact: data.emergencyContact || 'None',
        pdfUrl: data.pdfUrl || 'None',
    }
    const dataString = JSON.stringify(dataForQr, null, 2);
    setQrData(dataString);
  };

  useEffect(() => {
    async function fetchQrInfo() {
      if (!user?.uid || !db) {
        setIsLoading(false);
        return;
      };

      setIsLoading(true);
      try {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as QrInfo;
          form.reset(data);
          generateQrData(data);
        }
      } catch (error) {
        console.error('Error fetching QR info:', error);
        toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.loadingError), variant: 'destructive' });
      } finally {
        setIsLoading(false);
      }
    }
    
    // Only fetch when user and db are available.
    if (user?.uid && db) {
        fetchQrInfo();
    } else {
        setIsLoading(false);
    }
  }, [user, db, form, toast, getTranslation, translations]);


  async function onSubmit(values: QrInfo) {
    if (!user?.uid || !db || !storage) {
      toast({ title: getTranslation(translations.errorTitle), description: getTranslation(translations.loginError), variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    const docRef = doc(db, 'users', user.uid);

    try {
      let uploadedPdfUrl = values.pdfUrl;
      let uploadedPdfName = values.pdfFileName;

      // Handle PDF upload
      if (fileToUpload) {
        // If there's an old PDF, delete it first
        if (values.pdfUrl) {
            try {
                const oldFileRef = ref(storage, values.pdfUrl);
                await deleteObject(oldFileRef);
            } catch (deleteError: any) {
                if (deleteError.code !== 'storage/object-not-found') {
                    console.warn("Could not delete old PDF:", deleteError);
                }
            }
        }

        const fileRef = ref(storage, `user-qr-pdfs/${user.uid}/${fileToUpload.name}`);
        const snapshot = await uploadBytes(fileRef, fileToUpload);
        uploadedPdfUrl = await getDownloadURL(snapshot.ref);
        uploadedPdfName = fileToUpload.name;
      }

      const finalValues = {
        ...values,
        pdfUrl: uploadedPdfUrl,
        pdfFileName: uploadedPdfName,
      };

      await setDoc(docRef, finalValues, { merge: true }); 
      generateQrData(finalValues);
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
    } else {
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
    // Create an object with only the fields we want to change
    const updatedValues = {
        ...form.getValues(),
        pdfUrl: '',
        pdfFileName: ''
    };
    await onSubmit(updatedValues); // Resubmit form with cleared PDF fields
    setIsSubmitting(false); // onSubmit will set this, but we do it here just in case.
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <header>
        <h1 className="font-headline text-4xl text-foreground">{getTranslation(translations.title)}</h1>
        <p className="text-muted-foreground">{getTranslation(translations.description)}</p>
      </header>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
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

              <FormItem>
                <FormLabel>{getTranslation(translations.uploadPdf)}</FormLabel>
                <FormDescription>{getTranslation(translations.uploadPdfDesc)}</FormDescription>
                <FormControl>
                    <Input type="file" accept="application/pdf" onChange={handleFileChange} className="pt-2"/>
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
                            <X className="h-4 w-4 mr-2"/>
                            {getTranslation(translations.removeFile)}
                        </Button>
                    </div>
                 )}
              </FormItem>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {getTranslation(translations.saveBtn)}
              </Button>
            </form>
          </Form>

          <div className="space-y-6">
              <Card>
                  <CardHeader>
                      <CardTitle className="font-headline">{getTranslation(translations.qrTitle)}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center items-center">
                    {qrData ? (
                        <QRCode value={qrData} size={256} style={{ height: "auto", maxWidth: "100%", width: "100%" }} bgColor="var(--card)" fgColor="var(--card-foreground)" />
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

    