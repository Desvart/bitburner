import {Node} from '/hacknet/node.js';
import {Component} from '/hacknet/component.js';
import {HacknetAdapters} from '/hacknet/hacknet-adapters.js';
import {LogNsAdapter} from '/resources/helpers.js';
import {HACKNET_CONFIG} from '/hacknet/hacknet-config.js';

export class Farm {
    private readonly MAX_NODE_COUNT: number;
    private readonly nsA: HacknetAdapters;
    private readonly logA: LogNsAdapter;
    
    constructor(nsA: HacknetAdapters, logA: LogNsAdapter) {
        this.nsA = nsA;
        this.logA = logA;
        this.MAX_NODE_COUNT = this.nsA.getMaxNumNodes();
    }
    
    getNodeCount(): number {
        return this.nsA.getNodeCount();
    }
    
    getNewNodeCost(): number {
        return this.nsA.getNewNodeCost();
    }
    
    getNodeList(): Node[] {
        let nodeList = [];
        for (let i = 0; i < this.getNodeCount(); i++) {
            const node = new Node(this.nsA, this.logA, i);
            nodeList.push(node);
        }
        return nodeList;
    }
    
    getProductionRate(): number {
        return this.getNodeList().reduce((prev, curr) => prev + curr.getProductionRate(), 0);
    }
    
    private buyNewNode(): void {
        if (this.getNodeCount() < this.MAX_NODE_COUNT) {
            const nodeId = this.nsA.purchaseNewNode();
            this.logA.success(`HACKNET_FARM - New node ${nodeId} bought.`);
        } else {
            this.logA.info(`HACKNET_FARM - Max number of nodes (${this.MAX_NODE_COUNT}) already bought.`);
        }
    }
    
    upgradeHacknetFarm(nodeId: number, componentName: Component): void {
        if (componentName === Component.Node) {
            this.buyNewNode();
        } else {
            this.getNodeList()[nodeId].upgrade(componentName);
        }
    }
    
    async operate(): Promise<void> {
        let [nodeId, componentName, cost]: any[] = this.identifyCheapestComponentToUpgrade();
        // noinspection InfiniteLoopJS
        while (true) {
            await this.waitToHaveEnoughMoney(cost);
            this.upgradeHacknetFarm(nodeId, componentName);
            
            [nodeId, componentName, cost] = this.identifyCheapestComponentToUpgrade();
            const etaBeforeNextUpgrade = this.getEtaBeforeNextUpgrade(nodeId, componentName, cost);
            await this.waitUntilNextUpgrade(etaBeforeNextUpgrade);
        }
    }
    
    private identifyCheapestComponentToUpgrade(): any[] {
        
        let cheapestComponentToUpgrade = [];
        let upgradeCost = Infinity;
        
        if (this.getNodeCount() !== 0) {
            
            const nodeList = this.getNodeList();
            const nodeWithCheapestLevelUpg = getNodeWithCheapestLevelUpgrade(nodeList);
            const nodeWithCheapestRamUpg = getNodeWithCheapestRamUpgrade(nodeList);
            const nodeWithCheapestCoreUpg = getNodeWithCheapestCoreUpgrade(nodeList);
            
            if (isLevelUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestLevelUpg.getLevelUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestLevelUpg.id,
                    Component.Level,
                    Math.ceil(upgradeCost)];
                
            } else if (isRamUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg, nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestRamUpg.getRamUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestRamUpg.id,
                    Component.Ram,
                    Math.ceil(upgradeCost)];
                
            } else if (isCoreUpgTheCheapest(nodeWithCheapestLevelUpg, nodeWithCheapestRamUpg,
                nodeWithCheapestCoreUpg)) {
                upgradeCost = nodeWithCheapestCoreUpg.getCoreUpgradeCost();
                cheapestComponentToUpgrade = [
                    nodeWithCheapestCoreUpg.id,
                    Component.Core,
                    Math.ceil(upgradeCost)];
            }
        }
        
        if (this.getNewNodeCost() < upgradeCost) {
            cheapestComponentToUpgrade = [
                this.getNodeCount(),
                Component.Node,
                Math.ceil(this.getNewNodeCost())];
        }
        
        const nodeId = cheapestComponentToUpgrade[0];
        const componentName = cheapestComponentToUpgrade[1];
        const costF = this.logA.formatMoney(upgradeCost);
        const msg = `HACKNET_DAEMON - Upgrade target: Node ${nodeId} - ${Component[componentName]} - Cost: ${costF}`;
        this.logA.info(msg);
        
        return cheapestComponentToUpgrade;
        
        function getNodeWithCheapestLevelUpgrade(nodeList) {
            return nodeList.reduce(
                (prev, curr) => prev.getLevelUpgradeCost() < curr.getLevelUpgradeCost() ? prev : curr);
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
    
    private async waitToHaveEnoughMoney(cost: number) {
        const wealth = this.nsA.getServerMoneyAvailable('home');
        
        while (wealth <= cost) {
            const wealthF = this.logA.formatMoney(wealth);
            const costF = this.logA.formatMoney(cost);
            const msg = `HACKNET_DAEMON - Not enough money! Cost: ${costF}, available: ${wealthF}`;
            this.logA.warn(msg);
            await this.nsA.sleep(HACKNET_CONFIG.CYCLE_TIME);
        }
    }
    
    private getEtaBeforeNextUpgrade(nodeId, componentName, cost) {
        const timeToRoI = cost / this.getProductionRate(); //s
        let etaBeforeNextUpgrade = Math.ceil(timeToRoI / HACKNET_CONFIG.HARVEST_RATIO); //s
        
        if (componentName === Component.Node) {
            const msg = `HACKNET_DAEMON - Next upgrade: New node ${nodeId} in ${etaBeforeNextUpgrade} s.`;
            this.logA.info(msg);
        } else {
            const upgrade = this.getNodeList()[nodeId].getComponentLevel(componentName) + 1;
            const msg = `HACKNET_DAEMON - Next upgrade: Node ${nodeId} - ${Component[componentName]} -> ${upgrade} in ${etaBeforeNextUpgrade} s.`;
            this.logA.info(msg);
        }
        
        return etaBeforeNextUpgrade * 1000; // ms
    }
    
    private async waitUntilNextUpgrade(etaBeforeNextUpgrade) {
        await this.nsA.sleep(etaBeforeNextUpgrade);
    }
    
}