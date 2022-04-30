import {INs, Log} from '/resources/helpers';

// FIXME: Check why daemon buys new node even it they are more expensive at startup
// TODO: Add cost in each buy step log
// TODO: Close install window if everything went well

const CONFIG: {
    HARVEST_RATIO: number,
    CYCLE_TIME: number,
} = {
    HARVEST_RATIO: 50 / 100,
    CYCLE_TIME: 2000, //ms
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const log = new Log(ns);
    const hacknet = new Hacknet(ns, log);
    
    let upgrade: Upgrade = hacknet.identifyCheapestUpgrade();
    
    log.info(`HACKNET_DAEMON - Upgrade target: Node ${upgrade.nodeId} - ${Component[upgrade.component]} - Cost: ${log.formatMoney(upgrade.cost)}`);
    
    // noinspection InfiniteLoopJS
    while (true) {
        await waitToHaveEnoughMoney(ns, log, upgrade.cost);
        
        hacknet.upgrade(upgrade);
        upgrade = hacknet.identifyCheapestUpgrade();
        
        if (upgrade.component === Component.Node) {
            const msg = `HACKNET_DAEMON - Next upgrade: New node ${upgrade.nodeId} in ${upgrade.waitTimeBeforeNextUpgrade} s for ${log.formatMoney(upgrade.cost)}.`;
            log.info(msg);
        } else {
            let componentUpgrade: number = 0;
            switch (upgrade.component) {
                case Component.Level:
                    componentUpgrade = ns.hacknet.getNodeStats(upgrade.nodeId).level + 1;
                    break;
                case Component.Ram:
                    componentUpgrade = ns.hacknet.getNodeStats(upgrade.nodeId).ram * 2;
                    break;
                case Component.Core:
                    componentUpgrade = ns.hacknet.getNodeStats(upgrade.nodeId).cores + 1;
                    break;
            }
            const msg = `HACKNET_DAEMON - Next upgrade: Node ${upgrade.nodeId} - ${Component[upgrade.component]} -> ${componentUpgrade} in ${upgrade.waitTimeBeforeNextUpgrade} s for ${log.formatMoney(upgrade.cost)}.`;
            log.info(msg);
        }
        
        await waitForNextUpgrade(ns, upgrade.waitTimeBeforeNextUpgrade * 1000);
    }
}

export enum Component {
    Node,
    Level,
    Ram,
    Core
}

