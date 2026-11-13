import { VipAccommodation } from '@admin-web/features/game-lucky-draw/vip-accommodation';

interface PageProperties {
   searchParams: Promise<{
      token?: string;
      action?: string;
   }>;
}

export default async function VipAccommodationPage({ searchParams }: PageProperties) {
   const resolved = await searchParams;
   const initialToken = typeof resolved.token === 'string' ? resolved.token : '';
   const initialAction = typeof resolved.action === 'string' ? resolved.action : 'confirm';

   return (
      <VipAccommodation
         initialToken={initialToken}
         initialAction={initialAction}
      />
   );
}
