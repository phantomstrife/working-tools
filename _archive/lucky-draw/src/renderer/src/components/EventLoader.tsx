import React, { useEffect, useMemo, useState } from 'react';
import { useDrawStore } from '../stores/lucky-draw';
import { supabase } from '@renderer/lib/supabase';

const selectClass =
   'w-full px-3 py-2 text-sm text-white bg-slate-900 border border-slate-700 rounded-lg focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors';

export const EventLoader: React.FC = () => {
   const [categories, setCategories] = useState<any[]>([]);
   const [events, setEvents] = useState<any[]>([]);
   const [selectedCategory, setSelectedCategory] = useState<string>('');
   const [loadingEvent, setLoadingEvent] = useState(false);
   const [collapsed, setCollapsed] = useState(false);

   const fetchEventData = useDrawStore((s) => s.fetchEventData);
   const selectedEventId = useDrawStore((s) => s.selectedEventId);
   const prizes = useDrawStore((s) => s.prizes);
   const participants = useDrawStore((s) => s.participants);
   const currentPrizeIndex = useDrawStore((s) => s.currentPrizeIndex);
   const setCurrentPrize = useDrawStore((s) => s.setCurrentPrize);
   const isSpinning = useDrawStore((s) => s.isSpinning);
   const stoppedReels = useDrawStore((s) => s.stoppedReels);
   const winnerId = useDrawStore((s) => s.winnerId);
   const drawMode = useDrawStore((s) => s.drawMode);
   const setDrawMode = useDrawStore((s) => s.setDrawMode);
   const startDraw = useDrawStore((s) => s.startDraw);
   const handleManualStop = useDrawStore((s) => s.handleManualStop);
   const showWinners = useDrawStore((s) => s.showWinners);
   const setShowWinners = useDrawStore((s) => s.setShowWinners);
   const notice = useDrawStore((s) => s.notice);
   const clearNotice = useDrawStore((s) => s.clearNotice);

   useEffect(() => {
      supabase
         .from('categories')
         .select('*')
         .order('name')
         .then(({ data, error }) => {
            if (error) console.error('categories error:', error.message);
            setCategories(data || []);
         });
   }, []);

   // Hide the in-flight winner while reels are still spinning so operator stats don't spoil early
   const hiddenId = isSpinning ? winnerId : null;

   const stats = useMemo(() => {
      const wonByPrize = new Map<string, number>();
      let totalWon = 0;
      for (const p of participants) {
         if (p.prizeId && p.id !== hiddenId) {
            wonByPrize.set(p.prizeId, (wonByPrize.get(p.prizeId) ?? 0) + 1);
            totalWon++;
         }
      }
      return {
         wonByPrize,
         scanned: participants.length,
         eligible: Math.max(participants.length - totalWon, 0),
         totalPrizes: prizes.reduce((sum, p) => sum + p.quantity, 0),
         totalWon,
      };
   }, [participants, prizes, hiddenId]);

   const handleCategoryChange = async (catId: string) => {
      setSelectedCategory(catId);
      setEvents([]);
      if (!catId) return;

      const { data, error } = await supabase.from('events').select('id, title').eq('category_id', catId).order('title');
      if (error) console.error('events error:', error.message);
      setEvents(data || []);
   };

   const loadEvent = async (eventId: string) => {
      if (!eventId) return;
      setLoadingEvent(true);
      await fetchEventData(eventId);
      setLoadingEvent(false);
   };

   const eventValue = events.some((e) => e.id === selectedEventId) ? selectedEventId! : '';
   const busy = isSpinning || loadingEvent;
   const currentPrize = prizes[currentPrizeIndex] || null;
   const currentPrizeWon = currentPrize ? (stats.wonByPrize.get(currentPrize.id) ?? 0) : 0;
   const currentPrizeDone = !!currentPrize && currentPrizeWon >= currentPrize.quantity;

   if (collapsed) {
      return (
         <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-2">
            {notice && (
               <div
                  onClick={clearNotice}
                  className={`cursor-pointer max-w-xs px-3.5 py-2 rounded-xl border text-xs font-medium shadow-xl backdrop-blur-md ${
                     notice.kind === 'error'
                        ? 'bg-red-950/90 border-red-800 text-red-200'
                        : 'bg-amber-950/90 border-amber-700 text-amber-200'
                  }`}
               >
                  {notice.text}
               </div>
            )}
            <div className="flex items-center gap-2 p-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-2xl backdrop-blur-md text-slate-100">
               {prizes.length > 0 && (
                  <button
                     onClick={startDraw}
                     disabled={isSpinning && drawMode !== 'instant'}
                     className="px-4 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full bg-yellow-500 text-slate-950 hover:bg-yellow-400 disabled:opacity-50 transition-colors"
                  >
                     {isSpinning ? 'Spinning...' : 'Draw'}
                  </button>
               )}
               {drawMode === 'manual' && isSpinning && (
                  <button
                     onClick={handleManualStop}
                     className="px-3 py-1.5 text-xs font-bold tracking-wider uppercase rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors tabular-nums"
                  >
                     Stop ({stoppedReels}/{winnerId.length})
                  </button>
               )}
               <button
                  onClick={() => setCollapsed(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white rounded-full hover:bg-slate-800 transition-colors"
                  title="Expand operator controls"
               >
                  Operator ▲
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="fixed w-80 bottom-5 right-5 flex flex-col gap-3 z-50 select-none">
         {/* Non-blocking Toast Banner */}
         {notice && (
            <div
               className={`flex items-start justify-between gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-medium shadow-2xl backdrop-blur-md ${
                  notice.kind === 'error'
                     ? 'bg-red-950/90 border-red-800 text-red-200'
                     : 'bg-amber-950/90 border-amber-700 text-amber-200'
               }`}
            >
               <span>{notice.text}</span>
               <button onClick={clearNotice} className="text-current opacity-70 hover:opacity-100 font-bold leading-none">
                  ×
               </button>
            </div>
         )}

         {/* Main Operator Card */}
         <div className="flex flex-col gap-3.5 p-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-slate-100 shadow-2xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
               <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400" />
                  <h4 className="font-bold text-xs tracking-wider text-yellow-400 uppercase">Operator Controls</h4>
               </div>
               <div className="flex items-center gap-1">
                  {selectedEventId && (
                     <button
                        onClick={() => loadEvent(selectedEventId)}
                        disabled={busy}
                        title="Reload checked-in guests from Supabase"
                        className="px-2 py-1 text-[11px] font-semibold rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700 disabled:opacity-50 transition-colors"
                     >
                        {loadingEvent ? 'Syncing...' : '↻ Sync'}
                     </button>
                  )}
                  <button
                     onClick={() => setCollapsed(true)}
                     title="Minimize panel"
                     className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
                  >
                     Minimize ▼
                  </button>
               </div>
            </div>

            {/* Category & Event Selectors */}
            <div className="space-y-2.5">
               <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                     Category
                  </label>
                  <select
                     value={selectedCategory}
                     onChange={(e) => handleCategoryChange(e.target.value)}
                     disabled={busy}
                     className={selectClass}
                  >
                     <option value="">-- Select Category --</option>
                     {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                           {c.name}
                        </option>
                     ))}
                  </select>
               </div>

               <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                     Event
                  </label>
                  <select
                     value={eventValue}
                     onChange={(e) => loadEvent(e.target.value)}
                     disabled={!events.length || busy}
                     className={selectClass}
                  >
                     <option value="">-- Select Event --</option>
                     {events.map((e) => (
                        <option key={e.id} value={e.id}>
                           {e.title}
                        </option>
                     ))}
                  </select>
               </div>

               <div>
                  <div className="flex items-center justify-between mb-1">
                     <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Active Prize
                     </label>
                     {currentPrize && (
                        <button
                           onClick={() => setShowWinners((v) => !v)}
                           className="text-[11px] font-semibold text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                           {showWinners ? 'Hide Winners (W)' : 'Show Winners (W)'}
                        </button>
                     )}
                  </div>
                  <select
                     value={prizes.length ? currentPrizeIndex : ''}
                     onChange={(e) => setCurrentPrize(Number(e.target.value))}
                     disabled={!prizes.length || busy}
                     className={selectClass}
                  >
                     <option value="" disabled>
                        -- Select Prize --
                     </option>
                     {prizes.map((p, i) => {
                        const won = stats.wonByPrize.get(p.id) ?? 0;
                        const done = won >= p.quantity;
                        return (
                           <option key={p.id} value={i}>
                              {done ? '✓ ' : ''}
                              {p.name} ({won}/{p.quantity})
                           </option>
                        );
                     })}
                  </select>
               </div>
            </div>

            {/* Live Event Telemetry */}
            {selectedEventId && (
               <div className="grid grid-cols-3 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                     <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Checked In</div>
                     <div className="text-base font-bold text-white tabular-nums mt-0.5">{stats.scanned}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                     <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Eligible</div>
                     <div className="text-base font-bold text-emerald-400 tabular-nums mt-0.5">{stats.eligible}</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                     <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Drawn</div>
                     <div className="text-base font-bold text-yellow-400 tabular-nums mt-0.5">
                        {stats.totalWon}/{stats.totalPrizes}
                     </div>
                  </div>
               </div>
            )}

            {/* Draw Controls */}
            {prizes.length > 0 && (
               <div className="flex flex-col gap-3 pt-2 border-t border-slate-800">
                  <div>
                     <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                        Draw Mode
                     </label>
                     <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-slate-950 border border-slate-800">
                        {(['auto', 'manual', 'instant'] as const).map((mode) => {
                           const active = drawMode === mode;
                           return (
                              <button
                                 key={mode}
                                 type="button"
                                 disabled={isSpinning}
                                 onClick={() => setDrawMode(mode)}
                                 className={`py-1.5 text-xs font-semibold capitalize rounded-lg transition-colors disabled:opacity-50 ${
                                    active
                                       ? 'bg-yellow-500 text-slate-950 shadow'
                                       : 'text-slate-400 hover:text-slate-200'
                                 }`}
                              >
                                 {mode}
                              </button>
                           );
                        })}
                     </div>
                  </div>

                  <div className="flex flex-col gap-2">
                     <button
                        onClick={startDraw}
                        disabled={(isSpinning && drawMode !== 'instant') || prizes.length === 0 || currentPrizeDone}
                        className="w-full px-4 py-3 font-bold text-sm tracking-wider uppercase text-slate-950 transition-all bg-yellow-500 rounded-xl shadow-lg hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99]"
                     >
                        {isSpinning
                           ? 'Spinning Reels...'
                           : currentPrizeDone
                             ? 'Prize Pool Completed'
                             : 'Start Draw'}
                     </button>

                     {drawMode === 'manual' && isSpinning && (
                        <button
                           onClick={handleManualStop}
                           className="w-full px-4 py-2.5 font-bold text-sm tracking-wider uppercase text-white transition-all bg-red-600 rounded-xl shadow-lg hover:bg-red-500 tabular-nums"
                        >
                           Stop Next Reel ({stoppedReels}/{winnerId.length}) · Space
                        </button>
                     )}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};
