export class Network {
	#ns;
	nodeNames;
	nNodes;
	nodes;

	constructor(ns) {
		this.#ns 		= ns;
		this.nodeNames 	= getNodeNames(ns);
		this.nNodes 	= this.nodeNames.length;
		this.nodes 		= this.getLastNodeData();

		function getNodeNames(ns) {
			var discoveredNodes = [];
			var nodesToScan = ["home"];
			var infiniteLoopProtection = 9999;

			while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
				let nodeName = nodesToScan.pop();
				for (const connectedNodes of ns.scan(nodeName))
					if (discoveredNodes.includes(connectedNodes) == false)
						nodesToScan.push(connectedNodes);

				discoveredNodes.push(nodeName);
			}

			return discoveredNodes;
		}	
	}

	getLastNodeData() {
		let nodeList = [];
		for(let nodeName of this.nodeNames)
			nodeList.push(this.#ns.getServer(nodeName));
			
		this.nodes = nodeList;		
		return nodeList;
	}

	getNodes(nodeNames) {
		let nodeList = [];
		for(let nodeName of nodeNames)
			nodeList.push(this.getNode(nodeName));

		return nodeList;
	}

	getNode(nodeName) {
		return this.nodes.filter(n => n.hostname == nodeName)[0];
	}

	displayNode(a) {
		var b = this.nodes.filter(n => n.hostname == "foodnstuff")[0];
		//this.ns.print(delete b[0].ns);
		this.#ns.print("Node " + a + ": ?", b);

	}
}