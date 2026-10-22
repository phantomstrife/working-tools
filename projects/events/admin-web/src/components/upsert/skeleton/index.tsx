import { useStyle } from './use-style';

import type { UpsertErrorBannerProps, UpsertSkeletonProps } from './type';

export function UpsertSkeleton({ cardCount = 2 }: UpsertSkeletonProps) {
   const { skeletonWrapper, skeletonBar, skeletonCard } = useStyle;
   const indices = Array.from({ length: cardCount }, (_, index) => index);

   return (
      <div className={skeletonWrapper()}>
         <div className={skeletonBar()} />
         {indices.map((key) => (
            <div
               key={key}
               className={skeletonCard()}
            />
         ))}
      </div>
   );
}

export function UpsertErrorBanner({ message }: UpsertErrorBannerProps) {
   const { errorBanner } = useStyle;

   if (!message) {
      return null;
   }

   return (
      <div
         className={errorBanner()}
         role="alert"
      >
         <span>{message}</span>
      </div>
   );
}

