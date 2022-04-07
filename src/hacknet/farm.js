var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Node } from '/hacknet/node.js';
import { Component } from '/hacknet/component.js';
export class Farm {
    constructor(nsA, logA) {
        this.nsA = nsA;
        this.logA = logA;
        this.MAX_NODE_COUNT = this.nsA.getMaxNumNodes();
    }
    getNodeCount() {
        return this.nsA.getNodeCount();
    }
    getNewNodeCost() {
        return this.nsA.getNewNodeCost();
    }
    getNodeList() {
        let nodeList = [];
        for (let i = 0; i < this.getNodeCount(); i++) {
            const node = new Node(this.nsA, this.logA, i);
            nodeList.push(node);
        }
        return nodeList;
    }
    getProductionRate() {
        return this.getNodeList().reduce((prev, curr) => prev + curr.getProductionRate(), 0);
    }
    buyNewNode() {
        if (this.getNodeCount() < this.MAX_NODE_COUNT) {
            const nodeId = this.nsA.purchaseNewNode();
            this.logA.success(`HACKNET_FARM - New node ${nodeId} bought.`);
        }
        else {
            this.logA.info(`HACKNET_FARM - Max number of nodes (${this.MAX_NODE_COUNT}) already bought.`);
        }
    }
    upgradeHacknetFarm(nodeId, componentName) {
        if (componentName === Component.Node) {
            this.buyNewNode();
        }
        else {
            this.getNodeList()[nodeId].upgrade(componentName);
        }
    }
    operate() {
        return __awaiter(this, void 0, void 0, function* () {
            let [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
            while (true) {
                yield this.waitToHaveEnoughMoney(cost);
                this.upgradeHacknetFarm(nodeId, componentName);
                [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
                const etaBeforeNextUpgrade = this.getEtaBeforeNextUpgrade(nodeId, componentName, cost);
                yield this.waitUntilNextUpgrade(etaBeforeNextUpgrade);
            }
        });
    }
}
//# sourceMappingURL=farm.js.map