export class NetworkNode {
    
    hostname;
	requiredHackingSkill;
	numOpenPortsRequired;
	securityMin;
	moneyMax;
	ramMax;
	purchasedByPlayer;
	growthFactor;
	isPotentialTarget;
	get hasAdminRights() { return this.ns.hasRootAccess(this.hostname); }
	get availableMoney() { return this.ns.getServerMoneyAvailable(this.hostname); }
	get actualSecurity() { return this.ns.getServerSecurityLevel(this.hostname); }
	ns;

	constructor (ns, nodeX) {
		this.ns 					= ns;
		this.loadStaticData(nodeX);
	}

	loadStaticData(nodeX) {
		switch (typeof nodeX) {

			case 'string':
				const nodeName = nodeX;
				this.loadStaticDataFromNetwork(nodeName);
				break;

			case 'object':
				const nodeObj = nodeX;
				this.mapStaticDataFromImportedNode(nodeObj);
				break;
		}
	}

	loadStaticDataFromNetwork(nodeName) {
		const node = this.ns.getServer(nodeName);
		this.mapStaticDataFromImportedNode(node);
	}

	mapStaticDataFromImportedNode(node) {
		this.hostname 				= node.hostname;
		this.requiredHackingSkill 	= node.requiredHackingSkill;
		this.numOpenPortsRequired	= node.numOpenPortsRequired;
		this.securityMin 			= node.minDifficulty 			|| node.securityMin;
		this.moneyMax 				= node.moneyMax;
		this.ramMax 				= node.maxRam 					|| node.ramMax;
		this.purchasedByPlayer 		= node.purchasedByPlayer;
		this.growthFactor 			= node.serverGrowth 			|| node.growthFactor;
	}
    
}