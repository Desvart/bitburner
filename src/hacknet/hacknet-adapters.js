export class HacknetAdapters {
    constructor(ns) {
        this.ns = ns;
    }
    getNodeLevel(nodeId) {
        return this.ns.hacknet.getNodeStats(nodeId).level;
    }
    getNodeRam(nodeId) {
        return this.ns.hacknet.getNodeStats(nodeId).ram;
    }
    getNodeCore(nodeId) {
        return this.ns.hacknet.getNodeStats(nodeId).cores;
    }
    getNodeLevelUpgradeCost(nodeId, upgradeQty) {
        return this.ns.hacknet.getLevelUpgradeCost(nodeId, upgradeQty);
    }
    getNodeRamUpgradeCost(nodeId, upgradeQty) {
        return this.ns.hacknet.getRamUpgradeCost(nodeId, upgradeQty);
    }
    getNodeCoreUpgradeCost(nodeId, upgradeQty) {
        return this.ns.hacknet.getCoreUpgradeCost(nodeId, upgradeQty);
    }
    getNodeProductionRate(nodeId) {
        return this.ns.hacknet.getNodeStats(nodeId).production;
    }
    purchaseNodeLevelUpgrade(nodeId, purchaseQty) {
        return this.ns.hacknet.upgradeLevel(nodeId, purchaseQty);
    }
    purchaseNodeRamUpgrade(nodeId, purchaseQty) {
        return this.ns.hacknet.upgradeRam(nodeId, purchaseQty);
    }
    purchaseNodeCoreUpgrade(nodeId, purchaseQty) {
        return this.ns.hacknet.upgradeCore(nodeId, purchaseQty);
    }
    purchaseNewNode() {
        return this.ns.hacknet.purchaseNode();
    }
    getMaxNumNodes() {
        return this.ns.hacknet.maxNumNodes();
    }
    getNodeCount() {
        return this.ns.hacknet.numNodes();
    }
    getNewNodeCost() {
        return this.ns.hacknet.getPurchaseNodeCost();
    }
    kill(scriptName, hostname, param) {
        this.ns.kill(scriptName, hostname, param);
    }
    nuke(hostname) {
        this.ns.nuke(hostname);
    }
    scp(file, hostname) {
        this.ns.scp(file, hostname);
    }
    scriptRunning(file, hostname) {
        return this.ns.scriptRunning(file, hostname);
    }
    exec(file, hostname) {
        this.ns.exec(file, hostname);
    }
}
//# sourceMappingURL=hacknet-adapters.js.map