import { tv } from 'tailwind-variants';

const themes = {
   role_badge: tv({
      base: 'inline-flex items-center px-[calc(var(--spacing-primary)/2)] py-[2px] rounded-primary text-11 font-bold uppercase border',
      variants: {
         role: {
            FIELD_STAFF: 'bg-info-50 text-info-700 border-info-200',
            GUARD: 'bg-warning-50 text-warning-700 border-warning-200',
            ADMIN: 'bg-primary-100 text-primary-800 border-primary-300',
            SUPER_ADMIN: 'bg-neutral-100 text-neutral-700 border-neutral-300',
         },
      },
      defaultVariants: {
         role: 'FIELD_STAFF',
      },
   }),
};

export const useStyle = {
   member: {
      wrapper: 'flex items-center gap-[calc(var(--spacing-primary)*3/4)]',
      avatar: 'size-8 rounded-full bg-neutral-900 text-neutral-50 flex items-center justify-center text-11 font-bold shrink-0 uppercase',
      info: 'min-w-0',
      name_row: 'flex items-center gap-1.5 text-13 font-bold text-neutral-900',
      inactive_dot: 'size-2 rounded-full bg-error-600 shrink-0',
      email: 'text-12 text-neutral-500 truncate max-w-45',
   },
   role_badge: themes.role_badge,
};

