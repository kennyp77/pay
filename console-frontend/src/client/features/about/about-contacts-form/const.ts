interface AboutContactsFormValues {
  email?: string;
  phone?: string;
}

export const initialValues: AboutContactsFormValues = {
  email: '',
  phone: '',
};

export const aboutContactsFormFields = {
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
