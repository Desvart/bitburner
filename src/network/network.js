import {Server} from '/network/server.js';
import {NETWORK_CONFIG as config} from '/config/config.js';

export class Network {
    nodesList;
    #ns;
    
    get nodesNameList() { return this.nodesList.map(n => n.hostname); }
    
    get nodesCount() { return this.nodesNameList.length; };
    
    get isFullyOwned() { return this.#updateFullyOwnedStatus(); }
    
    constructor(ns) {
        this.#ns = ns;
        this.nodesList = this.#getNodesStaticData();
    }
    
    #getNodesStaticData() {
        let nodeList = [];
        const nodesNameList = this.#getNodeNames();
        for (const nodeName of nodesNameList) {
            const node = this.#ns.getServer(nodeName);
            const server = new Server(this.#ns, node);
            nodeList.push(server);
        }
        return nodeList;
    }
    
    #getNodeNames() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let infiniteLoopProtection = config.LOOP_SECURITY;
        
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.#ns.scan(nodeName);
            
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        
        return discoveredNodes;
    }
    
    getNodes(nodeNames) {
        if (nodeNames === null) {
            return this.nodesList;
            
        } else {
            let nodeList = [];
            for (let nodeName of nodeNames) {
                nodeList.push(this.getNode(nodeName));
            }
            
            return nodeList;
        }
    }
    
    getNode(nodeName) {
        return this.nodesList.filter(n => n.hostname === nodeName)[0];
    }
    
    #updateFullyOwnedStatus() {
        let fullyOwned = true;
        for (const node of this.nodesList) {
            if (node.isPotentialTarget === true && node.hasAdminRights === false) {
                fullyOwned = false;
                break;
            }
        }
        return fullyOwned;
    }
}