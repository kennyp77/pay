import { object as YupObject, string as YupString } from 'yup';

const i18n = (v: string) => v;

const phoneNumberMask = '+70000000000';
const phoneNumberRegex = /\+7\d{10}/;

export const validationSchema = YupObject().shape({
    firstName: YupString().required(i18n('Нужно заполнить это поле')),
    lastName: YupString().required(i18n('Нужно заполнить это поле')),
    phoneNumber: YupString()
        .required(i18n('Нужно заполнить это поле'))
        .matches(phoneNumberRegex, i18n('Недопустимый формат номера')),
    email: YupString()
        .required(i18n('Нужно заполнить это поле'))
        .email(i18n('E-mail указан некорректно')),
});

export const fields: Record<keyof Omit<Checkout.ContactFormData, 'secondName'>, any> = {
    firstName: {
        name: 'firstName',
        label: i18n('Имя'),
    },
    lastName: {
        name: 'lastName',
        label: i18n('Фамилия'),
    },
    phoneNumber: {
        name: 'phoneNumber',
        label: i18n('Телефон'),
        mask: phoneNumberMask,
        maskType: 'phone',
        placeholder: '+7',
    },
    email: {
        name: 'email',
        label: i18n('Электронная почта'),
    },
};

export const initialValues: Checkout.ContactFormData = {
    firstName: '',
    lastName: '',
    secondName: '',
    phoneNumber: '',
    email: '',
};
