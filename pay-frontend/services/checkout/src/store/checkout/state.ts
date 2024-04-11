export enum PaymentStageType {
    Initial = 'initial',
    NewCard = 'new_card',
    Payment = 'payment',
    AuthYa = 'auth_ya',
    Auth3ds = 'auth_3ds',
    SplitPayment = 'split_payment',
    Failed = 'failed',
    SuccessInfo = 'success_info',
    SuccessRedirect = 'success_redirect',
}

export type PaymentFailedAction = {
    text: string;
    callback: Sys.CallbackFn0;
};

export interface PaymentState {
    stage:
        | { type: PaymentStageType.Initial }
        | { type: PaymentStageType.NewCard }
        | { type: PaymentStageType.Payment }
        | {
              type: PaymentStageType.AuthYa;
              challengePath: string;
          }
        | {
              type: PaymentStageType.Auth3ds;
              auth3ds: {
                  method: 'IFRAME';
                  url: string;
              };
          }
        | {
              type: PaymentStageType.SplitPayment;
              splitFrameUrl: Checkout.SplitFrameUrl;
          }
        | {
              type: PaymentStageType.Failed;
              reason?: string;
              action?: PaymentFailedAction;
          }
        | { type: PaymentStageType.SuccessInfo }
        | { type: PaymentStageType.SuccessRedirect };
    order?: {
        orderId: string;
        checkoutOrderId: string;
        transactionId?: string;
        metadata?: string;
    };
    processData?: Checkout.PaymentProcessData;
}

export const initialPaymentState: PaymentState = {
    stage: { type: PaymentStageType.Initial },
};
