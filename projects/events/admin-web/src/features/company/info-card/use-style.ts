import { tv, cx } from 'tailwind-variants';

import css from './style.module.css';

// const themes = {
//    status_scheme: tv({
//       slots: {
//          accent_bar: 'h-1.5 w-full bg-linear-to-r',
//          badge: 'inline-flex items-center gap-1.5 px-2.5 py-0.5 text-12! font-semibold tracking-wide capitalize rounded-full ring-1 ring-inset',
//          dot: 'size-1.5 rounded-full',
//       },
//       variants: {
//          status: {
//             ACTIVE: {
//                accent_bar: 'from-success-600 via-success-400 to-success-500',
//                badge: 'bg-success-50 text-success-700 ring-success-600/20',
//                dot: 'bg-success-500 animate-pulse',
//             },
//             INACTIVE: {
//                accent_bar: 'from-error-600 via-error-400 to-error-500',
//                badge: 'bg-error-50 text-error-700 ring-error-600/20',
//                dot: 'bg-error-500',
//             },
//             SUSPENDED: {
//                accent_bar: 'from-neutral-600 via-neutral-400 to-neutral-500',
//                badge: 'bg-neutral-50 text-neutral-950 ring-neutral-600/20',
//                dot: 'bg-neutral-500',
//             },
//          },
//       },
//       defaultVariants: {
//          status: 'ACTIVE',
//       },
//    }),
//    meta_pill: tv({
//       slots: {
//          wrapper: `inline-flex items-center gap-1.5 px-2.5 py-1 text-12! font-medium text-neutral-950 bg-neutral-100 border border-utility-200 rounded-primary`,
//          icon: 'size-3.5',
//          title: 'text-neutral-500',
//          name: 'font-semibold',
//          copy_wrapper: 'ml-0.5 text-neutral-400 hover:text-primary-600 transition-colors cursor-pointer',
//          copy_icon: 'size-3.5',
//       },
//    }),

//    //  wrapper: tv({
//    //          base: themes.metapill_panel.base,
//    //          variants: {
//    //             type: {
//    //                industry: css.header_info_industry,
//    //                tax: css.header_info_tax,
//    //             },
//    //          },
//    //       }),
//    //       icon: 'size-3.5',
//    //       title: 'text-neutral-500',
//    //       name: 'font-semibold',
//    //       copy_button: 'ml-0.5 text-neutral-400 hover:text-primary-600 transition-colors cursor-pointer',
//    //       copy_icon: themes.copy_icon,

//    // metapill_panel: tv({
//    //    base: 'inline-flex items-center gap-1.5 px-2.5 py-1 text-12! font-medium text-neutral-950 bg-neutral-100 border border-utility-200 rounded-primary',
//    //    variants: {
//    //       type: {
//    //          industry: '',
//    //          tax: '',
//    //       },
//    //    },
//    // }),
//    // copy_icon: tv({
//    //    base: 'size-3.5',
//    //    variants: {
//    //       copied: {
//    //          true: 'text-success-600',
//    //          false: '',
//    //       },
//    //    },
//    //    defaultVariants: {
//    //       copied: false,
//    //    },
//    // }),
//    detail_icon_box: tv({
//       base: 'flex size-10 shrink-0 items-center justify-center rounded-primary transition-colors duration-200',
//       variants: {
//          tone: {
//             primary: 'bg-primary-100 text-primary-600 group-hover:bg-primary-600 group-hover:text-neutral-50',
//             info: 'bg-info-50 text-info-600 group-hover:bg-info-600 group-hover:text-neutral-50',
//             success: 'bg-success-50 text-success-600 group-hover:bg-success-600 group-hover:text-neutral-50',
//             warning: 'bg-warning-50 text-warning-600 group-hover:bg-warning-600 group-hover:text-neutral-50',
//          },
//       },
//       defaultVariants: {
//          tone: 'primary',
//       },
//    }),
//    detail_value: tv({
//       base: 'text-14! truncate',
//       variants: {
//          isEmpty: {
//             true: 'text-neutral-400 italic font-normal',
//             false: 'text-neutral-900 font-semibold',
//          },
//       },
//       defaultVariants: {
//          isEmpty: false,
//       },
//    }),
// };

// export const useStyle = {
//    root: {
//       wrapper: `relative overflow-hidden rounded-primary bg-neutral-50 border border-utility-200 shadow-sm transition-all duration-200`,
//       scheme: tv({
//          slots: {
//             ...themes.status_scheme.slots,
//             badge: cx(themes.status_scheme.slots.badge, css.header_info_status),
//          },
//          variants: themes.status_scheme.variants,
//          defaultVariants: themes.status_scheme.defaultVariants,
//       }),
//    },
//    header: {
//       wrapper: `relative flex flex-col gap-5 p-secondary sm:p-7 lg:flex-row lg:items-start lg:justify-between border-b border-utility-200`,
//       info: {
//          wrapper: cx('grid items-center justify-items-start gap-x-primary', css.header_info_wrapper),
//          name: cx('text-28! font-medium tracking-tight text-neutral-950 truncate', css.header_info_name),
//       },
//       logo: {
//          wrapper: cx(
//             'group relative flex size-24 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-neutral-50 to-neutral-100 border border-utility-200 shadow-inner overflow-hidden',
//             css.header_logo_wrapper,
//          ),
//          image: 'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
//          icon: 'size-6 text-neutral-400',
//       },
//       meta_pill: {},
//       action: {
//          wrapper: `inline-flex shrink-0 items-center justify-center gap-2 px-primary py-2 text-12! sm:text-14! font-semibold text-neutral-50 bg-primary-600 rounded-secondary shadow-xs transition-all cursor-pointer hover:bg-primary-500 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`,
//          icon: 'size-4',
//       },
//    },
//    body: {
//       wrapper: 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 p-secondary sm:p-7 bg-neutral-100/50',
//       item: {
//          wrapper: `group relative flex items-start gap-3.5 min-w-0 p-primary bg-neutral-50 border border-utility-200 rounded-secondary shadow-2xs transition-all duration-150 hover:border-primary-200 hover:shadow-sm`,
//          icon_box: themes.detail_icon_box,
//          icon: 'size-4',
//       },
//       content: {
//          wrapper: 'flex flex-1 flex-col min-w-0',
//          label: 'flex items-center justify-between mb-0.5 text-11! font-semibold uppercase tracking-wider text-neutral-400',
//          value: themes.detail_value,
//          link: cx(themes.detail_value({ isEmpty: false }), 'hover:text-primary-600 transition-colors'),
//          copy_button: `opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-primary-600 transition-opacity cursor-pointer`,
//          copy_icon: themes.copy_icon,
//       },
//    },
// };
