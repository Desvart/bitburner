import {INetscriptPort, INs, Log} from '/resources/helpers';
import {Network} from '/resources/network';
import {Deployer} from '/resources/deployer';

export enum ServiceName {
    Network = 10,
    Deployer = 11,
    ThreadPool = 12,
    ShivaOptimizer = 13,
}

const CONFIG: {
    MAX_RETRY: number,
    SLEEP_DURATION: number,
} = {
    MAX_RETRY: 10,
    SLEEP_DURATION: 100, // ms
};

export async function getService<ResultType>(ns: INs, serviceName: ServiceName): Promise<ResultType> {
    const portHandle = ns.getPortHandle(serviceName);
    let tries = CONFIG.MAX_RETRY;
    while (portHandle.empty() && tries-- > 0) {
        await ns.asleep(CONFIG.SLEEP_DURATION);
    }
    return portHandle.empty() ? null : portHandle.peek();
}

export class Service {
    
    private portHandle: INetscriptPort;
    private object: any;
    private objectName: string;
    private operational: boolean;
    
    constructor(private ns: INs, private log: Log, private portId: number = 1, obj: any) {
        this.portHandle = this.ns.getPortHandle(portId);
        this.publishObject(obj);
    }
    
    publishObject(obj: any): void {
        
        this.object = obj;
        this.objectName = obj.constructor.name;
        
        this.portHandle.clear();
        this.portHandle.write(this.object);
        
        this.ns.atExit(this.tearDown.bind(this));
        
        this.log.info(`Service ${this.objectName} started on port ${this.portId}`);
    }
    
    async run() {
        this.operational = true;
        while (this.operational) {
            await this.ns.asleep(1000);
        }
        this.tearDown();
    }
    
    tearDown() {
        this.operational = false;
        this.portHandle.read();
        this.log.info(`Service ${this.objectName} stopped on port ${this.portId}`);
        this.ns.closeTail();
    }
}