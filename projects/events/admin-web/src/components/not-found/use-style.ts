export const useStyle = {
   root: {
      wrapper: `flex flex-col items-center justify-center p-[calc(var(--spacing-primary)*2)] w-full bg-neutral-50 border border-utility-200 rounded-lg text-center`,
   },
   icon: {
      wrapper: 'flex items-center justify-center size-16 mb-primary bg-neutral-100 text-neutral-400 rounded-full',
      svg: 'size-8',
   },
   content: {
      title: 'mb-2 text-18 font-semibold text-neutral-900',
      description: 'max-w-sm mb-6 text-14 text-neutral-500',
   },
   action: {
      button: `inline-flex items-center justify-center px-primary py-[calc(var(--spacing-primary)/2)] text-14 font-medium text-neutral-50 bg-neutral-900 rounded-md hover:bg-neutral-800 transition-colors`,
   },
};
