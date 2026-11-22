import type { ResizeDirection } from './type';

export const STORAGE_KEY = 'admin-web:lucky-draw-settings-box';
export const VIEWPORT_MARGIN = 8;
export const DEFAULT_BOTTOM_RIGHT_OFFSET = 20;
export const DEFAULT_WIDTH = 352;
export const DEFAULT_HEIGHT = 360;
export const MIN_WIDTH = 220;
export const MIN_HEIGHT = 176;
export const COMPACT_WIDTH_BREAKPOINT = 290;
export const WIDE_WIDTH_BREAKPOINT = 520;
export const SHORT_HEIGHT_BREAKPOINT = 260;

export const RESIZE_DIRECTIONS: ReadonlyArray<ResizeDirection> = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
