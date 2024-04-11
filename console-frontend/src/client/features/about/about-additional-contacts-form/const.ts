interface AboutAdditionalContactsFormValues {
  name?: string;
  email?: string;
  phone?: string;
}

export const initialValues: AboutAdditionalContactsFormValues = {
  name: '',
  email: '',
  phone: '',
};

export const aboutAdditionalContactsFormFields = {
  name: {
    fieldName: 'name',
    label: 'ФИО',
  },
  email: {
    fieldName: 'email',
    label: 'Эл. почта для связи',
  },
  phone: {
    fieldName: 'phone',
    label: 'Телефон для связи',
    mask: '+7?999999999',
    maskDefaultValue: '+7',
    contentVariant: 'mask',
  },
};
