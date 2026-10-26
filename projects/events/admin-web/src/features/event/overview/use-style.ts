export const useStyle = {
   root: {
      wrapper: 'flex flex-col gap-y-primary',
   },
   notify: {
      wrapper: `flex flex-col items-center justify-center p-[calc(var(--spacing-primary)*3)] text-center gap-y-[calc(var(--spacing-primary)/2)] bg-neutral-50 border border-utility-300 rounded-primary shadow-xl`,
      icon: `flex items-center justify-center text-neutral-500 size-16 rounded-primary bg-neutral-100 border border-utility-200`,
      title: 'text-neutral-950 text-16 font-semibold',
      description: 'text-neutral-500 text-13',
   },
};
