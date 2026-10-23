import { useMemo, useState } from 'react';

import type { AssignedStaffMember } from '@/modules/admin/services/company/overview/get-game-workspace/type';

export type StaffPanelProps = {
   staff: AssignedStaffMember[];
   isLoading: boolean;
};

export function useLogic(props: StaffPanelProps) {
   const { staff, isLoading } = props;

   const [searchQuery, setSearchQuery] = useState('');

   const filteredStaff = useMemo(() => {
      const normalizedSearch = searchQuery.trim().toLowerCase();
      if (!normalizedSearch) {
         return staff;
      }

      return staff.filter((member) => {
         const matchesName = member.full_name.toLowerCase().includes(normalizedSearch);
         const matchesPhone = (member.phone ?? '').toLowerCase().includes(normalizedSearch);
         const matchesEmail = member.email.toLowerCase().includes(normalizedSearch);
         return matchesName || matchesPhone || matchesEmail;
      });
   }, [staff, searchQuery]);

   function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
      setSearchQuery(event.target.value);
   }

   function handleClearSearch() {
      setSearchQuery('');
   }

   return {
      param: {
         isLoading,
         searchQuery,
         totalCount: staff.length,
         filteredStaff,
      },
      func: {
         handleSearchChange,
         handleClearSearch,
      },
   };
}

