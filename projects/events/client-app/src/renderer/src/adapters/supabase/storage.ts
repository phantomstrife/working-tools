import type * as Types from './type';

// Uses Electron main-process safeStorage when running in the desktop app, and falls back to localStorage in a browser.
export const secureStorage: Types.Secure_Storage = {
   getItem: async (key) => {
      if (window.api?.secureStorage) {
         return window.api.secureStorage.getItem(key);
      }

      return window.localStorage.getItem(key);
   },
   setItem: async (key, value) => {
      if (window.api?.secureStorage) {
         await window.api.secureStorage.setItem(key, value);
         return;
      }

      window.localStorage.setItem(key, value);
   },
   removeItem: async (key) => {
      if (window.api?.secureStorage) {
         await window.api.secureStorage.removeItem(key);
         return;
      }

      window.localStorage.removeItem(key);
   },
};
