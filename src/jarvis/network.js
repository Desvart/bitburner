import { Server } from '/jarvis/server.js';
export class Network {
    constructor(nsA) {
        this.nsA = nsA;
    }
    get nodes() { return this.retrieveNetwork(); }
    ;
    identifyNukableHosts() {
        const network = this.retrieveNetwork();
        return this.filtersOutNonNukableNodes(network);
    }
    retrieveNetwork() {
        const nodeNames = this.retrieveNodeNames();
        return this.buildNetwork(nodeNames);
    }
    retrieveNodeNames() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let infiniteLoopProtection = 999;
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
    buildNetwork(nodeNames) {
        let nodes = [];
        for (const nodeName of nodeNames) {
            const node = new Server(this.nsA, nodeName);
            nodes.push(node);
        }
        return nodes;
    }
    // noinspection JSMethodCanBeStatic
    filtersOutNonNukableNodes(network) {
        return network.filter(n => n.isNukable() === true);
    }
    nukeNodes(nukableNodes) {
        nukableNodes.forEach(n => n.nuke());
    }
    isNetworkFullyOwned() {
        const network = this.retrieveNetwork();
        return !network.filter(n => n.isPotentialTarget === true).some(n => n.hasAdminRights() === false);
    }
}
//# sourceMappingURL=network.js.map