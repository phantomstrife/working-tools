'use client';

import { Calendar, Gamepad2, Play, RefreshCw, ShieldAlert } from 'lucide-react';

import { LayoutAdmin } from '@admin-web/layouts/admin';

import { useLogic } from './use-logic';
import { useStyle } from './use-style';

export const PageOperatorHome: AdminWeb.Router.Page = () => {
   const { state, param, func } = useLogic();
   const { root } = useStyle;

   return (
      <LayoutAdmin>
         <div className={root.wrapper}>
            <div className={root.card}>
               {state.isLoading ? (
                  <div className={root.empty}>
                     <div className={root.empty_icon}>
                        <RefreshCw
                           size={22}
                           className={root.loading_icon}
                        />
                     </div>
                     <p className={root.empty_description}>{func.translate('loading')}</p>
                  </div>
               ) : state.events.length === 0 ? (
                  <div className={root.empty}>
                     <div className={root.empty_icon}>
                        <ShieldAlert size={24} />
                     </div>
                     <h2 className={root.empty_title}>{func.translate('empty_title')}</h2>
                     <p className={root.empty_description}>{func.translate('empty_description')}</p>
                  </div>
               ) : (
                  <>
                     <div className={root.header}>
                        <h1 className={root.title}>{func.translate('title')}</h1>
                        <p className={root.description}>{func.translate('description')}</p>
                     </div>

                     <form
                        className={root.form}
                        onSubmit={func.handleOpenGame}
                     >
                        <div className={root.field}>
                           <label
                              htmlFor="operator-event-select"
                              className={root.label}
                           >
                              <Calendar size={14} />
                              {func.translate('event_label')}
                           </label>
                           <select
                              id="operator-event-select"
                              value={state.selectedEventId}
                              onChange={func.handleEventChange}
                              className={root.select}
                           >
                              {state.events.map((ev) => (
                                 <option
                                    key={ev.id}
                                    value={ev.id}
                                 >
                                    {ev.name}
                                 </option>
                              ))}
                           </select>
                        </div>

                        <div className={root.field}>
                           <label
                              htmlFor="operator-game-select"
                              className={root.label}
                           >
                              <Gamepad2 size={14} />
                              {func.translate('game_label')}
                           </label>
                           <select
                              id="operator-game-select"
                              value={state.selectedGameId}
                              disabled={param.games.length === 0}
                              onChange={func.handleGameChange}
                              className={root.select}
                           >
                              {param.games.length === 0 ? (
                                 <option value="">{func.translate('no_games')}</option>
                              ) : (
                                 param.games.map((g) => (
                                    <option
                                       key={g.id}
                                       value={g.id}
                                    >
                                       {g.name} ({g.game_type})
                                    </option>
                                 ))
                              )}
                           </select>
                        </div>

                        <button
                           type="submit"
                           disabled={param.isSubmitDisabled}
                           className={root.submit({ disabled: param.isSubmitDisabled })}
                        >
                           <Play size={16} />
                           {func.translate('submit_btn')}
                        </button>
                     </form>
                  </>
               )}
            </div>
         </div>
      </LayoutAdmin>
   );
};
