import {Log} from '/helpers/helper.js';
import {HacknetNode} from '/hacknet/hacknet-node.js';

export class HacknetFarm {
    MAX_NODE_COUNT;
    #ns;
    
    get nodeCount() { return this.#ns.hacknet.numNodes(); }
    
    get newNodeCost() { return this.#ns.hacknet.getPurchaseNodeCost(); }
    
    get nodeList() { return this.#getNodeList(); }
    
    get productionRate() { return this.#getProductionRate(); }
    
    get totalProduction() { return this.#getTotalProduction(); }
    
    constructor(ns) {
        this.#ns = ns;
        this.MAX_NODE_COUNT = this.#ns.hacknet.maxNumNodes();
    }
    
    #getNodeList() {
        let nodeList = [];
        for (let i = 0; i < this.nodeCount; i++) {
            const node = new HacknetNode(this.#ns, i);
            nodeList.push(node);
        }
        return nodeList;
    }
    
    #getProductionRate() {
        return this.nodeList.reduce((prev, curr) => prev + curr.productionRate, 0);
    }
    
    #getTotalProduction() {
        return this.nodeList.reduce((prev, curr) => prev.totalProduction + curr.totalProduction);
    }
    
    buyNewNode() {
        if (this.nodeCount < this.MAX_NODE_COUNT) {
            const nodeId = this.#ns.hacknet.purchaseNode();
            Log.success(this.#ns, `HACKNET_FARM - New node ${nodeId} bought.`);
        } else {
            Log.info(this.#ns, `HACKNET_FARM - Max number of nodes (${this.MAX_NODE_COUNT}) already bought.`);
        }
    }
}