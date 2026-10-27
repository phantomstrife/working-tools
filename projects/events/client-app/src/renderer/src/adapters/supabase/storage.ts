import type * as Types from './type';

// Session tokens live in the Electron main process, encrypted with OS-level safeStorage (DPAPI / Keychain / libsecret).
export const secureStorage: Types.Secure_Storage = {
   getItem: (key) => window.api.secureStorage.getItem(key),
   setItem: (key, value) => window.api.secureStorage.setItem(key, value),
   removeItem: (key) => window.api.secureStorage.removeItem(key),
};
