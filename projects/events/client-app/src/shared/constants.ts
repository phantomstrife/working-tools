// Shared between main & preload (IPC channel contract).
export const SECURE_STORAGE_CHANNEL = {
   GET: 'secure-storage:get',
   SET: 'secure-storage:set',
   REMOVE: 'secure-storage:remove',
} as const;
