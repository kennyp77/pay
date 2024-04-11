const errors = {
    cancelled: 'Привязка отклонена',
    authorization_reject: 'Ошибка платежной системы',
    expired_card: 'Карта просрочена',
    limit_exceeded: 'Достигнуты лимиты по операциям с картой',
    not_enough_funds: 'На карте недостаточно средств',
    payment_not_found: 'Платеж не найден',
    payment_refused: 'Платеж отклонен',
    payment_timeout: 'Транзакция завершилась по таймауту, попыток списания средств не было',
    technical_error: 'Техническая ошибка',
    fail_3ds: 'Проблема с прохождением 3DS',
    invalid_processing_request: 'Ошибка в переданных в платежную систему данных',
    restricted_card: 'Карта недействительна',
    transaction_not_permitted: 'Операция недоступна для данной карты',
    unknown_error: 'Произошла ошибка',
} as Record<string, string>;

export const getErrorDescription = (status: string): string => errors[status] || errors.unknown_error;
