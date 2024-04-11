import { count, MetrikaCounter } from './utils';

type WithId = MetrikaCounter<{ id: string }>;

// Отправка кол-ва адресов, которые отображаются у пользователя на форме со списком адресов
export const addressList = count('address_list');

// Выбор адреса из саджеста
export const addressSuggestSelect = count('address_suggest_select');

// Отправка формы добавления адреса
export const addressAddFormSubmit = count('address_add_form_submit');

// Отправка формы редактирования адреса
export const addressEditFormSubmit = <WithId>count('address_edit_form_submit');

// Предложение заполнить квартиру на форме редактирования адреса
export const addressEditSuggestAddRoom = <WithId>count('address_edit_suggest_add_room');

// Изменение комнаты при редактировании адреса
export const addressEditTouchRoom = <WithId>count('address_edit_touch_room');
// Изменение подъезда при редактировании адреса
export const addressEditTouchEntrance = <WithId>count('address_edit_touch_entrance');
// Изменение этажа при редактировании адреса
export const addressEditTouchFloor = <WithId>count('address_edit_touch_floor');
// Изменение домафона при редактировании адреса
export const addressEditTouchIntercom = <WithId>count('address_edit_touch_intercom');

// Открытие окна удаления адреса
export const addressDeleteFormShow = count('address_delete_form_show');
// Закрытие окна удаления адреса
export const addressDeleteFormClose = count('address_delete_form_close');
// Отмена удаления адреса
export const addressDeleteFormAbort = count('address_delete_form_abort');
// Отправка формы удаления адреса
export const addressDeleteFormSubmit = <WithId>count('address_delete_form_submit');

// Измение адреса доставки
export const changeDeliveryAddress = <WithId>count('change_delivery_address');
