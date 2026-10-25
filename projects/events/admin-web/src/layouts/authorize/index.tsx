import loginBackground from '@admin-web/assets/images/login-background.webp';

import { useStyle } from './use-style';

export const LayoutAuthorize: Router.Layout = (properties) => {
   const { children } = properties;
   const { wrapper, panel } = useStyle;

   return (
      <div
         className={wrapper()}
         style={{
            backgroundImage: `url(${loginBackground.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
         }}
      >
         <div className={panel()}>{children}</div>
      </div>
   );
};
