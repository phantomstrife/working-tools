import loginBackground from '@admin-web/assets/images/login-background.webp';

import { useStyle } from './use-style';

export const LayoutAuthorize: AdminWeb.Router.Layout = (properties) => {
   const { children } = properties;
   const { root, content } = useStyle;

   return (
      <div
         className={root.wrapper()}
         style={{
            backgroundImage: `url(${loginBackground.src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
         }}
      >
         <div className={content.wrapper()}>{children}</div>
      </div>
   );
};
