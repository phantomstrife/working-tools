import { contextBridge, ipcRenderer } from 'electron';
import { electronAPI } from '@electron-toolkit/preload';

import { SECURE_STORAGE_CHANNEL } from '../shared/constants';

// Custom APIs for renderer
const api = {
   secureStorage: {
      getItem: (key: string): Promise<string | null> => ipcRenderer.invoke(SECURE_STORAGE_CHANNEL.GET, key),
      setItem: (key: string, value: string): Promise<void> =>
         ipcRenderer.invoke(SECURE_STORAGE_CHANNEL.SET, key, value),
      removeItem: (key: string): Promise<void> => ipcRenderer.invoke(SECURE_STORAGE_CHANNEL.REMOVE, key),
   },
};

export type Api = typeof api;

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
   try {
      contextBridge.exposeInMainWorld('electron', electronAPI);
      contextBridge.exposeInMainWorld('api', api);
   } catch (error) {
      console.error(error);
   }
} else {
   // @ts-ignore (define in dts)
   window.electron = electronAPI;
   // @ts-ignore (define in dts)
   window.api = api;
}
