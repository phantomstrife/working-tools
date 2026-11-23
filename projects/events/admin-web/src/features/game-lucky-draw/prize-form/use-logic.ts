import { useEffect, useMemo, useState, useTransition } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { useTranslate } from '@admin-web/locale';
import { useServicesGameLuckyDrawPrizeAttendantCandidates } from '@admin-web/services/game-lucky-draw/prize-attendant-candidates';
import { useServicesGameLuckyDrawPrizeSave } from '@admin-web/services/game-lucky-draw/prize-save';

import { schema } from './constants';

import type * as Types from './type';

const EMPTY_DESIGNATED_IDS: string[] = [];

const getInitialValues = (prize?: Types.Prize | null): Types.FormValues => ({
   name: prize?.name ?? '',
   tier_order: prize?.tier_order ?? 1,
   total_quantity: prize?.total_quantity ?? 1,
   remaining_quantity: prize?.remaining_quantity ?? 1,
   image_url: prize?.image_url ?? '',
   description: prize?.description ?? '',
   designated_attendant_ids: prize?.designated_attendant_ids ?? [],
});

const formatFullName = (salutation: string | null, fullName: string): string => {
   return [salutation?.trim(), fullName.trim()].filter(Boolean).join(' ');
};

const formatRepresentativeName = (salutation: string | null, representative: string | null): string | null => {
   const trimmed = representative?.trim();
   if (!trimmed) {
      return null;
   }

   return [salutation?.trim(), trimmed].filter(Boolean).join(' ');
};

const isAbsentForfeited = (metadata: unknown): boolean => {
   if (typeof metadata !== 'object' || metadata === null || Array.isArray(metadata)) {
      return false;
   }

   return Boolean((metadata as Record<string, unknown>).is_absent_forfeited);
};

const resolveCandidateStatus = (candidate: Types.AttendantCandidate | null): Types.CandidateStatus => {
   if (!candidate) {
      return 'MISSING';
   }

   if (!candidate.is_draw_eligible) {
      return 'INELIGIBLE';
   }

   if (candidate.has_won) {
      return 'HAS_WON';
   }

   if (isAbsentForfeited(candidate.custom_metadata)) {
      return 'ABSENT';
   }

   if (!candidate.is_checked_in) {
      return 'NOT_CHECKED_IN';
   }

   return 'ELIGIBLE';
};

