import { CompanySelector } from '@admin-web/features/company/selector';
import { useServicesCompanySearch } from '@admin-web/services/company/search';

const PageAuthorizeForgetPassword: AdminWeb.Router.Page = async () => {
   const [serviceCompanySearch] = await Promise.all([useServicesCompanySearch()]);

   const companies = serviceCompanySearch && !serviceCompanySearch.error ? serviceCompanySearch.data.companies : [];

   return (
      <CompanySelector
         currentCompanyId=""
         companies={companies}
      />
   );
};

export default PageAuthorizeForgetPassword;
