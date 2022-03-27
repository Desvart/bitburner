export interface NsPort {
    getNodeLevel(nodeId: number): number;
    
    getNodeRam(nodeId: number): number;
    
    getNodeCore(nodeId: number): number;
    
    getNodeLevelUpgradeCost(nodeId: number, upgradeQty: number): number;
    
    getNodeRamUpgradeCost(nodeId: number, upgradeQty: number): number;
    
    getNodeCoreUpgradeCost(nodeId: number, upgradeQty: number): number;
    
    getNodeProductionRate(nodeId: number): number;
    
    purchaseNodeLevelUpgrade(nodeId: number, purchaseQty: number): boolean;
    
    purchaseNodeRamUpgrade(nodeId: number, purchaseQty: number): boolean;
    
    purchaseNodeCoreUpgrade(nodeId: number, purchaseQty: number): boolean;
    
    purchaseNewNode(): number;
    
    getMaxNumNodes(): number;
    
    getNodeCount(): number;
    
    getNewNodeCost(): number;
    
    kill(scriptName: string, hostname: string, param: string): void;
    
    nuke(hostname: string): void;
    
    scp(file: string[], hostname: string): void;
    
    scriptRunning(file: string, hostname: string): boolean;
    
    exec(file: string, hostname: string, threadCount: number, ...params: any[]): void;
}