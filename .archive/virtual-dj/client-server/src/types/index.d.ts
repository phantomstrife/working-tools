declare global {
   declare namespace ClientServer.Utilities.Trycatch {
      type Result<T> = Resolved<T> | NotResolved;
      type ResultAsync<T> = Promise<Resolved<T> | NotResolved>;

      interface Debug extends Error {
         rawError?: unknown;
      }

      interface NotResolved {
         debug: Debug;
         message: string;
         error: true;
      }

      interface Resolved<T> {
         data: T;
         error: false;
      }
   }
}

export {};
