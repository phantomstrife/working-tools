import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';

import { getEventGames } from '@/modules/admin/services/company/overview/get-event-games';
import { getGameWorkspace } from '@/modules/admin/services/company/overview/get-game-workspace';
import { getInitialData } from '@/modules/admin/services/company/overview/get-initial-data';

import type { GameRow } from '@/modules/admin/services/company/overview/get-event-games/type';
import type {
   AssignedStaffMember,
   AttendantRow,
   PrizeRow,
} from '@/modules/admin/services/company/overview/get-game-workspace/type';
import type {
   CallerAccount,
   Company,
   CompanyOption,
   EventRow,
} from '@/modules/admin/services/company/overview/get-initial-data/type';

export function useLogic() {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();

   const urlCompanyId = searchParams.get('companyId') ?? '';
   const selectedEventId = searchParams.get('eventId') ?? '';
   const selectedGameId = searchParams.get('gameId') ?? '';

   const [caller, setCaller] = useState<CallerAccount | null>(null);
   const [company, setCompany] = useState<Company | null>(null);
   const [companies, setCompanies] = useState<CompanyOption[]>([]);
   const [events, setEvents] = useState<EventRow[]>([]);
   const [games, setGames] = useState<GameRow[]>([]);
   const [prizes, setPrizes] = useState<PrizeRow[]>([]);
   const [attendants, setAttendants] = useState<AttendantRow[]>([]);
   const [staff, setStaff] = useState<AssignedStaffMember[]>([]);

   const [isLoadingInitial, setIsLoadingInitial] = useState(true);
   const [isLoadingGames, setIsLoadingGames] = useState(Boolean(selectedEventId));
   const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(Boolean(selectedGameId));

   const updateUrl = useCallback(
      (updates: Record<string, string | null>) => {
         const params = new URLSearchParams(searchParams.toString());
         Object.entries(updates).forEach(([key, value]) => {
            if (!value) {
               params.delete(key);
            } else {
               params.set(key, value);
            }
         });
         const qs = params.toString();
         router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
      },
      [pathname, router, searchParams],
   );

   const refreshCompanyData = useCallback(async () => {
      try {
         const response = await getInitialData({ companyId: urlCompanyId || null });
         setCaller(response.caller);
         setCompany(response.company);
         setCompanies(response.companies);
         setEvents(response.events);
      } catch (error: unknown) {
         toast.error(error instanceof Error ? error.message : 'Failed to load company overview.');
      }
   }, [urlCompanyId]);

   const refreshWorkspaceData = useCallback(async () => {
      if (!selectedGameId) return;
      try {
         const response = await getGameWorkspace({ gameId: selectedGameId });
         setPrizes(response.prizes);
         setAttendants(response.attendants);
         setStaff(response.staff);
      } catch (error: unknown) {
         toast.error(error instanceof Error ? error.message : 'Failed to refresh game workspace.');
      }
   }, [selectedGameId]);

   useEffect(() => {
      let active = true;
      getInitialData({ companyId: urlCompanyId || null })
         .then((response) => {
            if (!active) return;
            setCaller(response.caller);
            setCompany(response.company);
            setCompanies(response.companies);
            setEvents(response.events);
         })
         .catch((error: unknown) => {
            if (!active) return;
            toast.error(error instanceof Error ? error.message : 'Failed to load company overview.');
         })
         .finally(() => {
            if (active) {
               setIsLoadingInitial(false);
            }
         });

      return () => {
         active = false;
      };
   }, [urlCompanyId]);

   useEffect(() => {
      if (!selectedEventId) {
         return;
      }

      let active = true;
      getEventGames({ eventId: selectedEventId })
         .then((response) => {
            if (!active) return;
            setGames(response.games);
         })
         .catch((error: unknown) => {
            if (!active) return;
            toast.error(error instanceof Error ? error.message : 'Failed to load event games.');
         })
         .finally(() => {
            if (active) {
               setIsLoadingGames(false);
            }
         });

      return () => {
         active = false;
      };
   }, [selectedEventId]);

   useEffect(() => {
      if (!selectedGameId) {
         return;
      }

      let active = true;
      getGameWorkspace({ gameId: selectedGameId })
         .then((response) => {
            if (!active) return;
            setPrizes(response.prizes);
            setAttendants(response.attendants);
            setStaff(response.staff);
         })
         .catch((error: unknown) => {
            if (!active) return;
            toast.error(error instanceof Error ? error.message : 'Failed to load game workspace.');
         })
         .finally(() => {
            if (active) {
               setIsLoadingWorkspace(false);
            }
         });

      return () => {
         active = false;
      };
   }, [selectedGameId]);

   function handleSwitchCompany(nextCompanyId: string) {
      setIsLoadingInitial(true);
      setGames([]);
      setPrizes([]);
      setAttendants([]);
      setStaff([]);
      updateUrl({
         companyId: nextCompanyId || null,
         eventId: null,
         gameId: null,
      });
   }

   function handleSelectEvent(nextEventId: string) {
      setGames([]);
      setPrizes([]);
      setAttendants([]);
      setStaff([]);
      if (nextEventId) {
         setIsLoadingGames(true);
      }
      updateUrl({
         eventId: nextEventId || null,
         gameId: null,
      });
   }

   function handleSelectGame(nextGameId: string) {
      setPrizes([]);
      setAttendants([]);
      setStaff([]);
      if (nextGameId) {
         setIsLoadingWorkspace(true);
      }
      updateUrl({
         gameId: nextGameId || null,
      });
   }

   const selectedGame = games.find((item) => item.id === selectedGameId) ?? null;

   return {
      param: {
         caller,
         company,
         companies,
         events,
         games,
         selectedEventId,
         selectedGameId,
         selectedGame,
         prizes,
         attendants,
         staff,
         isLoadingInitial,
         isLoadingGames,
         isLoadingWorkspace,
      },
      func: {
         handleSwitchCompany,
         handleSelectEvent,
         handleSelectGame,
         refreshCompanyData,
         refreshWorkspaceData,
      },
   };
}
