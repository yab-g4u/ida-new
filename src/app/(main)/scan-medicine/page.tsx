'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Wand2, AlertTriangle, ShieldCheck, CheckCircle, XCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AnalyzeMedicinePackageOutput } from '@/ai/flows/analyze-medicine-package';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const demoResult: AnalyzeMedicinePackageOutput = {
  name: 'Generic Antibiotic',
  usage: 'Take one capsule (250mg) every 12 hours with a full glass of water. It can be taken with or without food. Do not crush or chew the capsule. Finish the entire course of medication, even if you start to feel better.',
  pros: 'Effectively treats a wide range of common bacterial infections such as respiratory tract infections, skin infections, and urinary tract infections. It works by stopping the growth of bacteria.',
  cons: 'Possible side effects include nausea, diarrhea, and stomach upset. More serious side effects are rare but can include allergic reactions (rash, itching, swelling). This medication is not effective against viral infections like the common cold or flu.',
};

type VerificationStatus = 'verified' | 'unknown';

export default function ScanMedicinePage() {
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [aiResult, setAiResult] = useState<AnalyzeMedicinePackageOutput | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const resetState = () => {
    setImageDataUri(null);
    setIsProcessing(false);
    setVerificationStatus(null);
    setAiResult(null);
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
      processImage(dataUri);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const processImage = async (dataUri: string) => {
    setIsProcessing(true);
    // Simulate a short processing time for the demo
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For the demo, we will always return the hardcoded result
    setVerificationStatus('verified');
    setAiResult(demoResult);
    setIsProcessing(false);
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
             <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*" />
            <Button size="lg" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
            </Button>
            <input type="file" id="camera-input" onChange={handleFileSelect} className="hidden" accept="image/*" capture="environment" />
            <Button size="lg" variant="outline" onClick={() => document.getElementById('camera-input')?.click()}>
              <Camera className="mr-2 h-5 w-5" />
               Use Camera
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-3xl">Scan Result</h1>
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
        </Card>

        <div className="space-y-6">
          {isProcessing ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center">
                  <Wand2 className="h-10 w-10 animate-pulse text-primary" />
                  <p className="mt-4 text-muted-foreground font-semibold">Analyzing your medicine...</p>
                  <p className="mt-1 text-sm text-muted-foreground">This may take a moment.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {verificationStatus === 'verified' && aiResult && (
                  <Alert variant="default" className="bg-green-100 dark:bg-green-900/50 border-green-500">
                    <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <AlertTitle className="text-green-800 dark:text-green-300">Verified</AlertTitle>
                    <AlertDescription className="text-green-700 dark:text-green-400">
                      Match found for "Antibiotic 250mg".
                    </AlertDescription>
                  </Alert>
              )}
              
              {aiResult && (
                 <Card className="bg-card">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 font-headline text-2xl">
                            <Wand2 /> AI Summary
                        </CardTitle>
                        <CardDescription>Generated by IDA for "{aiResult.name}"</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">How to Take</h3>
                                <p className="text-muted-foreground">{aiResult.usage}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                               <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Pros / Benefits</h3>
                                <p className="text-muted-foreground">{aiResult.pros}</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                                <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Cons / Side Effects</h3>
                                <p className="text-muted-foreground">{aiResult.cons}</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
              )}

              <Alert variant="default" className="mt-4 border-amber-500 bg-amber-50 dark:bg-amber-950">
                <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-800 dark:text-amber-300">Disclaimer</AlertTitle>
                <AlertDescription className="text-amber-700 dark:text-amber-500">
                  This is for informational purposes only. Always consult a qualified healthcare professional before making any medical decisions.
                </AlertDescription>
              </Alert>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

    