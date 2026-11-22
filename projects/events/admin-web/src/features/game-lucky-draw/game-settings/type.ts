export type Draw_Mode = AdminWeb.Features.GameLuckyDraw.DrawMode;

export type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

export type LayoutMode = 'compact' | 'standard' | 'wide';

export type HeightMode = 'short' | 'regular';

export interface BoxRect {
   x: number;
   y: number;
   width: number;
   height: number;
}
