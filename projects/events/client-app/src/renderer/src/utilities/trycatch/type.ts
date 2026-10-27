export type Debug = ClientApp.Utilities.Trycatch.Debug;
export type Result<T> = ClientApp.Utilities.Trycatch.Result<T>;

export type Resolve_Error = (error: unknown) => Debug;
export type TryCatch_Async = <T>(callback: () => Promise<T>) => Promise<Result<T>>;
export type TryCatch_Sync = <T>(callback: () => T) => Result<T>;
