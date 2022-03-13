import {Node} from '/hacknet/node.js';
import {Log} from '/resources/helper.js';

export class Farm {
    MAX_NODE_COUNT;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.MAX_NODE_COUNT = this.#ns.hacknet.maxNumNodes();
    }
    
    getNodeCount() {
        return this.#ns.hacknet.numNodes();
    }
    
    getNewNodeCost() {
        return this.#ns.hacknet.getPurchaseNodeCost();
    }
    
    getNodeList() {
        let nodeList = [];
        for (let i = 0; i < this.getNodeCount(); i++) {
            const node = new Node(this.#ns, i);
            nodeList.push(node);
        }
        return nodeList;
    }
    
    getProductionRate() {
        return this.getNodeList().reduce((prev, curr) => prev + curr.getProductionRate(), 0);
    }
    
    buyNewNode() {
        if (this.getNodeCount() < this.MAX_NODE_COUNT) {
            const nodeId = this.#ns.hacknet.purchaseNode();
            Log.success(this.#ns, `HACKNET_FARM - New node ${nodeId} bought.`);
        } else {
            Log.info(this.#ns, `HACKNET_FARM - Max number of nodes (${this.MAX_NODE_COUNT}) already bought.`);
        }
    }
}