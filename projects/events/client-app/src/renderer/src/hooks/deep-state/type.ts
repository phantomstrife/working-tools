import type { Dispatch, SetStateAction } from 'react';

export type Hook = <T>(value: T) => [
   T,
   Set_State<T>,
   Set_State_Raw<T>,
   Reset_State<T>,
   //
];

export interface Cache<T> {
   value: T;
}

export interface UseLogic<T> {
   value: T;
   setDeepState: Dispatch<SetStateAction<T>>;
}

export type ExtractKeys<T> = T extends Object ? keyof T : never;
export type Key<T> = keyof T;
export type LastKey<T, key extends keyof T, subKey extends SubKey<T, key>> = SubKey<T[key], subKey>;
export type Object = ClientApp.Object;
export type SubKey<T, key extends keyof T> = ExtractKeys<T[key]>;

export type Reset_State<T> = (state?: T) => void;
export type Set_State<T> = <key extends Key<T>, subKey extends SubKey<T, key>, lastKey extends LastKey<T, key, subKey>>(
   value: ClientApp.Primitive | Partial<T>,
   key1?: key,
   key2?: subKey,
   key3?: lastKey,
) => void;
export type Set_State_Raw<M> = Dispatch<SetStateAction<M>>;
