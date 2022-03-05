import {NETWORK_CONFIG} from '/config/config.js';

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
    #blackList = NETWORK_CONFIG.blackList;
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
    
    
    loadStaticData(nodeX) {
        switch (typeof nodeX) {
            
            case 'string':
                const nodeName = nodeX;
                this.loadStaticDataFromNetwork(nodeName);
                break;
            
            case 'object':
                const nodeObj = nodeX;
                this.mapStaticDataFromImportedNode(nodeObj);
                break;
        }
    }
    
    
    loadStaticDataFromNetwork(nodeName) {
        const node = this.#ns.getServer(nodeName);
        this.mapStaticDataFromImportedNode(node);
    }
    
    
    mapStaticDataFromImportedNode(node) {
        this.hostname = node.hostname;
        this.requiredHackingSkill = node.requiredHackingSkill;
        this.numOpenPortsRequired = node.numOpenPortsRequired;
        this.securityMin = node.minDifficulty || node.securityMin;
        this.moneyMax = node.moneyMax;
        this.ramMax = node.maxRam || node.ramMax;
        this.purchasedByPlayer = node.purchasedByPlayer;
        this.growthFactor = node.serverGrowth || node.growthFactor;
    }
    
    
    checkIfPotentialTarget() {
        let potentialTarget = true;
        
        for (let blackNode of this.#blackList)
            if (this.hostname === blackNode)
                potentialTarget = false;
        
        if (this.purchasedByPlayer === true)
            potentialTarget = false;
        
        return potentialTarget;
    }
    
}