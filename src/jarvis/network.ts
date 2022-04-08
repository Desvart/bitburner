import {GLOBAL_CONFIG} from '/resources/global-config.js';
import {Server} from '/jarvis/server.js';

export class Network {
    
    private readonly nsA: NsAdapter;
    
    get nodes(): Server[] { return this.retrieveNetwork(); };
    
    constructor(nsA) {
        this.nsA = nsA;
    }
    
    identifyNukableHosts() {
        const network: Server[] = this.retrieveNetwork();
        return this.filtersOutNonNukableNodes(network);
    }
    
    private retrieveNetwork(): Server[] {
        const nodeNames: string[] = this.retrieveNodeNames();
        return this.buildNetwork(nodeNames);
    }
    
    private retrieveNodeNames(): string[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection: number = GLOBAL_CONFIG.LOOP_SECURITY;
        
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
    
    // noinspection JSMethodCanBeStatic
    private filtersOutNonNukableNodes(network: Server[]): Server[] {
        return network.filter(n => n.isNukable() === true);
    }
    
    nukeNodes(nukableNodes: Server[]): void {
        nukableNodes.forEach(n => n.nuke());
    }
    
    isNetworkFullyOwned(): boolean {
        const network: Server[] = this.retrieveNetwork();
        return !network.filter(n => n.isPotentialTarget === true).some(n => n.hasAdminRights() === false);
    }
}