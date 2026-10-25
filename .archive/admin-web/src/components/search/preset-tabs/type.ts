export interface PresetTabOption<TValue extends string = string> {
   label: string;
   value: TValue;
}

export interface SearchPresetTabsProps<TValue extends string = string> {
   tabs: ReadonlyArray<PresetTabOption<TValue>>;
   activeValue: TValue;
   ariaLabel?: string;
   onChange: (value: TValue) => void;
}

