import {Node} from '/hacknetTS/model/node.js';
import {Component} from '/hacknetTS/model/component.js';
import {NsAdapter} from '/hacknetTS/adapters/ns-adapter.js';
import {LogNsAdapter} from '/resources/helperTS.js';

export class Farm {
    private readonly MAX_NODE_COUNT: number;
    private readonly nsA: NsAdapter;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: NsAdapter, logA: LogNsAdapter) {
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
        while (true) {
            await this.waitToHaveEnoughMoney(cost);
            this.upgradeHacknetFarm(nodeId, componentName);
            
            [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
            const etaBeforeNextUpgrade = this.getEtaBeforeNextUpgrade(nodeId, componentName, cost);
            await this.waitUntilNextUpgrade(etaBeforeNextUpgrade);
        }
    }
    
}