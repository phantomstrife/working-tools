import { Outlet } from 'react-router';

import loginBackground from '@client-app/assets/images/login-background.webp';

import { useStyle } from './use-style';

export const LayoutAuthorize: ClientApp.Router.Layout = () => {
   const { root, content } = useStyle;

   return (
      <div
         className={root.wrapper()}
         style={{
            backgroundImage: `url(${loginBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
         }}
      >
         <div className={content.wrapper()}>
            <Outlet />
         </div>
      </div>
   );
};
