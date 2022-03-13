import Component from '/hacknet/component.js';
import {Log} from '/resources/helper.js';

export class Node {
    id;
    #MAX_LEVEL = 200;
    #MAX_RAM = 64;
    #MAX_CORES = 16;
    #ns;
    
    constructor(ns, nodeId) {
        this.#ns = ns;
        this.id = nodeId;
    }
    
    getComponentLevel(component) {
        switch (component) {
            case Component.LEVEL : {
                return this.getLevel();
            }
            case Component.RAM : {
                return this.getRam();
            }
            case Component.CORE : {
                return this.getCores();
            }
            default:
                Log.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    getLevel() {
        return this.#ns.hacknet.getNodeStats(this.id).level;
    }
    
    getRam() {
        return this.#ns.hacknet.getNodeStats(this.id).ram;
    }
    
    getCores() {
        return this.#ns.hacknet.getNodeStats(this.id).cores;
    }
    
    getLevelUpgradeCost() {
        return this.#ns.hacknet.getLevelUpgradeCost(this.id, 1);
    }
    
    getRamUpgradeCost() {
        return this.#ns.hacknet.getRamUpgradeCost(this.id, 1);
    }
    
    getCoreUpgradeCost() {
        return this.#ns.hacknet.getCoreUpgradeCost(this.id, 1);
    }
    
    getUpgradeCost(component) {
        switch (component) {
            case Component.LEVEL : {
                this.getLevelUpgradeCost();
                break;
            }
            case Component.RAM : {
                this.getRamUpgradeCost();
                break;
            }
            case Component.CORE : {
                this.getCoreUpgradeCost();
                break;
            }
            default:
                Log.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    getProductionRate() {
        return this.#ns.hacknet.getNodeStats(this.id).production;
    }
    
    upgrade(component, qty = 1) {
        switch (component) {
            case Component.LEVEL : {
                this.#upgradeLevel(qty);
                break;
            }
            case Component.RAM : {
                this.#upgradeRam(qty);
                break;
            }
            case Component.CORE : {
                this.#upgradeCore(qty);
                break;
            }
            default:
                Log.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    #upgradeLevel(qty) {
        if (this.#ns.hacknet.upgradeLevel(this.id, qty)) {
            Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - Level upgraded to ${this.getLevel()}.`);
        }
    }
    
    #upgradeRam(qty) {
        if (this.#ns.hacknet.upgradeRam(this.id, qty)) {
            Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - RAM upgraded to ${this.getRam()}.`);
        }
    }
    
    #upgradeCore(qty) {
        if (this.#ns.hacknet.upgradeCore(this.id, qty)) {
            Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - Cores upgraded to ${this.getCores()}.`);
        }
    }
}