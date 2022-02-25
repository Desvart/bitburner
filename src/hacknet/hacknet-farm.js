import {Log} 				 from '/helpers/helper.js';
import {HacknetNode} from '/hacknet/hacknet-node.js';

export class HacknetFarm {
	_ns;
	get MAX_NODE_COUNT()  { return this._ns.hacknet.maxNumNodes(); }
	get nodeCount()  	  	{ return this._ns.hacknet.numNodes(); }
	get newNodeCost() 	  { return this._ns.hacknet.getPurchaseNodeCost(); }
	get nodeList() 	 	  	{ return this.#getNodeList(); 		}
	get production()	  	{ return this.#getProduction(); 		}
	get totalProduction() { return this.#getTotalProduction(); 	}
	//get investment() 	  { return this.#getInvestment(); 		}


	constructor(ns) {
		//console.debug(`Hook - ${ns.getScriptName()} - Hacknet Farm`);
		this._ns = ns;
	}


	#getNodeList() {
		let nodeList = [];
		for (let i = 0; i < this.nodeCount; i++) {
			let node = new HacknetNode(this._ns, i);
			nodeList.push(node);
		}
		return nodeList;
	}

	#getProduction() {
		let prod = this.nodeList.reduce((prev, curr) => prev + curr.production, 0);
		return prod;
	}

	#getTotalProduction() {
		return this.nodeList.reduce((prev, curr) => prev.totalProduction + curr.totalProduction);
	}

	#getInvestment() {
		return this.nodeList.reduce((prev, curr) => prev.investment + curr.investment);
	}

	buyNewNode() {
		let nodeId = this._ns.hacknet.purchaseNode();
		Log.success(this._ns, `HACKNET_FARM - New node ${nodeId} bought.`);
	}
}