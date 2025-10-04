'use client';

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, RefreshCw, ScanLine } from 'lucide-react';
import { scanVerseFromImage, type ScanVerseFromImageOutput } from '@/ai/flows/scan-verse-from-image';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';

interface CameraScannerProps {
  onScanComplete: (result: ScanVerseFromImageOutput, verseText: string) => void;
  setParentLoading: (loading: boolean) => void;
}

export default function CameraScanner({ onScanComplete, setParentLoading }: CameraScannerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const webcamRef = useRef<Webcam>(null);
  const { toast } = useToast();

  const handleOpen = async () => {
    setIsOpen(true);
    setImgSrc(null);
    if (hasCameraPermission === null) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop()); // Stop stream immediately after checking
        setHasCameraPermission(true);
      } catch (err) {
        console.error("Camera access denied:", err);
        setHasCameraPermission(false);
        toast({
          variant: "destructive",
          title: "Camera Access Denied",
          description: "Please enable camera permissions in your browser to use this feature.",
        });
      }
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImgSrc(imageSrc);
    }
  }, [webcamRef]);

  const handleScan = async () => {
    if (!imgSrc) return;
    setIsScanning(true);
    setParentLoading(true);
    try {
      const result = await scanVerseFromImage({ imageDataUri: imgSrc });
      onScanComplete(result, result.verseText);
      setIsOpen(false);
      toast({
        title: "Scan Successful",
        description: "The verse has been analyzed.",
      });
    } catch (error) {
      console.error("Scan failed:", error);
      toast({
        title: "Scan Failed",
        description: "Could not analyze the image. Please try again with a clearer picture.",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
      setParentLoading(false);
    }
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment"
  };

  return (
    <>
      <Button onClick={handleOpen} variant="outline" size="lg" className="w-full sm:w-auto">
        <Camera className="mr-2 h-4 w-4" />
        Scan from Book
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Scan Sanskrit Verse</DialogTitle>
            <DialogDescription>
              Position the verse from your book inside the frame and capture.
            </DialogDescription>
          </DialogHeader>
          <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-secondary">
            {hasCameraPermission === false ? (
                 <div className="flex h-full flex-col items-center justify-center gap-4 p-4">
                    <Alert variant="destructive" className="w-full">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                         Please grant camera permissions in your browser settings and refresh the page to use the scanner.
                        </AlertDescription>
                    </Alert>
                </div>
            ) : hasCameraPermission === true ? (
              imgSrc ? (
                <img src={imgSrc} alt="Captured verse" className="h-full w-full object-contain" />
              ) : (
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={videoConstraints}
                  className="h-full w-full object-cover"
                />
              )
            ) : (
                <div className="flex h-full w-full items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            )}
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            {imgSrc ? (
              <>
                <Button variant="outline" onClick={() => setImgSrc(null)} disabled={isScanning} className="w-full sm:w-auto">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleScan} disabled={isScanning} className="w-full sm:w-auto">
                  {isScanning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                     <ScanLine className="mr-2 h-4 w-4" />
                      Analyze Image
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={capture} disabled={!hasCameraPermission} className="w-full sm:w-auto">
                <Camera className="mr-2 h-4 w-4" />
                Capture
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
