import {Component} from '/hacknetTS/model/component.js';
import {HacknetNsAdapter} from '/hacknetTS/hacknet-ns-adapter.js';
import {LogNsAdapter} from '/resources/helperTS.js';

export class Node {
    readonly id: number;
    private readonly MAX_LEVEL: number = 200;
    private readonly MAX_RAM: number = 64;
    private readonly MAX_CORES: number = 16;
    private readonly nsA: HacknetNsAdapter;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: HacknetNsAdapter, logA: LogNsAdapter, nodeId: number) {
        this.nsA = nsA;
        this.logA = logA;
        this.id = nodeId;
    }
    
    getComponentLevel(component: Component): number {
        switch (component) {
            case Component.Level : {
                return this.getLevel();
            }
            case Component.Ram : {
                return this.getRam();
            }
            case Component.Core : {
                return this.getCores();
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    private getLevel(): number {
        return this.nsA.getNodeLevel(this.id);
    }
    
    private getRam(): number {
        return this.nsA.getNodeRam(this.id);
    }
    
    private getCores(): number {
        return this.nsA.getNodeCore(this.id);
    }
    
    private getLevelUpgradeCost(): number {
        return this.nsA.getNodeLevelUpgradeCost(this.id, 1);
    }
    
    private getRamUpgradeCost(): number {
        return this.nsA.getNodeRamUpgradeCost(this.id, 1);
    }
    
    private getCoreUpgradeCost(): number {
        return this.nsA.getNodeCoreUpgradeCost(this.id, 1);
    }
    
    getUpgradeCost(component: Component): number {
        switch (component) {
            case Component.Level : {
                return this.getLevelUpgradeCost();
            }
            case Component.Ram : {
                return this.getRamUpgradeCost();
            }
            case Component.Core : {
                return this.getCoreUpgradeCost();
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    getProductionRate(): number {
        return this.nsA.getNodeProductionRate(this.id);
    }
    
    upgrade(component: Component, qty: number = 1): void {
        switch (component) {
            case Component.Level : {
                this.upgradeLevel(qty);
                break;
            }
            case Component.Ram : {
                this.upgradeRam(qty);
                break;
            }
            case Component.Core : {
                this.upgradeCore(qty);
                break;
            }
            default:
                this.logA.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }
    
    private upgradeLevel(qty: number): void {
        if (this.nsA.purchaseNodeLevelUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - Level upgraded to ${this.getLevel()}.`);
        }
    }
    
    private upgradeRam(qty: number): void {
        if (this.nsA.purchaseNodeRamUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - RAM upgraded to ${this.getRam()}.`);
        }
    }
    
    private upgradeCore(qty:number ): void {
        if (this.nsA.purchaseNodeCoreUpgrade(this.id, qty)) {
            this.logA.info(`HACKNET_NODE - Node ${this.id} - Cores upgraded to ${this.getCores()}.`);
        }
    }
}