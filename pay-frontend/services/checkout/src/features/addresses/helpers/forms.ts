import { object as YupObject, string as YupString } from 'yup';

const i18n = (v: string) => v;

export const validationSchema = YupObject().shape({
    address: YupString().required(i18n('Нужно заполнить это поле')),
    room: YupString().optional().default(''),
    entrance: YupString().optional().default(''),
    floor: YupString().optional().default(''),
    intercom: YupString().optional().default(''),
    comment: YupString().optional().default(''),
});

export const fields: Record<keyof Checkout.AddressFormData, any> = {
    address: {
        name: 'address',
        label: i18n('Город, улица, дом'),
    },
    room: {
        name: 'room',
        label: i18n('Квартира'),
    },
    entrance: {
        name: 'entrance',
        label: i18n('Подъезд'),
    },
    floor: {
        name: 'floor',
        label: i18n('Этаж'),
    },
    intercom: {
        name: 'intercom',
        label: i18n('Домофон'),
    },
    comment: {
        name: 'comment',
        label: i18n('Комментарий для адреса'),
    },
};

export const initialValues: Checkout.AddressFormData = {
    address: '',
    room: '',
    entrance: '',
    floor: '',
    intercom: '',
    comment: '',
};
