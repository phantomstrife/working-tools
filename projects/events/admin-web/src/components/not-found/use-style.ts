export const useStyle = {
   root: {
      wrapper: `flex flex-col items-center justify-center p-[calc(var(--spacing-primary)*2)] w-full bg-neutral-50 border border-utility-200 rounded-lg text-center`,
   },
   info: {
      icon: 'flex items-center justify-center size-16 mb-primary bg-neutral-100 text-error-600 rounded-full',
      error: 'mb-1 text-18 font-semibold text-neutral-900',
      description: 'max-w-sm mb-primary text-14 text-neutral-500',
   },
   action: {
      button: `flex items-center justify-center px-[calc(var(--spacing-primary)*3)] py-[calc(var(--spacing-primary)/2)] text-neutral-50 text-15 font-medium bg-neutral-900 rounded-md transition-colors hover:bg-neutral-800`,
   },
};
