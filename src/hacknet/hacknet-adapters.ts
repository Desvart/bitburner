export class HacknetAdapters {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    getNodeLevel(nodeId: number): number {
        return this.ns.hacknet.getNodeStats(nodeId).level;
    }
    
    getNodeRam(nodeId: number) {
        return this.ns.hacknet.getNodeStats(nodeId).ram;
    }
    
    getNodeCore(nodeId: number) {
        return this.ns.hacknet.getNodeStats(nodeId).cores;
    }
    
    getNodeLevelUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.ns.hacknet.getLevelUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeRamUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.ns.hacknet.getRamUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeCoreUpgradeCost(nodeId: number, upgradeQty: number) {
        return this.ns.hacknet.getCoreUpgradeCost(nodeId, upgradeQty);
    }
    
    getNodeProductionRate(nodeId: number) {
        return this.ns.hacknet.getNodeStats(nodeId).production;
    }
    
    purchaseNodeLevelUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.ns.hacknet.upgradeLevel(nodeId, purchaseQty);
    }
    
    purchaseNodeRamUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.ns.hacknet.upgradeRam(nodeId, purchaseQty);
    }
    
    purchaseNodeCoreUpgrade(nodeId: number, purchaseQty: number): boolean {
        return this.ns.hacknet.upgradeCore(nodeId, purchaseQty);
    }
    
    purchaseNewNode(): number {
        return this.ns.hacknet.purchaseNode();
    }
    
    getMaxNumNodes(): number {
        return this.ns.hacknet.maxNumNodes();
    }
    
    getNodeCount(): number {
        return this.ns.hacknet.numNodes();
    }
    
    getNewNodeCost(): number {
        return this.ns.hacknet.getPurchaseNodeCost();
    }
    
    kill(scriptName: string, hostname: string, param: string): void {
        this.ns.kill(scriptName, hostname, param);
    }
    
    nuke(hostname: string): void {
        this.ns.nuke(hostname);
    }
    
    scp(file: string[], hostname: string): void {
        this.ns.scp(file, hostname);
    }
    
    scriptRunning(file: string, hostname: string): boolean {
        return this.ns.scriptRunning(file, hostname);
    }
    
    exec(file: string, hostname: string): void {
        this.ns.exec(file, hostname);
    }
    
    getServerMoneyAvailable(hostname: string = 'home'): number {
        return this.ns.getServerMoneyAvailable(hostname);
    }
    
    async sleep(duration: number) {
        await this.ns.sleep(duration);
    }
}