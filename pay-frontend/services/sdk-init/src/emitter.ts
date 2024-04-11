import { ConnectionOptions } from '@trust/utils/connections/connection-options';
import { MessageConnectionAgent } from '@trust/utils/connections/message-connection-agent';
import * as YaPay from '@yandex-pay/sdk/src/typings';

export class SdkFrameEmitter {
    private emitter: MessageConnectionAgent<YaPay.SdkReadyEvent>;

    static create(targetWindow: WindowProxy, targetOrigin: string): SdkFrameEmitter {
        return new SdkFrameEmitter(targetWindow, targetOrigin);
    }

    constructor(targetWindow: WindowProxy, targetOrigin: string) {
        const options = new ConnectionOptions(targetOrigin);

        this.emitter = MessageConnectionAgent.connect(options, targetWindow);
    }

    sdkReady(readyToPay: boolean): void {
        this.emitter.send({
            type: YaPay.InnerEventType.SdkReady,
            readyToPay,
        });
    }

    destroy(): void {
        this.emitter = null;
    }
}
