export interface AuditFooterItem {
   label: string;
   value: string;
}

export interface UpsertAuditFooterProps {
   items: ReadonlyArray<AuditFooterItem>;
}

