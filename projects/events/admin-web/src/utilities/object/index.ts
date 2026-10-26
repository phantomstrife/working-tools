import { KEYS } from './constants';

import type * as Types from './type';

export const castKeys: Types.Cast_Keys = (object) => {
   return Object.keys(object) as (keyof typeof object)[];
};

export const compareDeep: Types.Compare_Deep = (objectA, objectB) => {
   if (Object.is(objectA, objectB)) {
      return true;
   }

   if (typeof objectA !== 'object' || objectA === null || typeof objectB !== 'object' || objectB === null) {
      return false;
   }

   const recordA = objectA as Types.Object;
   const recordB = objectB as Types.Object;

   const keysA = Object.keys(recordA);
   const keysB = Object.keys(recordB);

   if (keysA.length !== keysB.length) {
      return false;
   }

   return keysA.every((key) => {
      return Object.prototype.hasOwnProperty.call(recordB, key) && compareDeep(recordA[key], recordB[key]);
   });
};

export const filterKeys: Types.Filter_Keys = (object, keys = null) => {
   const output: Types.Object = {};
   const keySet = keys ? new Set(keys) : new Set();

   for (const [key, value] of Object.entries(object)) {
      if (keySet.has(key) && value !== undefined && value !== null) {
         output[key] = value;
      }
   }

   return output as typeof object;
};

export const isObject: Types.Is_Object = (input): input is Types.Object => {
   if (typeof input !== 'object' || input === null) {
      return false;
   }

   const proto = Object.getPrototypeOf(input) as object | null;

   if (proto === null || proto === Object.prototype) {
      return true;
   }

   return false;
};

export const isEmpty: Types.Is_Empty = (input) => {
   if (!input) {
      return true;
   }

   for (const key in input) {
      if (Object.prototype.hasOwnProperty.call(input, key)) {
         return false;
      }
   }

   return true;
};

export const mergeDeep: Types.Merge_Deep = (_target, _source) => {
   const target: Types.Object = { ..._target };
   const source: Types.Object = _source;

   for (const key in source) {
      if (KEYS.DANGEROUS.has(key)) {
         continue;
      }

      const targetValue = target[key];
      const sourceValue = source[key];

      if (isObject(targetValue) && isObject(sourceValue)) {
         target[key] = mergeDeep(targetValue, sourceValue);
         continue;
      }

      if (Array.isArray(sourceValue)) {
         target[key] = sourceValue.map((item: unknown[]) => (isObject(item) ? mergeDeep({}, item) : item));
         continue;
      }

      target[key] = sourceValue;
   }

   return target as unknown as typeof _target & typeof _source;
};
