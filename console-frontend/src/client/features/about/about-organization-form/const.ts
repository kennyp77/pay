export interface AboutOrganizationFormValues {
  site?: string;
  inn?: string;
  company_title?: string;
  company_title_short?: string;
  ogrn?: string;
  address?: string;
  director?: string;
  same_address?: boolean;
  correspondence_address?: string;
  papers?: boolean;
}

export const initialValues: AboutOrganizationFormValues = {
  site: '',
  inn: '',
  company_title: '',
  company_title_short: '',
  ogrn: '',
  address: '',
  director: '',
  same_address: false,
  correspondence_address: '',
  papers: false,
};

export const aboutOrganizationFormFields = {
  site: {
    fieldName: 'site',
    label: 'Сайт',
  },
  inn: {
    fieldName: 'inn',
    label: 'ИНН',
    mask: '9999 9999 9999',
  },
  company_title: {
    fieldName: 'company_title',
    label: 'Полное наименование компании',
  },
  company_title_short: {
    fieldName: 'company_title_short',
    label: 'Сокращенное наименование компании',
  },
  ogrn: {
    fieldName: 'ogrn',
    label: 'ОГРН/ОГРНИП',
    mask: '999 9999 9999 9999',
  },
  director: {
    fieldName: 'director',
    label: 'ФИО директора',
  },
  address: {
    fieldName: 'address',
    label: 'Адрес регистрации компании',
    placeholder: 'Адрес регистрации компании',
  },
  same_address: {
    fieldName: 'same_address',
  },
  correspondence_address: {
    fieldName: 'correspondence_address',
    label: 'Адрес для корреспонденции',
  },
  papers: {
    fieldName: 'papers',
  },
};
