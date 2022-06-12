import {INetscriptPort, INs, Log} from '/resources/helpers';

export enum ServiceName {
    Player = 10,
    Network = 12,
    Deployer = 14,
    ThreadPool = 16,
    ShivaOptimizer = 18
}

const CONFIG: {
    MAX_RETRY: number,
    SLEEP_DURATION: number,
} = {
    MAX_RETRY: 10,
    SLEEP_DURATION: 100, // ms
};

export function getService<ResultType>(ns: INs, serviceName: ServiceName): ResultType {
    const portHandle = ns.getPortHandle(serviceName);
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
    
    async start() {
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