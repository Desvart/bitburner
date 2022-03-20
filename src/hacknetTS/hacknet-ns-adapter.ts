import {HacknetNsPort} from '/hacknetTS/hacknet-ns-port';

export class HacknetNsAdapter implements HacknetNsPort {
    #ns;
    constructor(ns: object) {
        this.#ns = ns;
    }
    
    getNodeLevel(nodeId: number): number {
        return this.#ns.hacknet.getNodeStats(nodeId).level;
    }
    
    getNodeRam(nodeId: number) {
        return this.#ns.hacknet.getNodeStats(nodeId).ram;
    }
    
    getNodeCore(nodeId: number) {
        return this.#ns.hacknet.getNodeStats(nodeId).cores;
    }
    
    getNodeLevelUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.#ns.hacknet.getLevelUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeRamUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.#ns.hacknet.getRamUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeCoreUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.#ns.hacknet.getCoreUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeProductionRate(nodeId: number) {
        return this.#ns.hacknet.getNodeStats(nodeId).production;
    }
    
    purchaseNodeLevelUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.#ns.hacknet.upgradeLevel(nodeId, purchaseQty);
    }
    
    purchaseNodeRamUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.#ns.hacknet.upgradeRam(nodeId, purchaseQty);
    }
    
    purchaseNodeCoreUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.#ns.hacknet.upgradeCore(nodeId, purchaseQty);
    }

}