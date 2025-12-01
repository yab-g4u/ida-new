'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, ScanLine, AlertCircle, VideoOff, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function ScanMedicinePage() {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
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
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
      }
    };

    getCameraPermission();
    
    // Cleanup function to stop video stream
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  }, [toast]);

  const handleScan = () => {
    setIsScanning(true);
    // Placeholder for actual scan logic
    setTimeout(() => {
        // In a real app, you'd capture a frame, send to OCR/AI
        toast({
            title: "Scan Complete (Simulated)",
            description: "Extracted text would be processed here."
        });
        setIsScanning(false);
    }, 2000);
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
          <div className="relative aspect-video w-full overflow-hidden rounded-md bg-muted border">
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
                        Camera access is required. Please check your browser settings.
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
             {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 className="h-12 w-12 animate-spin text-white" />
                </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            className="w-full"
            onClick={handleScan} 
            disabled={!hasCameraPermission || isScanning}
          >
            {isScanning ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Camera className="mr-2 h-5 w-5" />
            )}
            {isScanning ? 'Scanning...' : 'Scan Package'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
