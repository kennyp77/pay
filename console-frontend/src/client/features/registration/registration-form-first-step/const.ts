export interface FormFirstStepValues {
  email?: string;
  phone?: string;
  site?: string;
  company_title_or_inn?: string;
  name?: string;
  company_title?: string;
  ogrn?: string;
  kpp?: string;
  address?: string;
  correspondence_address: string;
  director?: string;
  inn?: string;
  captcha?: string;
  terms?: boolean;
}

export const buttonNextStepText = 'К данным о платежном провайдере';
export const buttonContinueText = 'Продолжить';
export const maxCaptchaTries = 3000; // TODO: нужно 3, но пока нет api для капчи

export const initialValues: FormFirstStepValues = {
  email: '',
  phone: '',
  site: '',
  company_title_or_inn: '',
  name: '',
  company_title: '',
  ogrn: '',
  kpp: '',
  address: '',
  correspondence_address: '',
  director: '',
  inn: '',
  captcha: '',
  terms: false,
};
