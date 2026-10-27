export const MODAL_ID = {
   PRIZE_FORM: 'lucky-draw-prize-form-modal',
   DELETE_PRIZE: 'lucky-draw-prize-delete-modal',
} as const;

export const getPrizeStockStatus = (
   remainingQuantity: number,
   totalQuantity: number,
): AdminWeb.Features.GameLuckyDraw.Prize.StockStatus => {
   if (remainingQuantity <= 0) {
      return 'DEPLETED';
   }

   if (remainingQuantity <= Math.ceil(totalQuantity * 0.35)) {
      return 'LOW_STOCK';
   }

   return 'IN_STOCK';
};