export function useLogic(properties: Types.Properties) {
   const { gameId, prize = null, onSuccess, onCancel } = properties;

   const mode: Types.Mode = prize ? 'edit' : 'create';
   const [isPending, startTransition] = useTransition();
   const [candidatesState, setCandidatesState] = useState<Types.CandidatesState>({
      items: [],
      isLoading: true,
      error: '',
      search: '',
   });

   const { translate } = useTranslate({
      prefix: 'features.lucky_draw.prize_form',
   });

   const { translate: translateRoot } = useTranslate({
      prefix: '',
   });

   const { control, formState, register, handleSubmit, reset, setValue } = useForm<Types.FormValues>({
      resolver: zodResolver(schema),
      defaultValues: getInitialValues(prize),
      mode: 'onChange',
   });

   const watchedDesignatedIds = useWatch({
      control,
      name: 'designated_attendant_ids',
   });
   const designatedAttendantIds = watchedDesignatedIds ?? EMPTY_DESIGNATED_IDS;

   useEffect(() => {
      reset(getInitialValues(prize));
   }, [prize, reset]);

   useEffect(() => {
      let cancelled = false;

      const loadCandidates = async () => {
         if (!gameId) {
            setCandidatesState((previous) => ({
               ...previous,
               items: [],
               isLoading: false,
               error: '',
            }));
            return;
         }

         setCandidatesState((previous) => ({
            ...previous,
            isLoading: true,
            error: '',
         }));

         const candidatesResult = await useServicesGameLuckyDrawPrizeAttendantCandidates({ gameId });

         if (cancelled) {
            return;
         }

         if (candidatesResult.error || !candidatesResult.data) {
            const rawError = candidatesResult.error ? candidatesResult.message : 'services.game_lucky_draw.attendant.not_found';
            const localizedError = rawError.startsWith('services.') ? translateRoot(rawError) : rawError;

            setCandidatesState((previous) => ({
               ...previous,
               items: [],
               isLoading: false,
               error: localizedError,
            }));
            return;
         }

         setCandidatesState((previous) => ({
            ...previous,
            items: candidatesResult.data.attendants,
            isLoading: false,
            error: '',
         }));
      };

      void loadCandidates();

      return () => {
         cancelled = true;
      };
   }, [gameId, translateRoot]);

   const candidatesById = useMemo(() => {
      return new Map(candidatesState.items.map((item) => [item.id, item]));
   }, [candidatesState.items]);

   const rankedCandidates = useMemo<Types.RankedCandidateItem[]>(() => {
      return designatedAttendantIds.map((attendantId, index) => {
         const candidate = candidatesById.get(attendantId) ?? null;

         return {
            id: attendantId,
            rank: index + 1,
            ticketCode: candidate?.ticket_code ?? '—',
            displayName: candidate
               ? formatFullName(candidate.salutation, candidate.full_name)
               : translate('fields.designated_attendants.missing_attendant'),
            representativeName: candidate
               ? formatRepresentativeName(candidate.representative_salutation, candidate.representative)
               : null,
            companyName: candidate?.company_name?.trim() || null,
            status: resolveCandidateStatus(candidate),
         };
      });
   }, [designatedAttendantIds, candidatesById, translate]);

   const availableCandidates = useMemo<Types.AvailableCandidateItem[]>(() => {
      const query = candidatesState.search.trim().toLowerCase();

      if (!query) {
         return [];
      }

      const selectedSet = new Set(designatedAttendantIds);

      return candidatesState.items
         .filter((candidate) => {
            if (selectedSet.has(candidate.id)) {
               return false;
            }

            const searchableFields = [
               candidate.ticket_code,
               candidate.full_name,
               formatFullName(candidate.salutation, candidate.full_name),
               candidate.representative ?? '',
               formatRepresentativeName(candidate.representative_salutation, candidate.representative) ?? '',
               candidate.company_name ?? '',
               candidate.phone ?? '',
            ];

            return searchableFields.some((field) => field.toLowerCase().includes(query));
         })
         .map((candidate) => ({
            id: candidate.id,
            ticketCode: candidate.ticket_code,
            displayName: formatFullName(candidate.salutation, candidate.full_name),
            representativeName: formatRepresentativeName(candidate.representative_salutation, candidate.representative),
            companyName: candidate.company_name?.trim() || null,
            status: resolveCandidateStatus(candidate),
         }));
   }, [candidatesState.items, candidatesState.search, designatedAttendantIds]);

   const handleTotalQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (mode !== 'create') {
         return;
      }

      const nextTotal = Number(event.target.value);
      if (!Number.isNaN(nextTotal) && nextTotal >= 0) {
         setValue('remaining_quantity', nextTotal, { shouldValidate: true });
      }
   };

   const handleAddDesignatedAttendant = (attendantId: string) => {
      if (designatedAttendantIds.includes(attendantId)) {
         return;
      }

      const nextIds = [...designatedAttendantIds, attendantId];
      setValue('designated_attendant_ids', nextIds, { shouldDirty: true, shouldValidate: true });
   };

   const handleRemoveDesignatedAttendant = (attendantId: string) => {
      const nextIds = designatedAttendantIds.filter((id) => id !== attendantId);
      setValue('designated_attendant_ids', nextIds, { shouldDirty: true, shouldValidate: true });
   };

   const handleMoveDesignatedAttendant = (index: number, direction: Types.MoveDirection) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;

      if (targetIndex < 0 || targetIndex >= designatedAttendantIds.length) {
         return;
      }

      const nextIds = [...designatedAttendantIds];
      const [moved] = nextIds.splice(index, 1);
      nextIds.splice(targetIndex, 0, moved);

      setValue('designated_attendant_ids', nextIds, { shouldDirty: true, shouldValidate: true });
   };

   const handleClearDesignatedAttendants = () => {
      if (designatedAttendantIds.length === 0) {
         return;
      }

      setValue('designated_attendant_ids', [], { shouldDirty: true, shouldValidate: true });
   };

   const handleCandidateSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setCandidatesState((previous) => ({
         ...previous,
         search: event.target.value,
      }));
   };

   const handleClearCandidateSearch = () => {
      setCandidatesState((previous) => ({
         ...previous,
         search: '',
      }));
   };

   const handleCandidateSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
         event.preventDefault();
      }
   };

   const onSubmit = handleSubmit((values) => {
      startTransition(async () => {
         const saveResult = await useServicesGameLuckyDrawPrizeSave({
            id: prize?.id,
            gameId,
            name: values.name,
            tier_order: values.tier_order,
            total_quantity: values.total_quantity,
            remaining_quantity: mode === 'create' ? values.total_quantity : values.remaining_quantity,
            image_url: values.image_url || null,
            description: values.description || null,
            designated_attendant_ids: values.designated_attendant_ids,
         });

         if (saveResult.error) {
            const localizedError = saveResult.message.startsWith('services.')
               ? translateRoot(saveResult.message)
               : saveResult.message;

            toast.error(localizedError);
            return;
         }

         toast.success(translate(`toast.${mode}_success`));
         reset(getInitialValues(saveResult.data.prize));
         setCandidatesState((previous) => ({
            ...previous,
            search: '',
         }));
         onSuccess?.(saveResult.data.prize);
      });
   });

   return {
      param: {
         mode,
         isPending,
         isSubmitDisabled: isPending || (mode === 'edit' && !formState.isDirty),
         errors: formState.errors,
         rankedCandidates,
         availableCandidates,
         totalCandidatesCount: candidatesState.items.length,
         isLoadingCandidates: candidatesState.isLoading,
         candidatesError: candidatesState.error,
         candidateSearch: candidatesState.search,
         hasCandidateSearch: Boolean(candidatesState.search.trim()),
      },
      func: {
         translate,
         register,
         handleTotalQuantityChange,
         handleAddDesignatedAttendant,
         handleRemoveDesignatedAttendant,
         handleMoveDesignatedAttendant,
         handleClearDesignatedAttendants,
         handleCandidateSearchChange,
         handleClearCandidateSearch,
         handleCandidateSearchKeyDown,
         onSubmit,
         onCancel,
      },
   };
}
