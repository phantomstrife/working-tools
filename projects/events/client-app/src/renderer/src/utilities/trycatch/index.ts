import type * as Types from './type';

const resolveError: Types.Resolve_Error = (error) => {
   if (Error.isError(error)) {
      return error;
   }

   let message: string;
   if (typeof error === 'object' && error !== null) {
      try {
         message = JSON.stringify(error, null, 3);
      } catch {
         message = Object.prototype.toString.call(error);
      }
   } else {
      message = String(error);
   }

   const normalized: Types.Debug = new Error(message);
   normalized.rawError = error;

   return normalized;
};

export const trycatchSync: Types.TryCatch_Sync = (callback) => {
   try {
      const data = callback();

      return {
         data,
         error: false,
      };
   } catch (error) {
      const normalized = resolveError(error);

      return {
         debug: normalized,
         message: normalized.message,
         error: true,
      };
   }
};

export const trycatchAsync: Types.TryCatch_Async = async (callback) => {
   try {
      const data = await callback();

      return {
         data,
         error: false,
      };
   } catch (error) {
      const normalized = resolveError(error);

      return {
         debug: normalized,
         message: normalized.message,
         error: true,
      };
   }
};
