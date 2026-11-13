export type Company = Pick<AdminWeb.Database.Company, 'id' | 'name'>;

export interface Properties {
   currentCompanyId: string;
   companies: Company[];
}
