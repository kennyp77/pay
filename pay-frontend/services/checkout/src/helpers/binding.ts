import { AppPendingReason } from '../typings';

// TODO: Texts
export const preloaderDescriptionsMap: Record<string, string> = __DEV__
    ? {
          [AppPendingReason.PaymentMethodsLoading]: 'Загружаются доступные методы оплаты',
          [AppPendingReason.CardBindingFormLoading]: 'Загружается форма привязки карты',
          [AppPendingReason.CardBinding]: 'Привязывается карта',
      }
    : {
          [AppPendingReason.PaymentMethodsLoading]: 'Пожалуйста, подождите',
          [AppPendingReason.CardBindingFormLoading]: 'Пожалуйста, подождите',
          [AppPendingReason.CardBinding]: 'Пожалуйста, подождите',
      };
