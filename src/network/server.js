import {NETWORK_CONFIG as config} from '/config/config.js';

export class Server {
    
    hostname;
    requiredHackingSkill;
    numOpenPortsRequired;
    securityMin;
    moneyMax;
    ramMax;
    purchasedByPlayer;
    growthFactor;
    isPotentialTarget;
    #ns;
    
    get hasAdminRights() { return this.#ns.hasRootAccess(this.hostname); }
    
    get availableMoney() { return this.#ns.getServerMoneyAvailable(this.hostname); }
    
    get actualSecurity() { return this.#ns.getServerSecurityLevel(this.hostname); }
    
    get hackChance() { return this.#ns.hackAnalyzeChance(this.hostname); }
    
    constructor(ns, nodeX) {
        this.#ns = ns;
        this.loadStaticData(nodeX);
        this.isPotentialTarget = this.checkIfPotentialTarget();
    }
    
    loadStaticData(nodeName) {
        const node = this.#ns.getServer(nodeName);
    
        this.hostname = node.hostname;
        this.requiredHackingSkill = node.requiredHackingSkill;
        this.numOpenPortsRequired = node.numOpenPortsRequired;
        this.securityMin = node.minDifficulty;
        this.moneyMax = node.moneyMax;
        this.ramMax = node.maxRam;
        this.purchasedByPlayer = node.purchasedByPlayer;
        this.growthFactor = node.serverGrowth;
    }
    
    checkIfPotentialTarget() {
        let potentialTarget = true;
        
        for (let blackNode of config.BLACK_LIST)
            if (this.hostname === blackNode)
                potentialTarget = false;
        
        if (this.purchasedByPlayer === true)
            potentialTarget = false;
        
        return potentialTarget;
    }
    
}