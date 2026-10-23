import { useState } from 'react';
import { supabase } from '@renderer/lib/supabase';

export function useLogic() {
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');

   async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
      setLoading(true);
      setError('');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
         email: email.trim(),
         password,
      });

      setLoading(false);

      if (signInError) {
         setError(signInError.message);
         return;
      }

      if (data.user) {
         await supabase.from('logs').insert({
            account_id: data.user.id,
            action_type: 'AUTH_LOGIN',
            target_entity: 'accounts',
            target_id: data.user.id,
            metadata: { client: 'electron-client-app' },
         });
      }
   }

   function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
      setEmail(e.target.value);
   }

   function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
      setPassword(e.target.value);
   }

   return {
      param: {
         email,
         password,
         loading,
         error,
      },
      func: {
         handleLogin,
         handleEmailChange,
         handlePasswordChange,
      },
   };
}

