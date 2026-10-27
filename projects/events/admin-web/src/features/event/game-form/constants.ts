import { z } from 'zod';

export const GAME_TYPE_OPTIONS: AdminWeb.Database.Game_Type[] = ['LUCKY_DRAW'];

export const GAME_STATUS_OPTIONS: AdminWeb.Database.Game_Status[] = ['READY', 'PENDING', 'LIVE', 'FINISHED'];

export const schema = z.object({
   event_id: z.string().trim().min(1, 'Vui lòng chọn sự kiện cho trò chơi.'),
   name: z.string().trim().min(2, 'Tên trò chơi phải có ít nhất 2 ký tự.'),
   game_type: z.enum(['LUCKY_DRAW']),
   status: z.enum(['PENDING', 'READY', 'LIVE', 'FINISHED']),
   description: z.string().trim().optional().or(z.literal('')).nullable(),
});

