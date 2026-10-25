import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

export type QrScannerProps = {
   onScan: (text: string) => void;
   paused?: boolean;
};

const REPEAT_IGNORE_MS = 3500;

export function useLogic(props: QrScannerProps) {
   const { onScan, paused = false } = props;
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const onScanRef = useRef(onScan);
   const pausedRef = useRef(paused);

   const [error, setError] = useState(() =>
      typeof navigator !== 'undefined' && !navigator.mediaDevices?.getUserMedia
         ? 'Camera is not available on this address. Open the app on localhost or over HTTPS to scan QR codes. Manual search still works.'
         : '',
   );

   useEffect(() => {
      onScanRef.current = onScan;
      pausedRef.current = paused;
   });

   useEffect(() => {
      if (!navigator.mediaDevices?.getUserMedia) {
         return;
      }

      let stream: MediaStream | null = null;
      let timer: number | undefined;
      let stopped = false;
      let last = { text: '', at: 0 };

      const tick = () => {
         const video = videoRef.current;
         const canvas = canvasRef.current;
         if (video && canvas && !pausedRef.current && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
               ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
               const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
               const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });
               const now = Date.now();
               if (code?.data && (code.data !== last.text || now - last.at > REPEAT_IGNORE_MS)) {
                  last = { text: code.data, at: now };
                  onScanRef.current(code.data);
               }
            }
         }
         if (!stopped) {
            timer = window.setTimeout(tick, 150);
         }
      };

      navigator.mediaDevices
         .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
         .then((s) => {
            if (stopped) {
               s.getTracks().forEach((t) => t.stop());
               return;
            }
            stream = s;
            if (videoRef.current) {
               videoRef.current.srcObject = s;
               videoRef.current.play().catch(() => undefined);
            }
            tick();
         })
         .catch((err: unknown) => {
            const msg = err instanceof Error ? err.message : String(err);
            setError(`Camera unavailable: ${msg}`);
         });

      return () => {
         stopped = true;
         if (timer) window.clearTimeout(timer);
         stream?.getTracks().forEach((t) => t.stop());
      };
   }, []);

   return {
      videoRef,
      canvasRef,
      param: {
         paused,
         error,
      },
      func: {},
   };
}

