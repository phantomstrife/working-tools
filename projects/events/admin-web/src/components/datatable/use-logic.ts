import { useDeepState } from '@admin-web/hooks/deep-state';
import { useTranslate } from '@admin-web/locale';

import { PAGE_SIZE_OPTIONS } from './constants';

import type * as Types from './type';

export function useLogic<T>(properties: Types.Properties<T>) {
   const { title, totalCount = 0, tools = [], pagination, isLoading = false } = properties;

   const { translate } = useTranslate({
      prefix: 'components.datatable',
   });

   const [state, setState] = useDeepState<Types.State>({
      page: pagination ? pagination.page : 1,
      pageSize: pagination ? pagination.pageSize : PAGE_SIZE_OPTIONS[0],
   });

   const currentPage = pagination ? pagination.page : state.page;
   const currentPageSize = pagination ? pagination.pageSize : state.pageSize;

   const totalPages = Math.max(1, Math.ceil(totalCount / currentPageSize));
   const safePage = Math.min(currentPage, totalPages);

   const handleLimitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
      const nextSize = Number(event.target.value);

      setState({
         page: 1,
         pageSize: nextSize,
      });

      pagination?.onPageSizeChange?.(nextSize);
   };

   const handlePageChange = (nextPage: number) => {
      if (nextPage < 1 || nextPage > totalPages || nextPage === safePage) {
         return;
      }

      setState({
         page: nextPage,
      });

      pagination?.onPageChange?.(nextPage);
   };

   return {
      param: {
         title,
         tools,
         totalCount,
         totalPages,
         safePage,
         pageSize: currentPageSize,
         rangeStart: totalCount === 0 ? 0 : (safePage - 1) * currentPageSize + 1,
         rangeEnd: Math.min(totalCount, safePage * currentPageSize),
         isLoading,
         isPrevDisabled: isLoading || safePage <= 1,
         isNextDisabled: isLoading || safePage >= totalPages,
      },
      func: {
         translate,
         handleLimitChange,
         handlePageChange,
      },
   };
}
