import { app, ipcMain, safeStorage } from 'electron';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { SECURE_STORAGE_CHANNEL } from '../../shared/constants';

type Vault = Record<string, string>;

const memoryVault: Vault = {};

const getVaultPath = () => join(app.getPath('userData'), 'secure-storage.json');

const canEncrypt = () => safeStorage.isEncryptionAvailable();

const readVault = (): Vault => {
   const vaultPath = getVaultPath();

   if (!existsSync(vaultPath)) {
      return {};
   }

   try {
      return JSON.parse(readFileSync(vaultPath, 'utf-8')) as Vault;
   } catch {
      return {};
   }
};

const writeVault = (vault: Vault) => {
   writeFileSync(getVaultPath(), JSON.stringify(vault), 'utf-8');
};

const getItem = (key: string): string | null => {
   if (!canEncrypt()) {
      return memoryVault[key] ?? null;
   }

   const encrypted = readVault()[key];

   if (!encrypted) {
      return null;
   }

   try {
      return safeStorage.decryptString(Buffer.from(encrypted, 'base64'));
   } catch {
      return null;
   }
};

const setItem = (key: string, value: string) => {
   // Never persist session tokens in plain text: fall back to an in-memory vault when OS encryption is unavailable.
   if (!canEncrypt()) {
      memoryVault[key] = value;
      return;
   }

   const vault = readVault();
   vault[key] = safeStorage.encryptString(value).toString('base64');
   writeVault(vault);
};

const removeItem = (key: string) => {
   delete memoryVault[key];

   if (!canEncrypt()) {
      return;
   }

   const vault = readVault();
   delete vault[key];
   writeVault(vault);
};

export const registerSecureStorage = () => {
   ipcMain.handle(SECURE_STORAGE_CHANNEL.GET, (_, key: string) => getItem(key));
   ipcMain.handle(SECURE_STORAGE_CHANNEL.SET, (_, key: string, value: string) => setItem(key, value));
   ipcMain.handle(SECURE_STORAGE_CHANNEL.REMOVE, (_, key: string) => removeItem(key));
};
