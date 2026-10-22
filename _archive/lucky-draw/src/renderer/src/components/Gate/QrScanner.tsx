import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

interface Props {
   /** Called with the decoded text. Identical consecutive reads are ignored for a few seconds. */
   onScan: (text: string) => void;
   /** Pause decoding (e.g. while a guest is being confirmed). The camera stays on. */
   paused?: boolean;
}

const REPEAT_IGNORE_MS = 4000;

export const QrScanner: React.FC<Props> = ({ onScan, paused = false }) => {
   const videoRef = useRef<HTMLVideoElement>(null);
   const canvasRef = useRef<HTMLCanvasElement>(null);
   const onScanRef = useRef(onScan);
   const pausedRef = useRef(paused);
   const [error, setError] = useState('');

   useEffect(() => {
      onScanRef.current = onScan;
      pausedRef.current = paused;
   });

   useEffect(() => {
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
         if (!stopped) timer = window.setTimeout(tick, 150);
      };

      // Browsers only expose the camera API on HTTPS or localhost. On http://192.168.x.x it is
      // undefined, and calling it would throw and unmount the whole page.
      if (!navigator.mediaDevices?.getUserMedia) {
         setError(
            'Camera is not available on this address. Open the app on localhost or over HTTPS to scan QR codes. Search still works.',
         );
         return;
      }

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
         .catch((err) => setError(`Camera unavailable: ${err.message ?? err}`));

      return () => {
         stopped = true;
         if (timer) window.clearTimeout(timer);
         stream?.getTracks().forEach((t) => t.stop());
      };
   }, []);

   return (
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-slate-700 bg-black">
         <video ref={videoRef} muted playsInline className="h-full w-full object-cover" />
         <canvas ref={canvasRef} className="hidden" />
         <div className="pointer-events-none absolute inset-0 m-auto h-2/3 aspect-square rounded-lg border-2 border-yellow-400/80" />
         {paused && (
            <div className="absolute inset-0 grid place-items-center bg-black/60 text-sm font-semibold text-white">
               Scanner paused
            </div>
         )}
         {error && (
            <div className="absolute inset-0 grid place-items-center bg-slate-900 p-4 text-center text-sm text-red-400">
               {error}
            </div>
         )}
      </div>
   );
};

