import {ShivaAdapter} from '/shiva/shiva-adapters.js';

export class Network {
    
    private readonly nsA: ShivaAdapter;
    
    get nodes(): Server[] { return this.retrieveNetwork(); };
    
    constructor(nsA) {
        this.nsA = nsA;
    }
    
    private retrieveNetwork(): Server[] {
        const nodeNames: string[] = this.retrieveNodeNames();
        return this.buildNetwork(nodeNames);
    }
    
    private retrieveNodeNames(): string[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection = 999;
        
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
    
    private buildNetwork(nodeNames: string[]): Server[] {
        let nodes: Server[] = [];
        for (const nodeName of nodeNames) {
            const node = new Server(this.nsA, nodeName);
            nodes.push(node);
        }
        return nodes;
    }
}

class Server {
    hostname: string;
    requiredHackingSkill: number;
    numOpenPortsRequired: number;
    purchasedByPlayer: boolean;
    ram: number;
    
    constructor(nsA: ShivaAdapter, nodeName: string) {
        
        const node: any = nsA.getNode(nodeName);
        this.hostname = node.hostname;
        this.requiredHackingSkill = node.requiredHackingSkill;
        this.numOpenPortsRequired = node.numOpenPortsRequired;
        this.purchasedByPlayer = node.purchasedByPlayer;
        this.ram = node.maxRam;
    }
}

/*
hostname
n.isPotentialTarget === true &&
n.hasAdminRights === true &&
n.hackChance === 1


 */