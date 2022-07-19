import {Deployer} from './deployer';
import {Player} from './player';
import {INetscriptPort, INs, Log} from '/pkg.helpers';
import {Network} from '/services/network';

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

export class ServiceProvider {
    
    static getNetwork(ns: INs): Network {
        const portHandle = ns.getPortHandle(ServiceName.Network);
        return portHandle.empty() ? null : portHandle.peek() as Network;
    }
    
    static getPlayers(ns: INs): Player {
        const portHandle = ns.getPortHandle(ServiceName.Player);
        return portHandle.empty() ? null : portHandle.peek() as Player;
    }
    
    static getDeployer(ns: INs): Deployer {
        const portHandle = ns.getPortHandle(ServiceName.Deployer);
        return portHandle.empty() ? null : portHandle.peek() as Deployer;
    }
}

export class Service {
    
    private portHandle: INetscriptPort;
    private object: any;
    private objectName: string;
    private operational: boolean;
    private log: Log;
    
    constructor(private readonly ns: INs, private portId: number = 1, obj: any) {
        this.log = new Log(ns);
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