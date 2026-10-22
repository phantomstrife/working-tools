import { tv } from 'tailwind-variants';

export const useStyle = {
   wrapper: tv({
      base: 'flex flex-col gap-y-secondary max-w-7xl mx-auto p-secondary',
   }),
   headerBlock: {
      wrapper: tv({
         base: 'flex flex-col md:flex-row md:items-center md:justify-between gap-primary',
      }),
      titleGroup: tv({
         base: 'flex flex-col gap-y-1',
      }),
      title: tv({
         base: 'text-24 font-semibold text-neutral-950 tracking-tight',
      }),
      subtitle: tv({
         base: 'text-14 text-neutral-500',
      }),
      actions: tv({
         base: 'flex flex-wrap items-center gap-x-2 gap-y-2',
      }),
      hiddenInput: tv({
         base: 'hidden',
      }),
      secondaryBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-800',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 pointer-events-none cursor-not-allowed',
            },
         },
      }),
      primaryBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
            'bg-neutral-900 rounded-primary hover:bg-neutral-950 transition-colors cursor-pointer',
         ],
      }),
   },
   presetTabs: {
      wrapper: tv({
         base: 'flex items-center gap-x-1 border-b border-utility-400',
      }),
      tab: tv({
         base: ['px-primary py-2.5 text-13 font-medium border-b-2 transition-colors cursor-pointer -mb-px'],
         variants: {
            active: {
               true: 'border-neutral-950 text-neutral-950 font-semibold',
               false: 'border-transparent text-neutral-500 hover:text-neutral-800',
            },
         },
         defaultVariants: {
            active: false,
         },
      }),
   },
   toolbarBlock: {
      wrapper: tv({
         base: ['flex flex-col gap-y-3 p-primary bg-neutral-50', 'border border-utility-400 rounded-secondary'],
      }),
      controlsRow: tv({
         base: 'flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3',
      }),
      searchBox: tv({
         base: 'relative flex items-center flex-1 max-w-md',
      }),
      searchIcon: tv({
         base: 'w-4 h-4 text-neutral-400 absolute left-3 pointer-events-none',
      }),
      searchInput: tv({
         base: [
            'w-full pl-9 pr-8 py-2 text-13 text-neutral-950 bg-neutral-50',
            'border border-utility-400 rounded-primary transition-colors',
            'placeholder:text-neutral-400 focus:outline-none focus:border-primary-500',
         ],
      }),
      clearSearchBtn: tv({
         base: 'absolute right-2.5 text-neutral-400 hover:text-neutral-700 cursor-pointer',
      }),
      filterGroup: tv({
         base: 'flex flex-wrap items-center gap-2',
      }),
      select: tv({
         base: [
            'px-3 py-2 text-13 text-neutral-800 bg-neutral-50',
            'border border-utility-400 rounded-primary focus:outline-none focus:border-primary-500',
         ],
      }),
      sortOrderBtn: tv({
         base: [
            'inline-flex items-center gap-x-1.5 px-3 py-2 text-13 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      chipsRow: tv({
         base: 'flex flex-wrap items-center gap-2 pt-2 border-t border-neutral-200',
      }),
      chip: tv({
         base: [
            'inline-flex items-center gap-x-1.5 px-2.5 py-1 text-12 font-medium',
            'bg-neutral-100 text-neutral-800 border border-utility-400 rounded-primary',
         ],
      }),
      chipRemoveBtn: tv({
         base: 'text-neutral-500 hover:text-neutral-950 cursor-pointer',
      }),
      clearAllBtn: tv({
         base: 'text-12 font-medium text-primary-600 hover:text-primary-800 underline cursor-pointer ml-1',
      }),
   },
   bulkBar: {
      wrapper: tv({
         base: [
            'flex flex-wrap items-center justify-between gap-3 px-secondary py-2.5',
            'bg-neutral-900 text-neutral-50 rounded-secondary',
         ],
      }),
      leftGroup: tv({
         base: 'flex items-center gap-x-3',
      }),
      countText: tv({
         base: 'text-13 font-semibold text-neutral-50',
      }),
      clearBtn: tv({
         base: 'text-12 text-neutral-300 hover:text-neutral-50 underline cursor-pointer',
      }),
      actions: tv({
         base: 'flex flex-wrap items-center gap-2',
      }),
      actionBtn: tv({
         base: [
            'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-medium',
            'bg-neutral-800 text-neutral-100 border border-neutral-700 rounded-primary',
            'hover:bg-neutral-700 transition-colors cursor-pointer',
         ],
      }),
      dangerBtn: tv({
         base: [
            'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-medium',
            'bg-error-600 text-neutral-50 rounded-primary',
            'hover:bg-error-700 transition-colors cursor-pointer',
         ],
      }),
   },
   tableBlock: {
      container: tv({
         base: 'bg-neutral-50 border border-utility-400 rounded-secondary overflow-visible',
      }),
      scrollWrapper: tv({
         base: 'w-full',
      }),
      table: tv({
         base: 'w-full border-collapse text-left',
      }),
      thead: tv({
         base: 'bg-neutral-100 border-b border-utility-400',
      }),
      th: tv({
         base: 'px-primary py-3 text-12 font-semibold uppercase tracking-wider text-neutral-600',
      }),
      thCheckbox: tv({
         base: 'w-10 px-primary py-3 text-center',
      }),
      thAction: tv({
         base: 'w-16 px-primary py-3 text-right',
      }),
      tbody: tv({
         base: 'divide-y divide-neutral-200',
      }),
      tr: tv({
         base: 'hover:bg-neutral-100/60 transition-colors',
         variants: {
            selected: {
               true: 'bg-primary-100/30',
            },
         },
      }),
      td: tv({
         base: 'px-primary py-3.5 text-13 text-neutral-800 align-middle',
      }),
      tdCheckbox: tv({
         base: 'w-10 px-primary py-3.5 text-center align-middle',
      }),
      tdAction: tv({
         base: 'w-16 px-primary py-3.5 text-right align-middle relative',
      }),
      checkbox: tv({
         base: 'w-4 h-4 rounded-primary border-utility-400 text-neutral-900 cursor-pointer',
      }),
      companyCell: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      companyNameBtn: tv({
         base: 'text-14 font-semibold text-neutral-950 hover:text-primary-600 text-left cursor-pointer',
      }),
      companyMeta: tv({
         base: 'text-12 text-neutral-500',
      }),
      contactCell: tv({
         base: 'flex flex-col gap-y-0.5',
      }),
      contactName: tv({
         base: 'text-13 font-medium text-neutral-900',
      }),
      contactSub: tv({
         base: 'text-12 text-neutral-500',
      }),
      statusBadge: tv({
         base: 'inline-flex items-center px-2.5 py-0.5 text-11 font-semibold rounded-primary border',
         variants: {
            status: {
               ACTIVE: 'bg-success-50 text-success-700 border-success-200',
               INACTIVE: 'bg-neutral-100 text-neutral-700 border-neutral-300',
               SUSPENDED: 'bg-error-50 text-error-700 border-error-200',
            },
         },
         defaultVariants: {
            status: 'INACTIVE',
         },
      }),
      menuTrigger: tv({
         base: [
            'inline-flex items-center justify-center p-1.5 text-neutral-500',
            'rounded-primary hover:bg-neutral-200 hover:text-neutral-950 transition-colors cursor-pointer',
         ],
      }),
      menuDropdown: tv({
         base: [
            'absolute right-4 top-11 z-100 w-40 py-1 bg-neutral-50',
            'border border-utility-400 rounded-secondary shadow-lg',
         ],
      }),
      menuItem: tv({
         base: [
            'w-full flex items-center gap-x-2 px-3 py-2 text-13 text-neutral-800',
            'hover:bg-neutral-100 transition-colors cursor-pointer text-left',
         ],
         variants: {
            danger: {
               true: 'text-error-600 hover:bg-error-50',
            },
         },
      }),
      skeletonRow: tv({
         base: 'h-4 w-full bg-neutral-200 animate-pulse rounded-primary',
      }),
   },
   emptyBlock: {
      wrapper: tv({
         base: 'flex flex-col items-center justify-center py-12 px-secondary text-center gap-y-2',
      }),
      iconBox: tv({
         base: 'p-3 bg-neutral-100 text-neutral-600 rounded-secondary mb-1',
      }),
      title: tv({
         base: 'text-16 font-semibold text-neutral-950',
      }),
      description: tv({
         base: 'text-13 text-neutral-500 max-w-md mb-2',
      }),
   },
   paginationBlock: {
      wrapper: tv({
         base: [
            'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3',
            'px-primary py-3 border-t border-utility-400 bg-neutral-50 rounded-b-secondary',
         ],
      }),
      summary: tv({
         base: 'text-13 text-neutral-600',
      }),
      controls: tv({
         base: 'flex items-center gap-x-3',
      }),
      limitSelect: tv({
         base: 'px-2.5 py-1.5 text-12 text-neutral-800 bg-neutral-50 border border-utility-400 rounded-primary',
      }),
      navGroup: tv({
         base: 'flex items-center gap-x-1.5',
      }),
      pageIndicator: tv({
         base: 'text-13 font-medium text-neutral-800 px-2',
      }),
      pageBtn: tv({
         base: [
            'inline-flex items-center justify-center p-1.5 text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-40 pointer-events-none cursor-not-allowed',
            },
         },
      }),
   },
   modalBlock: {
      backdrop: tv({
         base: 'fixed inset-0 z-50 flex items-center justify-center p-primary bg-neutral-950/50 backdrop-blur-xs',
      }),
      dialog: tv({
         base: [
            'w-full max-w-md p-secondary bg-neutral-50',
            'border border-utility-400 rounded-secondary shadow-xl flex flex-col gap-y-primary',
         ],
      }),
      header: tv({
         base: 'flex items-start gap-x-3',
      }),
      dangerIconBox: tv({
         base: 'p-2.5 bg-error-50 text-error-600 border border-error-200 rounded-secondary shrink-0',
      }),
      titleGroup: tv({
         base: 'flex flex-col gap-y-1',
      }),
      title: tv({
         base: 'text-16 font-semibold text-neutral-950',
      }),
      description: tv({
         base: 'text-13 text-neutral-600',
      }),
      highlight: tv({
         base: 'font-semibold text-neutral-950',
      }),
      footer: tv({
         base: 'flex items-center justify-end gap-x-2 pt-2 border-t border-neutral-200',
      }),
      cancelBtn: tv({
         base: [
            'px-primary py-2 text-13 font-medium text-neutral-700',
            'bg-neutral-50 border border-utility-400 rounded-primary',
            'hover:bg-neutral-100 transition-colors cursor-pointer',
         ],
      }),
      confirmDeleteBtn: tv({
         base: [
            'inline-flex items-center gap-x-2 px-primary py-2 text-13 font-medium text-neutral-50',
            'bg-error-600 rounded-primary hover:bg-error-700 transition-colors cursor-pointer',
         ],
         variants: {
            disabled: {
               true: 'opacity-50 pointer-events-none cursor-not-allowed',
            },
         },
      }),
   },
   icon: {
      xs: tv({
         base: 'w-3.5 h-3.5',
      }),
      sm: tv({
         base: 'w-4 h-4',
      }),
      md: tv({
         base: 'w-5 h-5',
      }),
      lg: tv({
         base: 'w-6 h-6',
      }),
      spin: tv({
         base: 'w-4 h-4 animate-spin',
      }),
   },
};
