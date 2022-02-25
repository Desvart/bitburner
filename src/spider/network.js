import {Log} from '/helpers/helper.js';
import {NetworkNode} from '/spider/network-node.js';
import {NetworkConfig} from  '/config/config.js';

export class Network {

	nodesNameList;
	nodesCount;
	nodesList;
	get isFullyOwned() { return this.#updateFullyOwnedStatus(); }
	_blackList = NetworkConfig.blackList;
	_ns;
    
    constructor(ns) {
        this._ns = ns;
        this.nodesNameList  = this.#getNodeNames();
		this.nodesCount 	= this.nodesNameList.length;
		this.nodesList 	 	= this.#getNodeStaticData();
    }

/*
	restore(network) {
			this.nodesNameList 	= network.nodesNameList;
			this.nodesCount		= network.nodesCount;
			for (node of network.nodesList)
				this.nodesList.filter(x => x.hostname === node.hostname).restore(node);
	}
*/

    #getNodeNames() {
		let discoveredNodes         = [];
		let nodesToScan             = ['home'];
		let infiniteLoopProtection  = 9999;

		while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {

			let nodeName             = nodesToScan.pop();
			const connectedNodeNames = this._ns.scan(nodeName)

			for (const connectedNodeName of connectedNodeNames) {
				if (discoveredNodes.includes(connectedNodeName) === false) {
					nodesToScan.push(connectedNodeName);
                }
            }
			discoveredNodes.push(nodeName);
		}

		return discoveredNodes;
	}


    #getNodeStaticData() {
		let nodeList = [];

		for (let nodeName of this.nodesNameList) {

			const node = this._ns.getServer(nodeName);
			/*const staticNode = new NetworkNode(this.#ns,
											   node.hostname, 
									           node.hasAdminRights, 
									           node.requiredHackingSkill,
									           node.numOpenPortsRequired, 
									           node.minDifficulty, 
									           node.moneyMax,			
									           node.maxRam,
									           node.purchasedByPlayer,
									           node.serverGrowth);
											   */
			const staticNode = new NetworkNode(this._ns, node);
			staticNode.isPotentialTarget = this.#checkIfPotentialTarget(staticNode);
			nodeList.push(staticNode);
		}
		
		return nodeList;
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
		for (let node of this.nodesList) {
			if (node.isPotentialTarget === true && node.hasAdminRights === false) {
				fullyOwned = false
				break;
			}
		}
		return fullyOwned;
	}

	#checkIfPotentialTarget(node) {
		let potentialTarget = true;

		for (let blackNode of this._blackList)
			if (node.hostname === blackNode)
				potentialTarget = false;
		
		if (node.purchasedByPlayer === true)
			potentialTarget = false;

		return potentialTarget;
	}
}