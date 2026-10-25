import { useStyle } from './use-style';

import type { SearchPresetTabsProps } from './type';

export function SearchPresetTabs<TValue extends string = string>({
   tabs,
   activeValue,
   ariaLabel = 'Preset views',
   onChange,
}: SearchPresetTabsProps<TValue>) {
   const { wrapper, tab } = useStyle;

   return (
      <nav
         className={wrapper()}
         aria-label={ariaLabel}
      >
         {tabs.map((item) => (
            <button
               key={item.value}
               type="button"
               onClick={() => onChange(item.value)}
               className={tab({ active: activeValue === item.value })}
            >
               {item.label}
            </button>
         ))}
      </nav>
   );
}

