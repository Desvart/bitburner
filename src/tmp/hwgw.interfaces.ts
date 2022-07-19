import {INs} from '/pkg.helpers';
import {Server} from '/services/network';

interface IBatchRequirements {
    target: string;
    steal: number;
    shouldLoop: boolean;
    hThreads: Array<number>;
    w1Threads: Array<number>;
    gThreads: Array<number>;
    w2Threads: Array<number>;
}

interface IMalware {
    id: string;
    ram: number;
    execution(targetId: string, runnerId: string, threadQty: number): void;
}

interface IJob {
    malware: IMalware;
    targetId: string;
    runnerId: string;
    threadQty: number;
    stopTime: number;

    toString(): string;
    execute(): void;
}

interface IBatch extends Array<IJob> {
    checkCoherency(): boolean;
    execute(): void;
    print(): void;
}