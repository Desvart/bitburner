import {Node} from '/hacknet/node.js';
import {Component} from '/hacknet/component.js';
import {HacknetAdapters} from '/hacknet/hacknet-adapters.js';
import {LogNsAdapter} from '/resources/helpers.js';

export class Farm {
    private readonly MAX_NODE_COUNT: number;
    private readonly nsA: HacknetAdapters;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: HacknetAdapters, logA: LogNsAdapter) {
        this.nsA = nsA;
        this.logA = logA;
        this.MAX_NODE_COUNT = this.nsA.getMaxNumNodes();
    }
    
    getNodeCount(): number {
        return this.nsA.getNodeCount();
    }
    
    getNewNodeCost(): number {
        return this.nsA.getNewNodeCost();
    }
    
    getNodeList(): Node[] {
        let nodeList = [];
        for (let i = 0; i < this.getNodeCount(); i++) {
            const node = new Node(this.nsA, this.logA, i);
            nodeList.push(node);
        }
        return nodeList;
    }
    
    getProductionRate(): number {
        return this.getNodeList().reduce((prev, curr) => prev + curr.getProductionRate(), 0);
    }
    
    private buyNewNode(): void {
        if (this.getNodeCount() < this.MAX_NODE_COUNT) {
            const nodeId = this.nsA.purchaseNewNode();
            this.logA.success(`HACKNET_FARM - New node ${nodeId} bought.`);
        } else {
            this.logA.info(`HACKNET_FARM - Max number of nodes (${this.MAX_NODE_COUNT}) already bought.`);
        }
    }
    
    upgradeHacknetFarm(nodeId: number, componentName: Component): void {
        if (componentName === Component.Node) {
            this.buyNewNode();
        } else {
            this.getNodeList()[nodeId].upgrade(componentName);
        }
    }
    
    async operate(): Promise<void> {
        let [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
        // noinspection InfiniteLoopJS
        while (true) {
            await this.waitToHaveEnoughMoney(cost);
            this.upgradeHacknetFarm(nodeId, componentName);
            
            [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
            const etaBeforeNextUpgrade = this.getEtaBeforeNextUpgrade(nodeId, componentName, cost);
            await this.waitUntilNextUpgrade(etaBeforeNextUpgrade);
        }
    }
    
}