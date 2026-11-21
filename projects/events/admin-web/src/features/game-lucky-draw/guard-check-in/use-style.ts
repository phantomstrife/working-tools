import { tv } from 'tailwind-variants';

import { modalFormStyle } from '@admin-web/components/modal/form-style';

const themes = {
   mode_tab: tv({
      base: 'flex-1 flex items-center justify-center gap-x-2 py-2 px-3 text-13 font-semibold rounded-primary transition-colors cursor-pointer',
      variants: {
         active: {
            true: 'bg-neutral-900 text-neutral-50 shadow-xs',
            false: 'text-neutral-600 hover:text-neutral-950 hover:bg-neutral-200/60',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
   submit_button: tv({
      base: 'w-full sm:w-auto flex items-center justify-center gap-x-2 px-secondary py-2.5 text-13 font-semibold rounded-primary transition-colors cursor-pointer shrink-0',
      variants: {
         disabled: {
            true: 'bg-neutral-300 text-neutral-500 cursor-not-allowed pointer-events-none',
            false: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-950',
         },
      },
      defaultVariants: {
         disabled: false,
      },
   }),
   camera_viewport: tv({
      base: 'relative flex items-center justify-center w-full aspect-4/3 bg-neutral-950 rounded-secondary overflow-hidden border-2 transition-colors',
      variants: {
         status: {
            IDLE: 'border-utility-300',
            VERIFYING: 'border-primary-500',
            PREVIEW: 'border-info-500',
            SUCCESS: 'border-success-500',
            ALREADY: 'border-warning-500',
            ERROR: 'border-error-500',
         },
      },
      defaultVariants: {
         status: 'IDLE',
      },
   }),
   camera_overlay: tv({
      base: 'pointer-events-none absolute inset-6 sm:inset-8 rounded-secondary border-2 transition-all',
      variants: {
         status: {
            IDLE: 'border-dashed border-success-400/80',
            VERIFYING: 'border-solid border-info-400 animate-pulse',
            PREVIEW: 'border-solid border-info-500',
            SUCCESS: 'border-solid border-success-500',
            ALREADY: 'border-solid border-warning-500',
            ERROR: 'border-solid border-error-500',
         },
      },
      defaultVariants: {
         status: 'IDLE',
      },
   }),
   camera_hud: tv({
      base: 'pointer-events-none absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 px-3 py-2 rounded-primary text-12 font-semibold shadow-lg backdrop-blur-xs border',
      variants: {
         status: {
            IDLE: 'bg-neutral-900/85 border-neutral-700 text-neutral-200',
            VERIFYING: 'bg-primary-900/90 border-info-400 text-neutral-50',
            PREVIEW: 'bg-info-900/95 border-info-400 text-neutral-50',
            SUCCESS: 'bg-success-900/95 border-success-400 text-neutral-50',
            ALREADY: 'bg-warning-900/95 border-warning-400 text-neutral-50',
            ERROR: 'bg-error-900/95 border-error-400 text-neutral-50',
         },
      },
      defaultVariants: {
         status: 'IDLE',
      },
   }),
   camera_button: tv({
      base: 'flex items-center justify-center w-full gap-x-2 px-primary py-2 text-13! font-semibold rounded-primary border transition-colors cursor-pointer',
      variants: {
         active: {
            true: 'bg-error-50 text-error-700 border-error-200 hover:bg-error-100',
            false: 'bg-neutral-900 text-neutral-50 border-neutral-900 hover:bg-neutral-950',
         },
      },
      defaultVariants: {
         active: false,
      },
   }),
   feedback_banner: tv({
      base: 'flex flex-col gap-y-3 p-primary rounded-secondary border',
      variants: {
         kind: {
            PREVIEW: 'bg-info-50 border-info-300 text-info-950',
            SUCCESS: 'bg-success-50 border-success-300 text-success-950',
            ALREADY: 'bg-warning-50 border-warning-300 text-warning-950',
            ERROR: 'bg-error-50 border-error-300 text-error-950',
         },
      },
   }),
   feedback_badge: tv({
      base: 'inline-flex items-center gap-x-1.5 px-2.5 py-1 text-11 font-bold uppercase tracking-wider rounded-primary',
      variants: {
         kind: {
            PREVIEW: 'bg-info-600 text-neutral-50',
            SUCCESS: 'bg-success-600 text-neutral-50',
            ALREADY: 'bg-warning-500 text-neutral-950',
            ERROR: 'bg-error-600 text-neutral-50',
         },
      },
   }),
   inline_action_btn: tv({
      base: 'inline-flex items-center justify-center gap-x-1.5 px-3.5 py-2 text-13 font-semibold rounded-primary transition-colors cursor-pointer',
      variants: {
         tone: {
            primary: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-950',
            secondary: 'bg-neutral-50 text-neutral-700 border border-utility-300 hover:bg-neutral-100',
         },
         disabled: {
            true: 'opacity-50 pointer-events-none cursor-not-allowed',
            false: '',
         },
      },
      defaultVariants: {
         tone: 'primary',
         disabled: false,
      },
   }),
   status_badge: tv({
      base: 'inline-flex items-center gap-x-1 px-2.5 py-0.5 text-11 font-semibold rounded-primary border whitespace-nowrap shrink-0',
      variants: {
         checkedIn: {
            true: 'bg-success-50 text-success-700 border-success-200',
            false: 'bg-warning-50 text-warning-700 border-warning-200',
         },
      },
      defaultVariants: {
         checkedIn: false,
      },
   }),
   manual_rep_box: tv({
      base: 'sm:col-span-2 flex flex-col gap-y-0.5 px-3 py-2 rounded-primary border min-w-0',
      variants: {
         hasValue: {
            true: 'bg-info-50/70 border-info-200',
            false: 'bg-neutral-100/70 border-utility-200',
         },
      },
      defaultVariants: {
         hasValue: false,
      },
   }),
   check_in_action: tv({
      base: 'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold rounded-primary transition-colors cursor-pointer whitespace-nowrap',
      variants: {
         checkedIn: {
            true: 'bg-success-50 text-success-700 border border-success-200',
            false: 'bg-neutral-900 text-neutral-50 hover:bg-neutral-950',
         },
         disabled: {
            true: 'opacity-60 pointer-events-none cursor-not-allowed',
         },
      },
      defaultVariants: {
         checkedIn: false,
         disabled: false,
      },
   }),
   refresh_icon: tv({
      base: 'w-4 h-4 shrink-0',
      variants: {
         loading: {
            true: 'animate-spin',
         },
      },
      defaultVariants: {
         loading: false,
      },
   }),
};

export const useStyle = {
   root: {
      wrapper: 'flex flex-col gap-y-secondary',
      grid: 'grid grid-cols-1 xl:grid-cols-12 gap-secondary items-start',
      left_col: 'xl:col-span-5 flex flex-col gap-y-secondary',
      right_col: 'xl:col-span-7 flex flex-col gap-y-secondary',
   },
   stats: {
      wrapper: 'grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-primary',
      card: 'flex flex-col justify-between gap-y-2 p-3 sm:p-primary bg-neutral-50 border border-utility-200 rounded-secondary shadow-2xs',
      header: 'flex items-center justify-between gap-1 text-12 font-medium text-neutral-500',
      value_row: 'flex flex-wrap items-baseline justify-between gap-1.5',
      value: 'text-22 sm:text-28 font-bold text-neutral-950 leading-none',
      value_success: 'text-22 sm:text-28 font-bold text-success-600 leading-none',
      progress_track: 'w-full h-2 bg-neutral-200 rounded-full overflow-hidden',
      progress_fill: 'h-full bg-success-500 transition-all duration-300',
      refresh_btn:
         'inline-flex items-center gap-x-1.5 px-2.5 py-1 text-11 font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-200 border border-utility-300 rounded-primary transition-colors cursor-pointer',
      refresh_icon: themes.refresh_icon,
   },
   card: {
      wrapper:
         'flex flex-col gap-y-primary p-primary sm:p-secondary bg-neutral-50 border border-utility-200 rounded-secondary shadow-2xs',
      header: 'flex flex-col gap-y-1',
      title_row: 'flex flex-wrap items-center justify-between gap-2',
      title: 'flex items-center gap-x-2 text-16 font-bold text-neutral-950',
      subtitle: 'text-13 text-neutral-500',
   },
   qr: {
      tabs: 'flex items-center gap-x-1 p-1 bg-neutral-100 border border-utility-200 rounded-primary',
      tab: themes.mode_tab,
      form: 'flex flex-col gap-y-3',
      label: 'text-12 font-semibold text-neutral-700',
      input_row: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2',
      input_wrapper:
         'flex-1 flex items-center gap-x-2.5 px-primary py-2.5 bg-neutral-100 border border-utility-300 rounded-primary focus-within:border-primary-500 focus-within:bg-neutral-50 transition-colors min-w-0',
      input: 'w-full min-w-0 text-14 font-mono text-neutral-950 bg-transparent placeholder:text-neutral-400',
      hint: 'text-12 text-neutral-500',
      submit: themes.submit_button,
      reset_button:
         'inline-flex items-center justify-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 border border-utility-300 rounded-primary transition-colors cursor-pointer shrink-0',
      camera: {
         wrapper: 'flex flex-col gap-y-3',
         viewport: themes.camera_viewport,
         video: 'w-full h-full object-cover',
         hidden_canvas: 'hidden',
         overlay: themes.camera_overlay,
         hud: themes.camera_hud,
         hud_left: 'flex items-center gap-x-2 min-w-0',
         hud_icon: 'w-4 h-4 shrink-0',
         hud_text: 'truncate',
         hud_ticket:
            'px-2 py-0.5 font-mono text-11 font-bold bg-neutral-950/60 text-neutral-50 rounded-primary shrink-0',
         placeholder:
            'absolute flex flex-col items-center justify-center gap-y-2 p-secondary text-center text-neutral-400',
         controls: 'flex flex-wrap items-center justify-between gap-2',
         controls_actions: 'flex flex-wrap items-center gap-2',
         button: themes.camera_button,
         error: 'p-3 text-13 font-medium text-error-700 bg-error-50 border border-error-200 rounded-primary',
      },
   },
   feedback: {
      verifying_banner:
         'flex items-center gap-x-3 p-primary rounded-secondary border border-primary-300 bg-primary-100/50 text-primary-950',
      verifying_icon_box:
         'flex items-center justify-center w-10 h-10 rounded-primary bg-primary-500 text-neutral-50 shrink-0',
      verifying_content: 'flex flex-col gap-y-0.5 min-w-0',
      verifying_title: 'text-13 font-bold uppercase tracking-wider text-primary-900',
      verifying_description: 'text-12 text-primary-800',
      banner: themes.feedback_banner,
      badge: themes.feedback_badge,
      top_row: 'flex flex-wrap items-center justify-between gap-2',
      name: 'flex items-center gap-x-2 text-20 font-bold text-neutral-950 break-words',
      meta_grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-utility-300/60 text-13',
      meta_item: 'flex flex-col min-w-0',
      meta_label: 'text-11 font-medium text-neutral-500 uppercase tracking-wider',
      meta_value: 'font-semibold text-neutral-900 truncate',
      ticket_code:
         'inline-flex px-2 py-0.5 font-mono text-13 font-bold bg-neutral-900 text-neutral-50 rounded-primary w-fit',
      inline_rep_box: 'flex flex-col gap-y-2.5 pt-3 border-t border-utility-300/60',
      inline_rep_grid: 'grid grid-cols-1 sm:grid-cols-2 gap-2.5',
      inline_rep_field: 'flex flex-col gap-y-1 min-w-0',
      inline_rep_field_full: 'sm:col-span-2 flex flex-col gap-y-1 min-w-0',
      inline_rep_label: 'text-11 font-semibold uppercase tracking-wider text-neutral-600',
      inline_rep_row: 'flex flex-col sm:flex-row items-stretch sm:items-center gap-2',
      inline_rep_input_wrapper:
         'flex-1 flex items-center gap-x-2 px-3 py-2 bg-neutral-50 border border-utility-300 rounded-primary focus-within:border-primary-500 transition-colors min-w-0',
      inline_rep_input: 'w-full min-w-0 text-13 text-neutral-950 bg-transparent placeholder:text-neutral-400',
      inline_rep_select: 'w-full min-w-0 text-13 text-neutral-950 bg-transparent cursor-pointer',
      inline_actions: 'flex flex-wrap items-center gap-2 pt-1',
      inline_action_btn: themes.inline_action_btn,
      empty: 'flex flex-col items-center justify-center gap-y-2 py-6 text-center text-13 text-neutral-500 bg-neutral-100/70 border border-dashed border-utility-300 rounded-secondary',
      recent: {
         wrapper: 'flex flex-col gap-y-2 pt-2 border-t border-utility-200',
         title: 'text-12 font-semibold uppercase tracking-wider text-neutral-500',
         list: 'flex flex-col divide-y divide-neutral-200 border border-utility-200 rounded-primary bg-neutral-50',
         item: 'flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-13',
         left: 'flex items-center gap-x-2.5 min-w-0 flex-1',
         name: 'font-semibold text-neutral-900 truncate min-w-0',
         ticket:
            'px-1.5 py-0.5 font-mono text-11 font-semibold bg-neutral-100 border border-utility-300 rounded-primary shrink-0',
         time: 'text-11 text-neutral-500 shrink-0',
      },
   },
   manual: {
      search_bar:
         'flex items-center gap-x-2.5 px-primary py-2.5 bg-neutral-100 border border-utility-300 rounded-primary focus-within:border-primary-500 focus-within:bg-neutral-50 transition-colors',
      search_input: 'w-full min-w-0 text-14 text-neutral-950 bg-transparent placeholder:text-neutral-400',
      clear_btn: 'text-neutral-400 hover:text-neutral-700 cursor-pointer shrink-0',
      empty_box:
         'flex flex-col items-center justify-center gap-y-2 py-12 px-secondary text-center text-13 text-neutral-500 bg-neutral-100/60 border border-dashed border-utility-300 rounded-secondary',
      results_scroll: 'overflow-y-auto overflow-x-hidden max-h-[480px] lg:max-h-[560px] flex flex-col gap-3 pr-1',
      card: 'flex flex-col gap-y-3 p-3.5 rounded-secondary border border-neutral-200 bg-neutral-50/50 transition-colors hover:border-neutral-300 min-w-0',
      card_header: 'flex flex-wrap items-start justify-between gap-2 min-w-0',
      card_title_group: 'flex flex-wrap items-center gap-2 min-w-0 flex-1',
      attendant_name: 'text-15 font-bold text-neutral-950 break-words min-w-0',
      ticket_badge:
         'inline-flex px-2 py-0.5 font-mono text-12 font-semibold text-neutral-800 bg-neutral-100 border border-utility-300 rounded-primary whitespace-nowrap shrink-0',
      status_badge: themes.status_badge,
      info_grid: 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 min-w-0',
      info_item: 'flex flex-col gap-y-0.5 min-w-0',
      info_label: 'text-11 font-semibold uppercase tracking-wider text-neutral-500',
      info_value: 'text-13 font-medium text-neutral-900 break-words min-w-0',
      info_email: 'text-12 text-neutral-600 break-all min-w-0',
      info_sub: 'text-12 text-neutral-500 break-words min-w-0',
      rep_box: themes.manual_rep_box,
      rep_label: 'text-11 font-semibold uppercase tracking-wider text-info-700',
      rep_label_empty: 'text-11 font-semibold uppercase tracking-wider text-neutral-500',
      rep_row: 'flex flex-wrap items-center gap-x-2 gap-y-0.5 min-w-0',
      representative_text: 'text-13 font-semibold text-neutral-950 break-words min-w-0',
      representative_phone: 'text-12 font-mono font-medium text-neutral-700 break-all',
      representative_empty: 'text-13 text-neutral-400',
      checked_in_meta:
         'sm:col-span-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-12 font-medium text-success-700 min-w-0',
      card_footer: 'flex flex-wrap items-center justify-end gap-2 pt-2.5 border-t border-neutral-200',
      edit_btn:
         'inline-flex items-center gap-x-1.5 px-3 py-1.5 text-12 font-semibold text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-utility-300 rounded-primary transition-colors cursor-pointer whitespace-nowrap',
      action_btn: themes.check_in_action,
   },
   edit_modal: {
      form: modalFormStyle.form,
      body: 'flex flex-col gap-y-primary p-primary sm:p-secondary',
      summary: 'flex flex-col gap-y-1 p-primary bg-neutral-100 border border-utility-200 rounded-primary',
      summary_top: 'flex flex-wrap items-center justify-between gap-2',
      summary_name: 'text-14 font-bold text-neutral-950',
      summary_ticket:
         'inline-flex px-2 py-0.5 font-mono text-11 font-semibold bg-neutral-50 border border-utility-300 rounded-primary shrink-0',
      summary_company: 'text-12 text-neutral-600',
      footer: modalFormStyle.footer,
   },
};
