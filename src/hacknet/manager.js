import config from '/hacknet/config.js';
import globalConfig from '/resources/global-config.js';
import {Farm} from '/hacknet/farm.js';
import Component from '/hacknet/component.js';
import {Log, Format} from '/resources/helper.js';

export class Manager {
    #farm;
    #ns;
    
    constructor(ns) {
        this.#ns = ns;
        this.#farm = new Farm(ns);
    }
    
    kill() {
        this.#ns.kill(config.DAEMON_FILE, config.LOCATION, '--operate');
    }
    
    setupInfra() {
        this.#ns.nuke(config.LOCATION);
    }
    
    async deploy() {
        if (config.LOCATION !== 'home') {
            await this.#ns.scp(globalConfig.CONFIG_FILE, config.LOCATION);
            await this.#ns.scp(config.CONFIG_FILE, config.LOCATION);
            await this.#ns.scp(config.DAEMON_FILE, config.LOCATION);
            await this.#ns.scp(config.MANAGER_FILE, config.LOCATION);
            await this.#ns.scp(config.FARM_FILE, config.LOCATION);
            await this.#ns.scp(config.NODE_FILE, config.LOCATION);
            await this.#ns.scp(config.COMPONENT_FILE, config.LOCATION);
            await this.#ns.scp(globalConfig.HELPER_FILE, config.LOCATION);
        }
    }
    
    activate() {
        if (this.#ns.scriptRunning(config.DAEMON_FILE, config.LOCATION) === false) {
            this.#ns.exec(config.DAEMON_FILE, config.LOCATION, 1, '--operate');
            Log.info(this.#ns, 'JARVIS_DAEMON - Hacknet Daemon activated with success.');
        } else {
            const msg = `JARVIS_DAEMON - Hacknet Daemon couldn't be activated: the process is already alive.`;
            Log.warn(this.#ns, msg);
        }
    }
    
    async operate() {
        let [nodeId, componentName, cost] = this.#identifyCheapestComponentToUpgrade();
        while (true) {
            await this.#waitToHaveEnoughMoney(cost);
            this.#upgradeHacknetFarm(nodeId, componentName);
    
            [nodeId, componentName, cost] = this.#identifyCheapestComponentToUpgrade();
            const etaBeforeNextUpgrade = this.#getEtaBeforeNextUpgrade(nodeId, componentName, cost);
            await this.#waitUntilNextUpgrade(etaBeforeNextUpgrade);
        }
    }
    
    #identifyCheapestComponentToUpgrade() {
        
        let cheapestComponentToUpgrade = [];
        let upgradeCost = Infinity;
        
        if (this.#farm.getNodeCount() !== 0) {
            
            const nodeList = this.#farm.getNodeList();
            const nodeWithCheapestLevelUpg = getNodeWithCheapestLevelUpgrade(nodeList);
            const nodeWithCheapestRamUpg = getNodeWithCheapestRamUpgrade(nodeList);
            const nodeWithCheapestCoreUpg = getNodeWithCheapestCoreUpgrade(nodeList);
            
            if (isLevelUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestLevelUpg.getLevelUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestLevelUpg.id,
                    Component.LEVEL,
                    Math.ceil(upgradeCost)];
                
            } else if (isRamUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestRamUpg.getRamUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestRamUpg.id,
                    Component.RAM,
                    Math.ceil(upgradeCost)];
                
            } else if (isCoreUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestCoreUpg.getCoreUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestCoreUpg.id,
                    Component.CORE,
                    Math.ceil(upgradeCost)];
            }
        }
        
        if (this.#farm.getNewNodeCost() < upgradeCost) {
            cheapestComponentToUpgrade = [
                this.#farm.getNodeCount(),
                Component.NODE,
                Math.ceil(this.#farm.getNewNodeCost())];
        }
        
        const nodeId = cheapestComponentToUpgrade[0];
        const componentName = cheapestComponentToUpgrade[1];
        const costF = Format.money(this.#ns, upgradeCost);
        const msg = `HACKNET_DAEMON - Upgrade target: Node ${nodeId} - ${componentName} - Cost: ${costF}`;
        Log.info(this.#ns, msg);
        
        return cheapestComponentToUpgrade;
        
        function getNodeWithCheapestLevelUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.getLevelUpgradeCost() < curr.getLevelUpgradeCost() ? prev : curr);
        }
        
        function getNodeWithCheapestRamUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.getRamUpgradeCost() < curr.getRamUpgradeCost() ? prev : curr);
        }
        
        function getNodeWithCheapestCoreUpgrade(nodeList) {
            return nodeList.reduce((prev, curr) => prev.getCoreUpgradeCost() < curr.getCoreUpgradeCost() ? prev : curr);
        }
        
        function isLevelUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestLevelUpg.getLevelUpgradeCost() < nodeWithCheapestRamUpg.getRamUpgradeCost() &&
                nodeWithCheapestLevelUpg.getLevelUpgradeCost() < nodeWithCheapestCoreUpg.getCoreUpgradeCost());
        }
        
        function isRamUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestRamUpg.getRamUpgradeCost() < nodeWithCheapestLevelUpg.getLevelUpgradeCost() &&
                nodeWithCheapestRamUpg.getRamUpgradeCost() < nodeWithCheapestCoreUpg.getCoreUpgradeCost());
        }
        
        function isCoreUpgTheCheapest(
            nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg) {
            return (nodeWithCheapestCoreUpg.getCoreUpgradeCost() < nodeWithCheapestLevelUpg.getLevelUpgradeCost() &&
                nodeWithCheapestCoreUpg.getCoreUpgradeCost() < nodeWithCheapestRamUpg.getRamUpgradeCost());
        }
        
    }
    
    async #waitToHaveEnoughMoney(cost) {
        const wealth = this.#ns.getServerMoneyAvailable('home');
        
        while (wealth <= cost) {
            const wealthF = Format.money(this.#ns, wealth);
            const costF = Format.money(this.#ns, cost);
            const msg = `HACKNET_DAEMON - Not enough money! Cost: ${costF}, available: ${wealthF}`;
            Log.warn(this.#ns, msg);
            await this.#ns.sleep(config.CYCLE_TIME);
        }
    }
    
    #upgradeHacknetFarm(nodeId, componentName) {
        if (componentName === Component.NODE) {
            this.#farm.buyNewNode();
        } else {
            this.#farm.getNodeList()[nodeId].upgrade(componentName);
        }
    }
    
    #getEtaBeforeNextUpgrade(nodeId, componentName, cost) {
        const timeToRoI = cost / this.#farm.getProductionRate(); //s
        let etaBeforeNextUpgrade = Math.ceil(timeToRoI / config.HARVEST_RATIO) * 1000; //ms
        
        if (componentName === Component.NODE) {
            const msg = `HACKNET_DAEMON - Next upgrade: New node ${nodeId} in ${etaBeforeNextUpgrade} s.`;
            Log.info(this.#ns, msg);
        } else {
            const upgrade = this.#farm.getNodeList()[nodeId].getComponentLevel(componentName) + 1;
            const msg = `HACKNET_DAEMON - Next upgrade: Node ${nodeId} - ${componentName} -> ${upgrade} in
                ${etaBeforeNextUpgrade / 1000} s.`;
            Log.info(this.#ns, msg);
        }
        
        return etaBeforeNextUpgrade;
    }
    
    async #waitUntilNextUpgrade(etaBeforeNextUpgrade) {
            await this.#ns.sleep(etaBeforeNextUpgrade);
    }
}