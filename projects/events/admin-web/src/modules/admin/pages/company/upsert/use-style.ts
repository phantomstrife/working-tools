import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
   }),
   stickyBar: {
      wrapper: tv({
         base: [
            'sticky top-0 z-20 flex items-center justify-between gap-x-primary',
            'px-secondary py-primary bg-neutral-50/90 backdrop-blur-md',
            'border-b border-utility-400 rounded-secondary',
         ],
      }),
      leftGroup: tv({
         base: 'flex items-center gap-x-3',
      }),
      backBtn: tv({
         base: [
            'inline-flex items-center justify-center p-2 text-neutral-600',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 hover:text-neutral-950 transition-colors',
         ],
      }),
      titleGroup: tv({
         base: 'flex flex-col',
      }),
      title: tv({
         base: 'text-20 font-semibold text-neutral-950',
      }),
      subtitle: tv({
         base: 'text-12 text-neutral-500',
      }),
      actions: tv({
         base: 'flex items-center gap-x-2',
      }),
      dirtyBadge: tv({
         base: [
            'px-2.5 py-1 text-12 font-medium text-warning-700',
            'bg-warning-50 border border-warning-200 rounded-primary',
         ],
      }),
      cancelBtn: tv({
         base: [
            'px-primary py-2 text-14 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      saveBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-14 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 cursor-not-allowed pointer-events-none',
            },
         },
      }),
   },
   skeletonBlock: {
      wrapper: tv({
         base: 'flex flex-col gap-y-secondary max-w-5xl mx-auto p-secondary',
      }),
      bar: tv({
         base: 'h-16 w-full bg-neutral-200 animate-pulse rounded-secondary',
      }),
      card: tv({
         base: 'h-64 w-full bg-neutral-200 animate-pulse rounded-secondary',
      }),
   },
   errorBanner: {
      wrapper: tv({
         base: [
            'flex items-center justify-between gap-x-primary p-primary',
            'bg-error-50 border border-error-200 rounded-secondary text-14 text-error-700 font-medium',
         ],
      }),
   },
   cardBlock: {
      wrapper: tv({
         base: 'bg-neutral-50 border border-utility-400 rounded-secondary p-secondary shadow-xs',
      }),
      header: tv({
         base: 'flex flex-col gap-y-0.5 pb-3 mb-primary border-b border-neutral-200',
      }),
      title: tv({
         base: 'text-16 font-semibold text-neutral-950',
      }),
      description: tv({
         base: 'text-13 text-neutral-500',
      }),
      grid: tv({
         base: 'grid grid-cols-1 md:grid-cols-2 gap-primary',
      }),
      fullSpan: tv({
         base: 'md:col-span-2',
      }),
   },
   fieldBlock: {
      wrapper: tv({
         base: 'flex flex-col gap-y-1.5',
      }),
      label: tv({
         base: 'text-13 font-medium text-neutral-700',
      }),
      requiredMark: tv({
         base: 'text-error-600 ml-0.5',
      }),
      input: tv({
         base: [
            'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
            'border border-utility-400 rounded-primary transition-colors',
            'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
         ],
         variants: {
            hasError: {
               true: 'border-error-500 focus:border-error-600 bg-error-50/30',
            },
         },
      }),
      select: tv({
         base: [
            'w-full px-3.5 py-2 text-14 text-neutral-950 bg-neutral-50',
            'border border-utility-400 rounded-primary transition-colors',
            'focus:outline-none focus:border-primary-500',
         ],
         variants: {
            hasError: {
               true: 'border-error-500 focus:border-error-600 bg-error-50/30',
            },
         },
      }),
      hint: tv({
         base: 'text-12 text-neutral-500',
      }),
      error: tv({
         base: 'text-12 font-medium text-error-600',
      }),
   },
   auditBlock: {
      wrapper: tv({
         base: [
            'grid grid-cols-1 md:grid-cols-3 gap-primary p-primary',
            'bg-neutral-100 border border-utility-400 rounded-secondary',
         ],
      }),
      item: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      label: tv({
         base: 'text-11 font-medium uppercase tracking-wider text-neutral-500',
      }),
      value: tv({
         base: 'text-13 font-mono text-neutral-800 break-all',
      }),
   },
   icon: {
      sm: tv({
         base: 'w-4 h-4',
      }),
      spin: tv({
         base: 'w-4 h-4 animate-spin',
      }),
   },
};

