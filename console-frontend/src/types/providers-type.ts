import { ResponseProps } from 'types/response-type';

export enum ProvidersIDs {
  PAYTURE = 'payture',
  UNITELLER = 'uniteller',
}

export enum ProviderStatuses {
  READY = 'ready',
  DEPLOYED = 'deployed',
}

export enum ProviderApplicationState {
  SUCCESSED = 'successed',
  PROCESSING = 'processing',
  CANCELED = 'canceled',
}

export interface ProviderField {
  label: string;
  name: string;
  placeholder?: string;
  type: string; // 'text' | 'password'
  value?: string;
}

export interface ProviderProps {
  id: ProvidersIDs;
  name: string;
  logo_url: string;
  info_text: string;
  fields: ProviderField[];
}

export interface ProviderFutureProps {
  name: string;
  logo_url: string;
  info_text: string;
  link?: string;
  warning_text?: string;
  is_soon?: boolean;
  commission?: number | string;
}

export interface ProviderSubmitRequestProps {
  psp_external_id: ProvidersIDs;
  creds: string;
  encrypted: boolean;
  for_testing?: boolean;
  status?: ProviderStatuses;
}

export interface ProviderSubmitResponseProps {
  data: {
    integration_id: string;
    for_testing: boolean;
    revision: number;
    psp_external_id: string;
    created: string;
    updated: string;
    merchant_id: string;
    status: boolean;
  };
}

export interface ProvidersListResponseProps extends ResponseProps {
  data: {
    integrations: ProviderSubmitResponseProps['data'][];
  };
}

export interface ProviderApplicationSubmitRequestProps {
  name?: string;
  monthly_turnover?: string;
  average_bill?: string;
  email?: string;
  phone?: string;
}

export interface ProviderApplicationSubmitResponseProps {
  status: string;
  code: number;
  data: {
    state: ProviderApplicationState;
  };
}

export interface ProviderBankItemnProps {
  title: string;
  logo_url: string;
}