class Hacknet {
    private readonly ns: INs;
    private readonly log: Log;
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
    }
    
    identifyCheapestUpgrade(): Upgrade {
        
        let cheapestUpgrade: Upgrade = new Upgrade(0, 0, Infinity);
        
        const nodeCount = this.ns.hacknet.numNodes();
        if (nodeCount !== 0)
            cheapestUpgrade = this.identifyCheapestComponentUpgrade(this.ns, this.getNodeIdList(nodeCount));
        
        const newNodeCost = this.ns.hacknet.getPurchaseNodeCost();
        if (newNodeCost < cheapestUpgrade.cost)
            cheapestUpgrade = new Upgrade(nodeCount, Component.Node, Math.ceil(newNodeCost), this.getProductionRate());
        
        return cheapestUpgrade;
    }
    
    private identifyCheapestComponentUpgrade(ns: INs, nodeList: number[]): Upgrade {
    
        const levelUpgradeCostList: number[] = nodeList.map(n => ns.hacknet.getLevelUpgradeCost(n, 1));
        const ramUpgradeCostList: number[] = nodeList.map(n => ns.hacknet.getRamUpgradeCost(n, 1));
        const coreUpgradeCostList: number[] = nodeList.map(n => ns.hacknet.getCoreUpgradeCost(n, 1));
        
        const upgradeCostList: number[][] = [levelUpgradeCostList, ramUpgradeCostList, coreUpgradeCostList];
        const [componentId, nodeId, cost] = indexOfSmallest(upgradeCostList);
        return new Upgrade(nodeId, componentId + 1, cost, this.getProductionRate());
    
        function indexOfSmallest(costArray: number[][]): number[] {
            let lowestC = 0;
            let lowestI = 0;
            for (let c = 0; c <= 2; c++)
                for (let i = 0; i < costArray[0].length; i++)
                    if (costArray[c][i] < costArray[lowestC][lowestI]) {
                        lowestC = c;
                        lowestI = i;
                    }
        
            return [lowestC, lowestI, costArray[lowestC][lowestI]];
        }
    }
    
    getNodeIdList(nodeCount: number): number[] {
        return [...Array(nodeCount).keys()];
    }
    
    private buyNewNode(): void {
        const MAX_NUM_NODES: number = this.ns.hacknet.maxNumNodes();
        if (this.ns.hacknet.numNodes() < MAX_NUM_NODES) {
            const nodeId = this.ns.hacknet.purchaseNode();
            this.log.success(`HACKNET_DAEMON - New node ${nodeId} bought.`);
        } else {
            this.log.info(`HACKNET_DAEMON - Max number of nodes (${MAX_NUM_NODES}) already bought.`);
        }
    }
    
    upgrade(upgrade: Upgrade): void {
        if (upgrade.component === Component.Node)
            this.buyNewNode();
        else {
            switch (upgrade.component) {
                case Component.Level : {
                    this.ns.hacknet.upgradeLevel(upgrade.nodeId, 1);
                    this.log.info(`HACKNET_NODE - Node ${upgrade.nodeId} - Level upgraded to ${this.ns.hacknet.getNodeStats(upgrade.nodeId).level}.\n`);
                    break;
                }
                case Component.Ram : {
                    this.ns.hacknet.upgradeRam(upgrade.nodeId, 1);
                    this.log.info(`HACKNET_NODE - Node ${upgrade.nodeId} - RAM upgraded to ${this.ns.hacknet.getNodeStats(upgrade.nodeId).ram}.\n`);
                    break;
                }
                case Component.Core : {
                    this.ns.hacknet.upgradeCore(upgrade.nodeId, 1);
                    this.log.info(`HACKNET_NODE - Node ${upgrade.nodeId} - Cores upgraded to ${this.ns.hacknet.getNodeStats(upgrade.nodeId).cores}.\n`);
                    break;
                }
            }
        }
    }
    
    getProductionRate(): number {
        let productionList = this.getNodeIdList(this.ns.hacknet.numNodes()).map(i => this.ns.hacknet.getNodeStats(i).production);
        return productionList.reduce((prev, curr) => prev + curr, 0);
    }
}

class Upgrade {
    readonly nodeId: number;
    readonly component: Component;
    readonly cost: number;
    readonly waitTimeBeforeNextUpgrade: number;
    
    constructor(nodeId: number, component: Component, cost: number, productionRate: number = 0) {
        this.nodeId = nodeId;
        this.component = component;
        this.cost = cost;
        this.waitTimeBeforeNextUpgrade = this.getWaitTimeBeforeToStartUpgrade(productionRate);
    }
    
    private getWaitTimeBeforeToStartUpgrade(productionRate: number) {
        const timeToRoI = this.cost / productionRate; //s
        let waitTimeBeforeNextUpgrade = Math.ceil(timeToRoI / CONFIG.HARVEST_RATIO); //s
        return waitTimeBeforeNextUpgrade; // s
    }
}

async function waitToHaveEnoughMoney(ns: INs, log: Log, cost: number) {
    const wealth: number = ns.getServerMoneyAvailable('home');
    
    while (wealth <= cost) {
        const wealthF: string = log.formatMoney(wealth);
        const costF: string = log.formatMoney(cost);
        const msg: string = `HACKNET_DAEMON - Not enough money! Cost: ${costF}, available: ${wealthF}`;
        log.warn(msg);
        await ns.sleep(CONFIG.CYCLE_TIME);
    }
}

async function waitForNextUpgrade(ns: INs, waitTimeBeforeNextUpgrade: number) {
    await ns.sleep(waitTimeBeforeNextUpgrade);
}