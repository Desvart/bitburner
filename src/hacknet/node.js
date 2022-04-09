import { Component } from '/hacknet/component.js';
export class Node {
    constructor(nsA, logA, nodeId) {
        this.nsA = nsA;
        this.logA = logA;
        this.id = nodeId;
    }
    getComponentLevel(component) {
        switch (component) {
            case Component.Level: {
                return this.getLevel();
            }
            case Component.Ram: {
                return this.getRam();
            }
            case Component.Core: {
                return this.getCores();
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    getLevel() {
        return this.nsA.getNodeLevel(this.id);
    }
    getRam() {
        return this.nsA.getNodeRam(this.id);
    }
    getCores() {
        return this.nsA.getNodeCore(this.id);
    }
    getLevelUpgradeCost() {
        return this.nsA.getNodeLevelUpgradeCost(this.id, 1);
    }
    getRamUpgradeCost() {
        return this.nsA.getNodeRamUpgradeCost(this.id, 1);
    }
    getCoreUpgradeCost() {
        return this.nsA.getNodeCoreUpgradeCost(this.id, 1);
    }
    getUpgradeCost(component) {
        switch (component) {
            case Component.Level: {
                return this.getLevelUpgradeCost();
            }
            case Component.Ram: {
                return this.getRamUpgradeCost();
            }
            case Component.Core: {
                return this.getCoreUpgradeCost();
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    getProductionRate() {
        return this.nsA.getNodeProductionRate(this.id);
    }
    upgrade(component, qty = 1) {
        switch (component) {
            case Component.Level: {
                this.upgradeLevel(qty);
                break;
            }
            case Component.Ram: {
                this.upgradeRam(qty);
                break;
            }
            case Component.Core: {
                this.upgradeCore(qty);
                break;
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    upgradeLevel(qty) {
        if (this.nsA.purchaseNodeLevelUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - Level upgraded to ${this.getLevel()}.`);
        }
    }
    upgradeRam(qty) {
        if (this.nsA.purchaseNodeRamUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - RAM upgraded to ${this.getRam()}.`);
        }
    }
    upgradeCore(qty) {
        if (this.nsA.purchaseNodeCoreUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - Cores upgraded to ${this.getCores()}.`);
        }
    }
}
//# sourceMappingURL=node.js.map