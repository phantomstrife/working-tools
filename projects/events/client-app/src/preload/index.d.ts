import { ElectronAPI } from '@electron-toolkit/preload';

declare global {
   interface Window {
      electron?: ElectronAPI;
      api?: {
         secureStorage: {
            getItem: (key: string) => Promise<string | null>;
            setItem: (key: string, value: string) => Promise<void>;
            removeItem: (key: string) => Promise<void>;
         };
      };
   }
}
