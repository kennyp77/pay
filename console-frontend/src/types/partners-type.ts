import { ProviderProps } from 'types/providers-type';
import { ServiceProps } from 'types/services-type';
import { ResponseProps } from 'types/response-type';

export interface PartnerSuggestProps {
  name: string;
  inn: string;
  ogrn: string;
  kpp: string;
  address: string;
  correspondence_address: string;
  full_name: string;
  leader_name: string;
}

export interface PartnerDataProps extends PartnerSuggestProps {
  terms: boolean;
  email: string;
  phone: string;
  site: string;
  provider?: {
    id: ProviderProps['id'];
    creds?: string;
  };
  service?: ServiceProps['name'];
  service_name?: string;
  is_new_inn?: boolean;
}

export interface PartnersSuggestListProps {
  status: string;
  code: number;
  data: {
    items: PartnerSuggestProps[];
  };
}

export interface PartnerSubmitRequestProps {
  name: string;
  registration_data: {
    postal_code?: string;
    ogrn: string;
    tax_ref_number: string;
    kpp: string;
    contact: {
      first_name?: string;
      last_name?: string;
      email: string;
      phone: string;
      middle_name?: string;
    };
    ceo_name: string;
    full_company_name: string;
    legal_address: string;
    postal_address: string;
  };
}

export interface PartnerSubmitPatchRequest
  extends Omit<PartnerSubmitRequestProps, 'registration_data'> {
  registration_data: {
    contact: {
      email?: string;
      phone?: string;
    };
  };
}

export interface PartnerSubmitResponseProps extends ResponseProps {
  data: PartnerSubmitRequestProps & {
    partner_id: string;
  };
}

export type PartnerSubmitPatchResponseProps = PartnerSubmitResponseProps;

export interface PartnersListResponseProps extends ResponseProps {
  data: {
    partners: PartnerSubmitResponseProps['data'][];
  };
}

export interface MerchantProps {
  partner_id: string;
  merchant_id: string;
  updated: string;
  created: string;
  name: string;
  callback_url?: string;
}

export interface MerchantResponseProps extends ResponseProps {
  data: MerchantProps;
}

export interface MerchantsListResponseProps extends ResponseProps {
  data: {
    merchants: MerchantProps[];
  };
}

export type PartnerDataServiceResponseProps = ResponseProps;
