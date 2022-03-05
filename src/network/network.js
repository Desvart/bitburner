import {Server} from '/network/server.js';

export class Network {

	nodesList;
	get nodesNameList()	{ return this.nodesList.map(n => n.hostname); }
	get nodesCount() 	  { return this.nodesNameList.length; };
	get isFullyOwned()  { return this._updateFullyOwnedStatus(); }
	#ns;

    constructor(ns) {
			this.#ns 						= ns;
			this.nodesList 			= this._getNodeStaticData();
    }


    _getNodeStaticData() {
			let nodeList = [];
			const nodesNameList = this._getNodeNames();
			for (let nodeName of nodesNameList) {

				const node = this.#ns.getServer(nodeName);
				const staticNode = new Server(this.#ns, node);
				nodeList.push(staticNode);
			}

			return nodeList;
		}

	_getNodeNames() {
			let discoveredNodes         = [];
			let nodesToScan             = ['home'];
			let infiniteLoopProtection  = 9999;

			while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {

					let nodeName             = nodesToScan.pop();
					const connectedNodeNames = this.#ns.scan(nodeName)

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

	_updateFullyOwnedStatus() {
		let fullyOwned = true;
		for (let node of this.nodesList) {
			if (node.isPotentialTarget === true && node.hasAdminRights === false) {
				fullyOwned = false
				break;
			}
		}
		return fullyOwned;
	}
}