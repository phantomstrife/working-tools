export type Debug = AdminWeb.Utilities.Trycatch.Debug;

export type Resolve_Error = (error: unknown) => AdminWeb.Utilities.Trycatch.Debug;
export type TryCatch_Async = <T>(callback: () => Promise<T>) => Promise<AdminWeb.Utilities.Trycatch.Result<T>>;
export type TryCatch_Sync = <T>(callback: () => T) => AdminWeb.Utilities.Trycatch.Result<T>;
