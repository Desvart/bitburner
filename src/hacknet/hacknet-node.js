import {Log} from '/helper.js';

export class HacknetNode {
    #ns;
    static Component = Object.freeze({NODE: 'node', LEVEL: 'level', RAM: 'ram', CORE: 'cores'});
    #MAX_LEVEL  = 200;
    #MAX_RAM    = 64;
    #MAX_CORES  = 16;
    id;
    //investment = null; //not used yet
    get level()            { return this.#ns.hacknet.getNodeStats(this.id).level;      }
    get ram()              { return this.#ns.hacknet.getNodeStats(this.id).ram;        }
    get cores()            { return this.#ns.hacknet.getNodeStats(this.id).cores;      }
    get levelUpgradeCost() { return this.#ns.hacknet.getLevelUpgradeCost(this.id, 1);  }
    get ramUpgradeCost()   { return this.#ns.hacknet.getRamUpgradeCost(this.id, 1);    }
    get coreUpgradeCost()  { return this.#ns.hacknet.getCoreUpgradeCost(this.id, 1);   }
    get production()       { return this.#ns.hacknet.getNodeStats(this.id).production; }
    get totalProduction()  { return Math.floor(this.#ns.hacknet.getNodeStats(this.id).totalProduction); }
    
    constructor (ns, nodeId) {
        //console.debug(`Hook - ${ns.getScriptName()} - Hacknet Node`);
        this.#ns        = ns; 
        this.id         = nodeId;        
    }


    getUpgradeCost(component) {
        switch (component) {
            case HacknetNode.Component.LEVEL : {
                this.levelUpgradeCost;
                break;
            }
            case HacknetNode.Component.RAM : {
                this.ramUpgradeCost;
                break;
            }
            case HacknetNode.Component.CORE : {
                this.coreUpgradeCost;
                break;
            }
            default: Log.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }


    upgrade(component, qty = 1) {
        
        switch (component) {
            case HacknetNode.Component.LEVEL : {
                this.#upgradeLevel(qty);
                break;
            }
            case HacknetNode.Component.RAM : {
                this.#upgradeRam(qty);
                break;
            }
            case HacknetNode.Component.CORE : {
                this.#upgradeCore(qty);
                break;
            }
            default: Log.error(`HACKNET_NODE - Component '${component}' doesn't exist in Hacknet nodes.`);
        }
    }


    #upgradeLevel(qty = 1) {
        if(this.#ns.hacknet.upgradeLevel(this.id, qty)) {
			Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - Level upgraded to ${this.level}.`);
        }
    }

    #upgradeRam(qty = 1) {
        if(this.#ns.hacknet.upgradeRam(this.id, qty)) {
            Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - RAM upgraded to ${this.ram}.`);
        }
    }

    #upgradeCore(qty = 1) {
        if(this.#ns.hacknet.upgradeCore(this.id, qty)) {
            Log.info(this.#ns, `HACKNET_NODE - Node ${this.id} - Cores upgraded to ${this.cores}.`);
        }
    }
}