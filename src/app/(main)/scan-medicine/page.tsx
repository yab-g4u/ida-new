'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, Upload, X, Wand2, AlertCircle, ShieldCheck, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { analyzeMedicinePackage, type AnalyzeMedicinePackageOutput } from '@/ai/flows/analyze-medicine-package';
import { mockMedicineData } from '@/lib/data';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

declare const Tesseract: any;

type VerificationStatus = 'verified' | 'caution' | 'unknown';

export default function ScanMedicinePage() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false); // For OCR + AI
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [aiResult, setAiResult] = useState<AnalyzeMedicinePackageOutput | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const workerRef = useRef<Tesseract.Worker | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize the Tesseract worker on component mount
  useEffect(() => {
    const initializeWorker = async () => {
      const worker = await Tesseract.createWorker({
        logger: (m: any) => {
           if (m.status === 'recognizing text') {
             setOcrStatus(m.status);
             setOcrProgress(Math.floor(m.progress * 100));
           }
        },
      });
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      workerRef.current = worker;
      setIsWorkerReady(true);
    };

    initializeWorker();

    // Cleanup worker on component unmount
    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
    };
  }, []);

  const resetState = () => {
    setImageDataUri(null);
    setExtractedText('');
    setIsProcessing(false);
    setOcrProgress(0);
    setOcrStatus('');
    setVerificationStatus(null);
    setAiResult(null);
    setIsAiLoading(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageChange = (file: File) => {
    if (!file) return;
    resetState();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUri = e.target?.result as string;
      setImageDataUri(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const processImage = async () => {
    if (!imageDataUri) {
      toast({ variant: 'destructive', title: 'No Image', description: 'Please upload or capture an image first.' });
      return;
    }
    if (!workerRef.current) {
      toast({ variant: 'destructive', title: 'OCR Not Ready', description: 'The text recognition engine is still loading.' });
      return;
    }

    setIsProcessing(true);
    setOcrStatus('Recognizing text...');
    setOcrProgress(0);

    try {
      const { data: { text } } = await workerRef.current.recognize(imageDataUri);
      
      setExtractedText(text);
      setOcrStatus('OCR Complete');
      setOcrProgress(100);
      verifyMedicine(text);

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'OCR Failed', description: 'Could not extract text from the image.' });
      setIsProcessing(false);
    }
  };

  const verifyMedicine = (text: string) => {
    const lowercasedText = text.toLowerCase();
    const medicineName = mockMedicineData.name.toLowerCase();
    
    if (lowercasedText.includes(medicineName)) {
      setVerificationStatus('verified');
      fetchAiExplanation();
    } else {
      setVerificationStatus('unknown');
      setIsProcessing(false);
    }
  };

  const fetchAiExplanation = async () => {
    if (!imageDataUri) return;
    setIsAiLoading(true);
    try {
      const result = await analyzeMedicinePackage({ imageDataUri: imageDataUri });
      setAiResult(result);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'AI Analysis Failed', description: 'Could not get an explanation.' });
    } finally {
      setIsAiLoading(false);
      setIsProcessing(false);
    }
  };

  if (!imageDataUri) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 bg-background">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Scan Your Medicine</CardTitle>
            <CardDescription>Upload or capture an image of the medicine package.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button size="lg" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </Button>
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            <Button size="lg" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Camera className="mr-2 h-5 w-5" />
               Use Camera
               <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" capture="environment" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl">Verify Medicine</h1>
        <Button variant="ghost" size="icon" onClick={resetState}><X/></Button>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Captured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Image src={imageDataUri} alt="Medicine Package" width={500} height={500} className="rounded-lg w-full h-auto" />
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={processImage} disabled={isProcessing || !isWorkerReady}>
              {isProcessing ? <Loader2 className="animate-spin mr-2"/> : <ShieldCheck className="mr-2"/>}
              {isWorkerReady ? 'Check Medicine' : 'Preparing Scanner...'}
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-6">
          {isProcessing && !verificationStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Processing...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Progress value={ocrProgress} />
                <p className="text-sm text-muted-foreground text-center">{ocrStatus}</p>
              </CardContent>
            </Card>
          )}

          {verificationStatus && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Verification Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {verificationStatus === 'verified' && (
                    <Alert variant="default" className="bg-green-100 dark:bg-green-900/50 border-green-500">
                      <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <AlertTitle className="text-green-800 dark:text-green-300">Verified</AlertTitle>
                      <AlertDescription className="text-green-700 dark:text-green-400">
                        Match found for "{mockMedicineData.name}".
                      </AlertDescription>
                    </Alert>
                  )}
                  {verificationStatus === 'unknown' && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle>Unknown Medicine</AlertTitle>
                      <AlertDescription>
                        Could not verify the medicine from the image.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Alert variant="default" className="mt-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
                    <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-800 dark:text-amber-300">Disclaimer</AlertTitle>
                    <AlertDescription className="text-amber-700 dark:text-amber-500">
                      This is for informational purposes only and is not a medical diagnosis. Consult a professional.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>

              {extractedText && (
                <Card>
                    <CardHeader><CardTitle>Extracted Text</CardTitle></CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted p-3 rounded-md">{extractedText}</p>
                    </CardContent>
                </Card>
              )}
            </>
          )}

          {isAiLoading && (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="mt-2 text-muted-foreground">Generating AI explanation...</p>
              </CardContent>
            </Card>
          )}

          {aiResult && (
             <Card className="bg-accent">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                        <Wand2 /> AI Explanation
                    </CardTitle>
                    <CardDescription>Generated by IDA for "{aiResult.name}"</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="font-bold text-primary">How to Take</h3>
                        <p className="text-muted-foreground">{aiResult.usage}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-green-600">Pros / Benefits</h3>
                        <p className="text-muted-foreground">{aiResult.pros}</p>
                    </div>
                     <div>
                        <h3 className="font-bold text-destructive">Cons / Side Effects</h3>
                        <p className="text-muted-foreground">{aiResult.cons}</p>
                    </div>
                </CardContent>
             </Card>
          )}
        </div>
      </div>
    </div>
  );
}
