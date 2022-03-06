import {HACKNET_CONFIG, JARVIS_CONFIG, GLOBAL_CONFIG} from '/config/config.js';
import {HacknetFarm} from '/hacknet/hacknet-farm.js';
import {HacknetNode} from '/hacknet/hacknet-node.js';
import {Log, initDaemon, formatMoney} from '/helpers/helper.js';

export async function main(ns) {
    initDaemon(ns, HACKNET_CONFIG.DISPLAY_TAIL);
    const hacknetDaemon = new HacknetDaemon(ns);
    await hacknetDaemon.operate();
}

export class HacknetDaemon {
    #farm;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.#farm = new HacknetFarm(ns);
    }
    
    reset() {
        this.#ns.clearPort(HACKNET_CONFIG.QUEUE_ID);
        this.#ns.kill(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION);
    }
    
    async deploy() {
        if (HACKNET_CONFIG.LOCATION !== 'home') {
            await this.#ns.scp(GLOBAL_CONFIG.CONFIG_FILE, HACKNET_CONFIG.LOCATION);
            await this.#ns.scp(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION);
            await this.#ns.scp(HACKNET_CONFIG.FARM_FILE, HACKNET_CONFIG.LOCATION);
            await this.#ns.scp(HACKNET_CONFIG.NODE_FILE, HACKNET_CONFIG.LOCATION);
            await this.#ns.scp(GLOBAL_CONFIG.HELPER_FILE, HACKNET_CONFIG.LOCATION);
        }
    }
    
    activate() {
        if (this.#ns.scriptRunning(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION) === false) {
            this.#ns.nuke(HACKNET_CONFIG.LOCATION);
            this.#ns.exec(HACKNET_CONFIG.DAEMON_FILE, HACKNET_CONFIG.LOCATION, 1);
            Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon reactivated with success.');
        } else {
            const msg = 'JARVIS_DAEMON - Hacknet Daemon couldn\'t be reactivated: the process is still alive.';
            Log.error(this.#ns, msg);
        }
    }
    
    async operate() {
        const [nodeId, componentName, cost] = this.#identifyCheapestComponentToUpgrade();
        await this.#waitToHaveEnoughMoney(cost);
        this.#upgradeHacknetFarm(nodeId, componentName);
        
        const etaBeforeNextUpgrade = this.#getEtaBeforeNextUpgrade();
        await this.#waitUntilNextUpgradeOrSendWakeUpCallToJarvis(etaBeforeNextUpgrade);
    }
    
    #identifyCheapestComponentToUpgrade() {
        
        let cheapestComponentToUpgrade = [];
        let upgradeCost = Infinity;
        
        if (this.#farm.nodeCount !== 0) {
            
            const nodeWithCheapestLevelUpg = getNodeWithCheapestLevelUpgrade(this.#farm.nodeList);
            const nodeWithCheapestRamUpg = getNodeWithCheapestRamUpgrade(this.#farm.nodeList);
            const nodeWithCheapestCoreUpg = getNodeWithCheapestCoreUpgrade(this.#farm.nodeList);
            
            if (isLevelUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestLevelUpg.levelUpgradeCost;
                cheapestComponentToUpgrade = [
                    nodeWithCheapestLevelUpg.id,
                    HacknetNode.Component.LEVEL,
                    Math.ceil(upgradeCost)];
                
            } else if (isRamUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestRamUpg.ramUpgradeCost;
                cheapestComponentToUpgrade = [
                    nodeWithCheapestRamUpg.id,
                    HacknetNode.Component.RAM,
                    Math.ceil(upgradeCost)];
                
            } else if (isCoreUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestCoreUpg.coreUpgradeCost;
                cheapestComponentToUpgrade = [
                    nodeWithCheapestCoreUpg.id,
                    HacknetNode.Component.CORE,
                    Math.ceil(upgradeCost)];
            }
        }
        
        if (this.#farm.newNodeCost < upgradeCost) {
            cheapestComponentToUpgrade = [
                this.#farm.nodeCount,
                HacknetNode.Component.NODE,
                Math.ceil(this.#farm.newNodeCost)];
        }
        
        const nodeId = cheapestComponentToUpgrade[0];
        const componentName = cheapestComponentToUpgrade[1];
        const costFormated = formatMoney(this.#ns, upgradeCost);
        const msg = `HACKNET_DAEMON - Upgrade target: Node ${nodeId} - ${componentName} - Cost: ${costFormated}`;
        Log.info(this.#ns, msg);
        
        return cheapestComponentToUpgrade;
        
        function getNodeWithCheapestLevelUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.levelUpgradeCost < curr.levelUpgradeCost ? prev : curr);
        }
        
        function getNodeWithCheapestRamUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.ramUpgradeCost < curr.ramUpgradeCost ? prev : curr);
        }
        
        function getNodeWithCheapestCoreUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.coreUpgradeCost < curr.coreUpgradeCost ? prev : curr);
        }
        
        function isLevelUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestLevelUpg.levelUpgradeCost < nodeWithCheapestRamUpg.ramUpgradeCost &&
                nodeWithCheapestLevelUpg.levelUpgradeCost < nodeWithCheapestCoreUpg.coreUpgradeCost);
        }
        
        function isRamUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestRamUpg.ramUpgradeCost < nodeWithCheapestLevelUpg.levelUpgradeCost &&
                nodeWithCheapestRamUpg.ramUpgradeCost < nodeWithCheapestCoreUpg.coreUpgradeCost);
        }
        
        function isCoreUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestCoreUpg.coreUpgradeCost < nodeWithCheapestLevelUpg.levelUpgradeCost &&
                nodeWithCheapestCoreUpg.coreUpgradeCost < nodeWithCheapestRamUpg.ramUpgradeCost);
        }
        
    }
    
    async #waitToHaveEnoughMoney(cost) {
        const wealth = this.#ns.getPlayer().money;
        
        while (wealth <= cost) {
            
            const wealthFormated = formatMoney(this.#ns, wealth);
            const costFormated = formatMoney(this.#ns, cost);
            const msg = `HACKNET_DAEMON - Not enough money! Cost: ${costFormated}, available: ${wealthFormated}`;
            Log.warn(this.#ns, msg);
            
            await this.#ns.sleep(HACKNET_CONFIG.CYCLE_TIME * 10);
        }
    }
    
    #upgradeHacknetFarm(nodeId, componentName) {
        if (componentName === HacknetNode.Component.NODE) {
            this.#farm.buyNewNode();
        } else {
            this.#farm.nodeList[nodeId].upgrade(componentName);
        }
    }
    
    #getEtaBeforeNextUpgrade() {
        const [nodeIdNext, componentNameNext, costNext] = this.#identifyCheapestComponentToUpgrade();
        const timeToRoI = costNext / this.#farm.productionRate; //s
        let etaBeforeNextUpgrade = Math.ceil(timeToRoI / HACKNET_CONFIG.HARVEST_RATIO) * 1000; //ms
        
        if (componentNameNext === HacknetNode.Component.NODE) {
            Log.info(this.#ns, `HACKNET_DAEMON - Next upgrade: New node $ {nodeIdNext} in ${etaBeforeNextUpgrade} s.`);
            
        } else {
            const upgradeNext = this.#farm.nodeList[nodeIdNext][componentNameNext] + 1;
            const msg = `HACKNET_DAEMON - Next upgrade: Node ${nodeIdNext} - ${componentNameNext} -> ${upgradeNext} in
                ${etaBeforeNextUpgrade / 1000} s.`;
            Log.info(this.#ns, msg);
        }
        
        return etaBeforeNextUpgrade;
    }
    
    async #waitUntilNextUpgradeOrSendWakeUpCallToJarvis(etaBeforeNextUpgrade) {
        // if less than Jarvis cycle time, wait, else send Jarvis a wake-up call
        
        if (etaBeforeNextUpgrade < JARVIS_CONFIG.CYCLE_TIME) {
            await this.#ns.sleep(etaBeforeNextUpgrade);
            await this.operate();
         
        } else {
            await this.#ns.writePort(HACKNET_CONFIG.QUEUE_ID, Date.now() + etaBeforeNextUpgrade);
            const msg = `HACKNET_DAEMON - Quit Hacknet Daemon. Jarvis should relaunch Hacknet Daemon in
                ${etaBeforeNextUpgrade / 1000} s.`;
            Log.info(this.#ns, msg);
        }
    }
}