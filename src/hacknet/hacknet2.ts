import {INs} from '/resources/helpers';

interface IHacknet2 extends Array<HServer> {
    productionRate: number;
    maxServerCount: number;
    serverCount: number;
    costNewServer: number;
    
    buyNewServer();
}

export class Hacknet2 extends Array<HServer> implements IHacknet2 {
    maxServerCount: number;
    
    constructor(private readonly ns: INs) {
        super();
        this.maxServerCount = ns.hacknet.maxNumNodes();
        this.retrieveExistingHacknet();
    }
    
    get productionRate(): number {
        return this.reduce((acc, obj) => acc + obj.productionRate, 0);
    }
    
    get serverCount(): number {
        return this.ns.hacknet.numNodes();
    }
    
    get costNewServer(): number {
        return this.ns.hacknet.getPurchaseNodeCost();
    }
    
    get newServerGain(): number {
        return new HServer(this.ns, 0).simulateProductionRate(1, 0, 0);
    }
    
    retrieveExistingHacknet() {
        for (let id = 0; id < this.serverCount; id++) {
            this.push(new HServer(this.ns, id));
        }
    }
    
    buyNewServer(): void {
        const newId = this.ns.hacknet.purchaseNode();
        this.push(new HServer(this.ns, newId));
    }
}

interface IHServer {
    id: number;
    productionRate: number;
    level: Level;
    ram: Ram;
    cores: Cores;
    
    simulateProductionRate(level: number, ram: number, cores: number): number;
}

class HServer implements IHServer {
    level: Level;
    ram: Ram;
    cores: Cores;
    
    constructor(private readonly ns: INs, readonly id: number) {
        this.level = new Level(ns, id);
        this.ram = new Ram(ns, id);
        this.cores = new Cores(ns, id);
    }
    
    simulateProductionRate(level: number, ram: number, cores: number): number {
        return (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * this.ns.getPlayer().hacking_money_mult;
    }
    
    get productionRate() {
        return this.simulateProductionRate(this.level.actual, this.ram.actual, this.cores.actual);
    }
}

interface IComponent {
    max: number;
    actual: number;
    upgradeCost: number;
    upgradeGain: number;
    
    upgrade(): void;
}

class Level implements IComponent {
    max: number;
    
    constructor(private readonly ns: INs, private readonly serverId: number) {
        this.max = 200;
    }
    
    get actual(): number {
        return this.ns.hacknet.getNodeStats(this.serverId).level;
    }
    
    get upgradeCost() {
        return this.ns.hacknet.getLevelUpgradeCost(this.serverId, 1);
    }
    
    get upgradeGain(): number {
        const server: HServer = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual + 1, server.ram.actual, server.cores.actual);
        return upgradedGain - server.productionRate;
    }
    
    upgrade(): void {
        this.ns.hacknet.upgradeLevel(this.serverId, 1);
    }
}

class Ram implements IComponent {
    max: number;
    
    constructor(private readonly ns: INs, private readonly serverId: number) {
        this.max = 64;
    }
    
    get actual(): number {
        return this.ns.hacknet.getNodeStats(this.serverId).ram;
    }
    
    get upgradeCost() {
        return this.ns.hacknet.getRamUpgradeCost(this.serverId, 1);
    }
    
    get upgradeGain(): number {
        const server: HServer = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual * 2, server.cores.actual);
        return upgradedGain - server.productionRate;
    }
    
    upgrade(): void {
        this.ns.hacknet.upgradeRam(this.serverId, 1);
    }
}

class Cores implements IComponent {
    max: number;
    
    constructor(private readonly ns: INs, private readonly serverId: number) {
        this.max = 16;
    }
    
    get actual(): number {
        return this.ns.hacknet.getNodeStats(this.serverId).cores;
    }
    
    get upgradeCost() {
        return this.ns.hacknet.getCoreUpgradeCost(this.serverId, 1);
    }
    
    get upgradeGain(): number {
        const server: HServer = new HServer(this.ns, this.serverId);
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual, server.cores.actual + 1);
        return upgradedGain - server.productionRate;
    }
    
    upgrade(): void {
        this.ns.hacknet.upgradeCore(this.serverId, 1);
    }
}