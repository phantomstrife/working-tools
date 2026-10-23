import { useLogic } from './use-logic';
import { useStyle } from './use-style';

import type { QrScannerProps } from './use-logic';

export const QrScanner = (props: QrScannerProps) => {
   const { videoRef, canvasRef, param } = useLogic(props);
   const { scannerBox, videoEl, hiddenCanvas, reticleFrame, pausedOverlay, errorOverlay } = useStyle;

   return (
      <div className={scannerBox()}>
         <video
            ref={videoRef}
            muted
            playsInline
            className={videoEl()}
         />
         <canvas
            ref={canvasRef}
            className={hiddenCanvas()}
         />
         <div className={reticleFrame()} />
         {param.paused && <div className={pausedOverlay()}>Scanner paused</div>}
         {param.error && <div className={errorOverlay()}>{param.error}</div>}
      </div>
   );
};

