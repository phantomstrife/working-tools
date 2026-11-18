import { tv } from 'tailwind-variants';

export const useStyle = tv({
  slots: {
    wrapper:
      'relative flex h-screen w-full flex-col overflow-hidden bg-neutral-950 text-neutral-50 select-none',
    canvasContainer: 'relative flex-1 w-full h-full overflow-hidden',
    canvas: 'block w-full h-full cursor-pointer',

    // Top HUD (Timer, Live Leaderboard, Quick Controls)
    topHud:
      'pointer-events-none absolute top-0 left-0 right-0 z-10 flex items-start justify-between gap-4 p-primary',
    brandCard:
      'pointer-events-auto flex flex-col gap-2 rounded-primary border border-neutral-800 bg-neutral-900/90 p-primary backdrop-blur-md',
    titleRow: 'flex items-center gap-2',
    titleText: 'text-20 font-bold tracking-tight text-primary-400',
    subtitleText: 'text-12 text-neutral-400',

    // Center Big Countdown Timer
    timerCard:
      'pointer-events-auto flex flex-col items-center rounded-primary border border-primary-500/40 bg-neutral-900/90 px-6 py-3 backdrop-blur-md',
    timerLabel: 'text-10 font-semibold tracking-widest uppercase text-neutral-400',
    timerValue: 'font-mono text-36 font-black tracking-wider text-neutral-50',
    timerValueUrgent: 'text-error-400 animate-pulse',

    // Live Top 5 Leaderboard
    leaderboardCard:
      'pointer-events-auto flex min-w-64 flex-col gap-1.5 rounded-primary border border-neutral-800 bg-neutral-900/90 p-primary backdrop-blur-md',
    leaderboardHeader:
      'flex items-center justify-between border-b border-neutral-800 pb-1.5 text-12 font-bold uppercase tracking-wider text-primary-400',
    leaderItem:
      'flex items-center justify-between gap-3 rounded-secondary bg-neutral-800/60 px-2.5 py-1 text-12',
    leaderRank:
      'flex h-5 w-5 items-center justify-center rounded-secondary bg-primary-500/20 font-mono text-10 font-bold text-primary-300',
    leaderRankFirst: 'bg-warning-500 text-neutral-950',
    leaderName: 'flex-1 truncate font-medium text-neutral-100',
    leaderCode: 'font-mono text-10 text-neutral-400',

    // Bottom Operator Control Bar
    bottomBar:
      'z-10 flex flex-wrap items-center justify-between gap-4 border-t border-neutral-800 bg-neutral-900/95 p-primary backdrop-blur-md',
    controlsGroup: 'flex flex-wrap items-center gap-3',
    controlField: 'flex items-center gap-2 rounded-secondary border border-neutral-800 bg-neutral-950 px-3 py-1.5',
    controlLabel: 'text-12 font-medium text-neutral-400',
    controlSelect:
      'bg-transparent text-14 font-semibold text-neutral-100 focus:outline-none cursor-pointer',
    controlInput:
      'w-16 bg-transparent text-center font-mono text-14 font-semibold text-neutral-100 focus:outline-none',

    btnPrimary:
      'flex items-center gap-2 rounded-secondary bg-primary-600 px-5 py-2.5 text-14 font-bold text-neutral-50 transition hover:bg-primary-500 disabled:opacity-50 cursor-pointer',
    btnDanger:
      'flex items-center gap-2 rounded-secondary bg-error-600 px-5 py-2.5 text-14 font-bold text-neutral-50 transition hover:bg-error-500 cursor-pointer',
    btnSecondary:
      'flex items-center gap-2 rounded-secondary border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-12 font-semibold text-neutral-200 transition hover:bg-neutral-700 cursor-pointer',

    shortcutHint: 'hidden xl:flex items-center gap-3 text-12 text-neutral-400',
    kbd: 'rounded-secondary border border-neutral-700 bg-neutral-800 px-1.5 py-0.5 font-mono text-10 text-neutral-200',

    // Winner Podium Overlay Modal
    winnerOverlay:
      'absolute inset-0 z-20 flex items-center justify-center bg-neutral-950/80 p-primary backdrop-blur-md',
    winnerModal:
      'flex w-full max-w-lg flex-col items-center gap-5 rounded-primary border border-warning-500/50 bg-neutral-900 p-primary text-center',
    winnerBadge:
      'flex items-center gap-2 rounded-secondary bg-warning-500/20 px-4 py-1 text-12 font-bold uppercase tracking-widest text-warning-400',
    winnerTitle: 'text-32 font-black tracking-tight text-neutral-50',
    winnerTicket:
      'rounded-secondary border border-primary-500/40 bg-primary-500/10 px-4 py-1.5 font-mono text-18 font-bold text-primary-300',
    winnerMeta: 'text-14 text-neutral-400',
    podiumList: 'flex w-full flex-col gap-2 border-t border-neutral-800 pt-4 text-left',
    podiumRow:
      'flex items-center justify-between rounded-secondary bg-neutral-800/70 px-3.5 py-2 text-14',
  },
});