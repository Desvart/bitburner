export interface HacknetNsPort {
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
}