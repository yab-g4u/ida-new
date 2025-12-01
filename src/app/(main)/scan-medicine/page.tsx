'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ScanLine, AlertCircle, VideoOff, Loader2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyzeMedicinePackage, type AnalyzeMedicinePackageOutput } from '@/ai/flows/analyze-medicine-package';
import Image from 'next/image';

export default function ScanMedicinePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<AnalyzeMedicinePackageOutput | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Request camera permission
  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
      }
    };

    if (!imageDataUri) {
      getCameraPermission();
    }
  
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [imageDataUri]);

  const processImage = async (dataUri: string) => {
    setIsScanning(true);
    setResult(null);
    setShowResult(true);
    try {
      const analysisResult = await analyzeMedicinePackage({ imageDataUri: dataUri });
      setResult(analysisResult);
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Analysis Failed',
        description: 'Could not analyze the medicine package. Please try again.',
      });
      setShowResult(false); // Hide result view on error
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImageDataUri(dataUri);
        processImage(dataUri);
      }
    }
  };
  
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUri = e.target?.result as string;
        setImageDataUri(dataUri);
        processImage(dataUri);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetState = () => {
    setImageDataUri(null);
    setResult(null);
    setShowResult(false);
    setIsScanning(false);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  if (showResult) {
    return (
      <div className="flex flex-col h-full w-full p-4 md:p-6 bg-background">
          <div className="flex justify-between items-center mb-4">
            <h1 className="font-headline text-3xl">Analysis Result</h1>
            <Button variant="ghost" size="icon" onClick={resetState}>
              <X className="h-6 w-6"/>
            </Button>
          </div>
          {isScanning && !result && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  <p className="mt-4 text-muted-foreground text-lg">Analyzing your medicine...</p>
              </div>
          )}
          {result && (
              <Card className="w-full flex-1">
                  <CardHeader>
                      <CardTitle className="text-2xl font-headline">{result.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      <div className="space-y-2">
                          <h3 className="font-bold text-lg text-primary">How to Take</h3>
                          <p className="text-muted-foreground">{result.usage}</p>
                      </div>
                      <div className="space-y-2">
                          <h3 className="font-bold text-lg text-green-600">Pros</h3>
                          <p className="text-muted-foreground">{result.pros}</p>
                      </div>
                      <div className="space-y-2">
                          <h3 className="font-bold text-lg text-destructive">Cons</h3>
                          <p className="text-muted-foreground">{result.cons}</p>
                      </div>
                  </CardContent>
              </Card>
          )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 md:p-6 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-headline text-3xl">
            <ScanLine className="h-8 w-8 text-primary" />
            <span>Scan Medicine</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted border">
            {hasCameraPermission === null && (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="mt-2 text-muted-foreground">Requesting camera...</p>
              </div>
            )}
            {hasCameraPermission === false && (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <VideoOff className="h-12 w-12 text-destructive" />
                    <p className="mt-2 text-muted-foreground">
                        Camera access is required. Please check browser settings or upload an image.
                    </p>
                </div>
            )}
            <video
              ref={videoRef}
              className={`w-full h-full object-cover ${hasCameraPermission ? 'block' : 'hidden'}`}
              autoPlay
              playsInline
              muted
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button 
            className="w-full"
            onClick={handleScan} 
            disabled={!hasCameraPermission || isScanning}
            size="lg"
          >
            <Camera className="mr-2 h-5 w-5" />
            Scan Package
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isScanning}
            size="lg"
          >
              <Upload className="mr-2 h-5 w-5" />
              Upload Image
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*"
          />
        </CardFooter>
      </Card>
    </div>
  );
}
