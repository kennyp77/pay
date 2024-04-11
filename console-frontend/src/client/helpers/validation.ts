import * as Yup from 'yup';

const oneAlphabetChecking = (value: string) => {
  const latinRegex = /[a-zA-Z]/;
  const cyrillicRegex = /[а-яА-Я]/;

  return latinRegex.test(value) && cyrillicRegex.test(value);
};

const alphabetChecking = (
  value: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: { createError: (arg0: { message: string }) => any },
) =>
  oneAlphabetChecking(value)
    ? context.createError({ message: 'Текст должен быть на одном языке' })
    : true;

const fieldsValidating = {
  email: Yup.string()
    .trim()
    .matches(
      /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
      'Похоже, в адресе эл. почты опечатка — проверьте, пожалуйста',
    )
    .required('Укажите эл.почту'),

  phone: Yup.string()
    .matches(
      // eslint-disable-next-line no-useless-escape
      /^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{10}$/g,
      'Укажите номер телефона',
    )
    .required('Укажите номер телефона'),
  site: Yup.string()
    .required('Укажите адрес сайта')
    .matches(
      // eslint-disable-next-line
      /^((ftp|http|https):\/\/)?(www\.)?([A-Za-zА-Яа-я0-9]{1}[A-Za-zА-Яа-я0-9\-]*\.?)*\.{1}[A-Za-zА-Яа-я0-9-]{2,8}(\/([\w#!:.?+=&%@!\-\/])*)?/,
      'Укажите корректный адрес',
    ),
};

export const stringDefaultValidationSchema = Yup.string()
  .matches(/^(?!\s*$).+/, { message: 'Введена пустая строка' })
  .required('Заполните поле');

export const mixedDefaultValidationSchema =
  Yup.mixed().required('Заполните поле');

export const registrationFirstStepValidationSchema = (isEditing: boolean) =>
  Yup.object().shape({
    email: fieldsValidating.email,

    phone: fieldsValidating.phone,

    site: fieldsValidating.site,

    company_title_or_inn: Yup.string().required(
      'Укажите ИНН или название компании',
    ),

    company_title: isEditing ? mixedDefaultValidationSchema : Yup.string(),

    name: isEditing ? mixedDefaultValidationSchema : Yup.string(),

    ogrn: isEditing ? mixedDefaultValidationSchema : Yup.string(),

    kpp: isEditing ? mixedDefaultValidationSchema : Yup.string(),

    address: isEditing
      ? mixedDefaultValidationSchema.test(
          'only_one_language',
          'Текст должен быть на одном языке',
          function (value) {
            return alphabetChecking(value as string, this);
          },
        )
      : Yup.string(),

    director: isEditing
      ? mixedDefaultValidationSchema.test(
          'only_one_language',
          'Текст должен быть на одном языке',
          function (value) {
            return alphabetChecking(value as string, this);
          },
        )
      : Yup.string(),

    correspondence_address: Yup.string().required('Укажите адрес'),

    terms: Yup.boolean().oneOf([true, false], 'Примите условия'),
  });

export const registrationSecondStepValidationSchema = Yup.lazy((obj) =>
  Yup.object(
    Object.keys(obj).reduce((acc: Record<string, Yup.AnySchema>, key) => {
      if (typeof obj[key] === 'string') {
        acc[key] = stringDefaultValidationSchema;
        return acc;
      }
      acc[key] = mixedDefaultValidationSchema;
      return acc;
    }, {}),
  ),
);

export const providerApplicationValidationSchema = Yup.object().shape({
  name: Yup.string().required('Укажите ваше имя'),

  email: fieldsValidating.email,

  phone: fieldsValidating.phone,
});

export const aboutContactsValidationSchema = Yup.object().shape({
  email: fieldsValidating.email,

  phone: fieldsValidating.phone,
});

export const aboutOrganizationValidationSchema = Yup.object().shape({
  site: fieldsValidating.site,

  company_title: mixedDefaultValidationSchema,

  address: mixedDefaultValidationSchema,

  director: mixedDefaultValidationSchema,
});

export const aboutAdditionalContactsValidationSchema = Yup.object().shape({
  name: Yup.string().required('Укажите ваше имя'),

  email: fieldsValidating.email,

  phone: fieldsValidating.phone,
});
