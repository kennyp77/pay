type RpcQueueTaskId = number;
type RpcQueueTaskFn = Sys.CallbackFn0;

type RpcQueueTaskRecord = {
    id: RpcQueueTaskId;
    fn: Sys.CallbackFn0;
};

interface RpcQueueTask {
    done: Sys.CallbackFn0;
    register: Sys.CallbackFn1<RpcQueueTaskFn>;
}

export class RpcQueue {
    idx = 0;
    started: RpcQueueTaskId | null = null;
    queue: RpcQueueTaskRecord[] = [];

    private run() {
        const { id, fn } = this.queue[0] || {};

        if (fn && !this.started) {
            this.started = id;
            setTimeout(fn, 0);
        }
    }

    private done(id: RpcQueueTaskId) {
        this.queue = this.queue.filter((task) => task.id !== id);
        this.started = null;
        this.run();
    }

    private register(id: RpcQueueTaskId, fn: RpcQueueTaskFn) {
        this.queue.push({ id, fn });
        this.run();
    }

    task(): RpcQueueTask {
        this.idx += 1;

        const id = this.idx;

        return {
            done: () => this.done(id),
            register: (fn: RpcQueueTaskFn) => this.register(id, fn),
        };
    }
}
