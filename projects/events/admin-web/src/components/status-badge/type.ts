export interface Properties {
   className?: string;
   status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
   children?: React.ReactNode;
}
