import {INs, Log} from '/pkg.helpers';
import {Player} from '/services/player';
import {getService, ServiceName} from '/services/service';

const FLAGS: [string, number][] = [
    ['harnestRatio', 1/4],
    ['cycleTime', 200],
];

export async function main(ns: INs) {
    const flags = ns.flags(FLAGS);
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const hDaemon: HacknetDaemon = new HacknetDaemon(ns);
    
    // noinspection InfiniteLoopJS
    while (true) {
        const bestUpgrade: Upgrade = hDaemon.identifyBestUpgrade();
        await hDaemon.waitToHaveEnoughFunds(bestUpgrade, flags.harnestRatio);
        hDaemon.upgrade(bestUpgrade);
        await ns.sleep(flags.cycleTime);
    }
}

class HacknetDaemon {
    constructor(
        private readonly ns: INs,
        private readonly log: Log = new Log(ns),
        public readonly hacknet: Hacknet = new Hacknet(ns),
        public readonly player: Player = new Player(ns)) {
    }
    
    identifyBestUpgrade(): Upgrade {
        let upgrades: Array<Upgrade> = [];
        upgrades.push(new Upgrade(this.hacknet.newServerGain, this.hacknet.costNewServer, 'server'));
        
        this.hacknet.forEach(server => {
            upgrades.push(new Upgrade(server.level.upgradeGain, server.level.upgradeCost, 'level', server.id));
            upgrades.push(new Upgrade(server.ram.upgradeGain, server.ram.upgradeCost, 'ram', server.id));
            upgrades.push(new Upgrade(server.cores.upgradeGain, server.cores.upgradeCost, 'cores', server.id));
        });
        
        const bestUpgrade: Upgrade = upgrades.sort((a, b) => b.ratio - a.ratio)[0];
        const msgRatio: string = `${this.log.formatMoney(bestUpgrade.gain)}/s / ${this.log.formatMoney(bestUpgrade.cost)} => ratio = ${this.log.formatNumber(bestUpgrade.ratio)}`;
        const msg: string = `HACKNET_DAEMON - Best upgrade: node${bestUpgrade.serverId}.${bestUpgrade.type} - ${msgRatio}`;
        this.log.info(msg);
        
        return bestUpgrade;
    }
    
    async waitToHaveEnoughFunds(bestUpgrade: Upgrade, harnestRatio: number): Promise<void> {
        let availableMoney: number = 0;
        while (bestUpgrade.cost >= availableMoney) {
            const hacknetProfit: number = this.hacknet.totalProduction - this.hacknet.cost;
            const reinvestAmount: number = hacknetProfit * (Math.sign(hacknetProfit) > 0 ? harnestRatio : 1 / harnestRatio);
            availableMoney = (this.player.money - reinvestAmount) >= 0 ? reinvestAmount : 0;
            if (bestUpgrade.cost >= availableMoney) {
                const missingMoney: number = bestUpgrade.cost - availableMoney;
                const timeToWait: number = missingMoney / (this.hacknet.productionRate * harnestRatio) * 1000;
                const timeToWaitStr = this.ns.tFormat(timeToWait);
                this.log.info(
                    `HACKNET_DAEMON - Waiting time to next upgrade2 (node${bestUpgrade.serverId}.${bestUpgrade.type}): ${timeToWaitStr}`);
                await this.ns.sleep(timeToWait);
            }
        }
    }
    
    upgrade(bestUpgrade: Upgrade) {
        switch (bestUpgrade.type) {
            case 'server':
                this.hacknet.buyNewServer();
                break;
            case 'level':
                this.hacknet[bestUpgrade.serverId].level.upgrade();
                break;
            case 'ram':
                this.hacknet[bestUpgrade.serverId].ram.upgrade();
                break;
            case 'cores':
                this.hacknet[bestUpgrade.serverId].cores.upgrade();
                break;
        }
        if (bestUpgrade.type === 'node')
            this.log.info(`HACKNET_DAEMON - New server ${bestUpgrade.serverId} bought`);
        else
            this.log.info(`HACKNET_DAEMON - ${bestUpgrade.type} upgraded on server ${bestUpgrade.serverId}.\n`);
    }
}

class Upgrade {
    public ratio: number;
    
    constructor(public gain: number, public cost: number, public readonly type: string, public serverId: number = 0) {
        this.ratio = gain / cost;
    }
}

interface IHacknet2 extends Array<HServer> {
    productionRate: number;
    maxServerCount: number;
    serverCount: number;
    costNewServer: number;
    
    buyNewServer();
}

export class Hacknet extends Array<HServer> implements IHacknet2 {
    maxServerCount: number;
    
    constructor(private readonly ns: INs) {
        super();
        this.maxServerCount = ns.hacknet.maxNumNodes();
        this.retrieveExistingHacknet();
    }
    
    get productionRate(): number {
        return this.reduce((acc, obj) => acc + obj.productionRate, 0);
    }
    
    get totalProduction(): number {
        return this.reduce((acc, obj) => acc + obj.totalProduction, 0);
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
    
    get cost() {
        return this.reduce((acc, obj) => acc + obj.cost, 0);
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
    totalProduction: number;
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
        const player: Player = getService(this.ns, ServiceName.Player);
        return (level * 1.5) * Math.pow(1.035, ram - 1) * ((cores + 5) / 6) * player.hacknet.multipliers.production;
    }
    
    get productionRate() {
        return this.simulateProductionRate(this.level.actual, this.ram.actual, this.cores.actual);
    }
    
    get totalProduction(): number {
        return this.ns.hacknet.getNodeStats(this.id).totalProduction;
    }
    
    get cost(): number {
        
        let nodeCost = 0;
        let levelCost = 0;
        let ramCost = 0;
        let coresCost = 0;
        const player: Player = getService<Player>(this.ns, ServiceName.Player);
        
        if (player.software.formulas) {
            const costMult: number = player.hacknet.multipliers.purchaseCost;
            const hFormulas = this.ns.formulas.hacknetNodes;
            nodeCost = hFormulas.hacknetNodeCost(this.id, costMult);
            levelCost = hFormulas.levelUpgradeCost(1, this.level.actual - 1, costMult);
            ramCost = hFormulas.ramUpgradeCost(1, this.ram.actual - 1, costMult);
            coresCost = hFormulas.coreUpgradeCost(1, this.cores.actual - 1, costMult);
        }
        
        return nodeCost + levelCost + ramCost + coresCost;
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
        const upgradedGain = server.simulateProductionRate(server.level.actual + 1, server.ram.actual,
            server.cores.actual);
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
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual * 2,
            server.cores.actual);
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
        const upgradedGain = server.simulateProductionRate(server.level.actual, server.ram.actual,
            server.cores.actual + 1);
        return upgradedGain - server.productionRate;
    }
    
    upgrade(): void {
        this.ns.hacknet.upgradeCore(this.serverId, 1);
    }
}