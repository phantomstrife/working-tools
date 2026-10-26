export type Object = ValueType.Object;

export type Cast_Keys = <T extends Object>(object: T) => Array<keyof T>;
export type Compare_Deep = (objectA: unknown, objectB: unknown) => boolean;
export type Filter_Keys = <T extends Object>(object: T, keys?: string[] | null) => T;
export type Is_Empty = (input: Object) => boolean;
export type Is_Object = (input: unknown) => input is Object;
export type Merge_Deep = <T extends Object, U extends Object>(target: T, source: U) => T & U;
