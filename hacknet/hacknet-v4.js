import {formatMoney, formatNumbers, formatTime, debug, info, warning, error} from "/helpers/helpers-v1.js";

export class hacknet {
	maxNode  = 500;
	maxLevel = 200;
	maxRam	 = 64;
	maxCore  = 16;

	getNodes(ns) {
		let nodes = [];
		let nNodes = this.getNodeCount(ns);
		for (let i = 0; i < nNodes; i++)
			nodes.push(ns.hacknet.getNodeStats(i));

		return nodes;
	}

	getNextNodeCost(ns) {
		return ns.hacknet.getPurchaseNodeCost();
	}

	getNodeCount(ns) {
		return ns.hacknet.numNodes();
	}

	computeProduction(level, ram, core, multiplier) {
		return (level * 1.5) * Math.pow(1.035, ram - 1) * (core + 5) / 6 * multiplier;
	}

	getTotalProduction(ns) {
		let nNodes = this.getNodeCount(ns);
		let gains = 0;
		for (let i = 0; i < nNodes; i++)
			gains += ns.hacknet.getNodeStats(i).totalProduction;

		return Math.floor(gains);
	}

	getTotalExpenditure(ns) {

		if (this.getNodeCount(ns) == 0) localStorage.clear("totalHacknetInvested");

		let totalSpentCost = Math.floor(localStorage.getItem("totalHacknetInvested"));
		if (totalSpentCost == null) totalSpentCost = 0;

		return totalSpentCost;
	}

	updateTotalExpenditure(ns, newExpenditure) {
		localStorage.setItem("totalHacknetInvested", this.getTotalExpenditure(ns) + newExpenditure);
	}

	getTurnover(ns) {
		return this.getTotalProduction(ns) - this.getTotalExpenditure(ns);
	}

	determineInvestmentAmount(ns) {

		let turnover = this.getTurnover(ns);
		let wealth = ns.getPlayer().money;
		let investmentRatio;
		if(turnover <= 0) return Math.min(2000, wealth);
		else if (turnover < 1000) investmentRatio = 0.7;
		else if (turnover < 2000) investmentRatio = 0.6;
		else if (turnover < 5000) investmentRatio = 0.5;
		else if (turnover < 10000) investmentRatio = 0.4;
		else if (turnover < 100000) investmentRatio = 0.3;
		else if (turnover < 1000000) investmentRatio = 0.2;
		else if (turnover > 1000000) investmentRatio = 0.1;

		let investableAmount =  Math.min(Math.max(turnover * investmentRatio, 0), wealth);
		return investableAmount;
	}

	identifyCheapestUpgrade(ns, upgradeSteps) {

		const nodes = this.getNodes(ns);

		const [coreNodeId, coreUpgradeCost] = this.identifyCheapestCoreToUpgrade(ns, nodes, upgradeSteps[2]);
		const [ramNodeId, ramUpgradeCost] = this.identifyCheapestRamToUpgrade(ns, nodes, upgradeSteps[1]);
		const [levelNodeId, levelUpgradeCost] = this.identifyCheapestLevelToUpgrade(ns, nodes, upgradeSteps[0]);

		const investableAmount = this.determineInvestmentAmount(ns);

		debug(ns, "------");
		debug(ns, "Node upgrade - Node %d (%s)", [this.getNodeCount(ns), formatMoney(this.getNextNodeCost(ns))]);
		debug(ns, "Cheapest core upgrade - Node %d (%s)", [coreNodeId, formatMoney(coreUpgradeCost)]);
		debug(ns, "Cheapest RAM upgrade - Node %d (%s)", [ramNodeId, formatMoney(ramUpgradeCost)]);
		debug(ns, "Cheapest level upgrade - Node %d (%s)", [levelNodeId, formatMoney(levelUpgradeCost)]);

		let identifiedElement;
		if (this.getNextNodeCost(ns) < investableAmount)
			identifiedElement = [this.getNodeCount(ns), "node"];
		else if (coreNodeId >= 0 && coreUpgradeCost < investableAmount)
			identifiedElement = [coreNodeId, "core"];
		else if (ramNodeId >= 0 && ramUpgradeCost < investableAmount)
			identifiedElement = [ramNodeId, "ram"];
		else if (levelNodeId >= 0 && levelUpgradeCost < investableAmount)
			identifiedElement = [levelNodeId, "level"];
		else
			identifiedElement = [-1, ""];

		debug(ns, "Investable amount %s", investableAmount);
		debug(ns, "Cheapest element - Node %d / %s", [identifiedElement[0], identifiedElement[1]]);
		debug(ns, "------");

		return identifiedElement;
	}

	identifyCheapestCoreToUpgrade(ns, nodes, upgradeStep) {

		let upgradableCores = nodes.filter(x => x.cores < this.maxCore);
		if (upgradableCores.length > 0) {
			let cheapestCore = upgradableCores.sort((a, b) => a.cores - b.cores)[0];
			let cheapestCoreId = nodes.indexOf(cheapestCore);
			let coreUpgradeCost = ns.hacknet.getCoreUpgradeCost(cheapestCoreId, upgradeStep);
			return [cheapestCoreId, coreUpgradeCost];
		}
		else return [-1, 0];
	}

	identifyCheapestRamToUpgrade(ns, nodes, upgradeStep) {

		let upgradableRams = nodes.filter(x => x.ram < this.maxRam);
		if (upgradableRams.length > 0) {
			let cheapestRam = upgradableRams.sort((a, b) => a.ram - b.ram)[0];
			let cheapestRamId = nodes.indexOf(cheapestRam);
			let ramUpgradeCost = ns.hacknet.getRamUpgradeCost(cheapestRamId, upgradeStep);
			return [cheapestRamId, ramUpgradeCost];
		}
		else return [-1, 0];
	}

	identifyCheapestLevelToUpgrade(ns, nodes, upgradeStep) {

		let upgradableLevels = nodes.filter(x => x.level < this.maxLevel);
		if (upgradableLevels.length > 0) {
			let cheapestLevel = upgradableLevels.sort((a, b) => a.level - b.level)[0];
			let cheapestLevelId = nodes.indexOf(cheapestLevel);
			let levelUpgradeCost = ns.hacknet.getLevelUpgradeCost(cheapestLevelId, upgradeStep);
			return [cheapestLevelId, levelUpgradeCost];
		}
		else return [-1, 0];
	}

	/**
	 * Identifies the most profitable element to upgrade in the entire hacknet.
	 * Once found, it gives back the "coordinates" of the element {nodeId; elementName} to upgrade.
	 * If there is enough available funds to upgrade it, do it. Else check if buying a new node is 
	 * feasible in the next 30 seconds. If so, buy it. Else, wait to gather more funds. (this last 
	 * logic may need to be stored elsewhere).
	 */
	identifyMostProfitableUpgrade(ns) {

		const prodMultiplier = ns.getHacknetMultipliers().production;
		const nodes = this.getNodes(ns);
		let elementToUpgrade = [this.getNodeCount(ns), "node"];
		let nodeMinRoI = this.getNextNodeCost(ns)/(1.5*prodMultiplier);
		let upgradedProduction = 0, gain = 0, upgradeCost = 0;
		
		{ // DEBUG
			debug(ns, "Node %d - Node upgraded prod: %d $/s", this.getNodeCount(ns), 1.5*prodMultiplier);
			debug(ns, "Node %d - Node upgraded gain: %.4f $/s", this.getNodeCount(ns), 1.5*prodMultiplier);
			debug(ns, "Node %d - Node upgraded cost: %s", this.getNodeCount(ns), formatMoney(ns, this.getNextNodeCost(ns)));
			debug(ns, "Node %d - Node RoI: %s\n", this.getNodeCount(ns), formatTime(ns, nodeMinRoI));
		}

		for(let i = 0; i <nodes.length; i++) {
			
			if(nodes[i].level < this.maxLevel){
				upgradedProduction = this.computeProduction(nodes[i].level + 1, nodes[i].ram, nodes[i].cores, prodMultiplier);
				gain = upgradedProduction - nodes[i].production;
				upgradeCost = ns.hacknet.getLevelUpgradeCost(i, 1);
				//let nodeLevelGain = gain/upgradeCost;
				let nodeLevelRoI = upgradeCost/gain;

				{ // DEBUG
					debug(ns, "Node %d - Level upgraded prod: %d $/s", i, upgradedProduction);
					debug(ns, "Node %d - Level upgraded gain: %.4f $/s", i, gain);
					debug(ns, "Node %d - Level upgraded cost: %s", i, formatMoney(ns, upgradeCost));
					debug(ns, "Node %d - Level RoI: %s\n", i, formatTime(ns, nodeLevelRoI));
				}
				
				if(nodeLevelRoI < nodeMinRoI) {
					nodeMinRoI = nodeLevelRoI;
					elementToUpgrade = [i, "level"];
				}
			}
			
			if(nodes[i].ram < this.maxRam){
				upgradedProduction = this.computeProduction(nodes[i].level, nodes[i].ram*2, nodes[i].cores, prodMultiplier);
				gain = upgradedProduction - nodes[i].production;
				upgradeCost = ns.hacknet.getRamUpgradeCost(i, 1);
				//let nodeRamGain = gain/upgradeCost;
				let nodeRamRoI = upgradeCost/gain;

				{ // DEBUG
					debug(ns, "Node %d - RAM upgraded prod: %d $/s", i, upgradedProduction);
					debug(ns, "Node %d - RAM upgraded gain: %.4f $/s", i, gain);
					debug(ns, "Node %d - RAM upgraded cost: %s", i, formatMoney(ns, upgradeCost));
					debug(ns, "Node %d - RAM RoI: %s\n", i, formatTime(ns, nodeRamRoI));
				}
				
				if(nodeRamRoI < nodeMinRoI) {
					nodeMinRoI = nodeRamRoI;
					elementToUpgrade = [i, "ram"];
				}
			}
			
			if(nodes[i].cores < this.maxCore){
				upgradedProduction = this.computeProduction(nodes[i].level, nodes[i].ram, nodes[i].cores+1, prodMultiplier);
				gain = upgradedProduction - nodes[i].production;
				upgradeCost = ns.hacknet.getCoreUpgradeCost(i, 1);
				let nodeCoreRoI = upgradeCost/gain;

				{ // DEBUG
					debug(ns, "Node %d - Core upgraded prod: %d $/s", i, upgradedProduction);
					debug(ns, "Node %d - Core upgraded gain: %.4f $/s", i, gain);
					debug(ns, "Node %d - Core upgraded cost: %s", i, formatMoney(ns, upgradeCost));
					debug(ns, "Node %d - Core RoI: %s\n", i, formatTime(ns, nodeCoreRoI));
				}
				
				if(nodeCoreRoI < nodeMinRoI) {
					nodeMinRoI = nodeCoreRoI;
					elementToUpgrade = [i, "core"];
				}
			}
		}
		
		debug(ns, "Element to upgrade: %d-%s", elementToUpgrade);
		return elementToUpgrade;
	}

	async buyNode(ns) {
		const newNodeCost = ns.hacknet.getPurchaseNodeCost();
		const investableAmount = this.determineInvestmentAmount(ns);
		//if(investableAmount > newNodeCost && ns.hacknet.numNodes() < this.maxNode) {
		let nodeId = this.getNodeCount(ns);
		if (investableAmount > newNodeCost) {
			nodeId = ns.hacknet.purchaseNode();
			if (nodeId != -1) {
				info(ns, "hacknet-node-%d sucessfully purchased", nodeId);
				await ns.clearPort(1);
				this.updateTotalExpenditure(ns, newNodeCost);
			}
			else {
				error(ns, "New node couldn't be purchased - Script is aborted");
				ns.exit();
			}
		}
		else {
			if(ns.peek(1) == "NULL PORT DATA") {
				warning(ns, "Not enough money (%s) to purchase a node %d (%s)", [formatMoney(ns, investableAmount), nodeId, formatMoney(ns, newNodeCost)]);
				await ns.writePort(1, "building money");
			}
		}
	}

	determineUpgradeSteps(turnover) {
		if 		(turnover < 500000) 	return [1, 1, 1];
		else if (turnover < 1000000) 	return [2, 1, 1];
		else if (turnover < 100000000) 	return [5, 1, 1];
		else if (turnover > 100000000) 	return [10, 1, 1];
	}

	async upgradeNode(ns, [nodeId, item]) {

		let upgradeStep = this.determineUpgradeSteps(this.getTurnover(ns));
		let getUpgradeCostFn, upgradeFn, itemLevel;
		switch (item) {
			case "core":
				getUpgradeCostFn = ns.hacknet.getCoreUpgradeCost;
				upgradeFn = ns.hacknet.upgradeCore;
				itemLevel = ns.hacknet.getNodeStats(nodeId).cores;
				upgradeStep = upgradeStep[2];
				break;
			case "ram":
				getUpgradeCostFn = ns.hacknet.getRamUpgradeCost;
				upgradeFn = ns.hacknet.upgradeRam;
				itemLevel = ns.hacknet.getNodeStats(nodeId).ram;
				upgradeStep = upgradeStep[1];
				break;
			case "level":
				getUpgradeCostFn = ns.hacknet.getLevelUpgradeCost;
				upgradeFn = ns.hacknet.upgradeLevel;
				itemLevel = ns.hacknet.getNodeStats(nodeId).level;
				upgradeStep = upgradeStep[0];
				break;
			default:
				error(ns, "Hacknet item %s doesn't exist.", item);
				ns.exit();
		}

		const upgradeCost = getUpgradeCostFn(nodeId, upgradeStep);
		const investableAmount = this.determineInvestmentAmount(ns);
		if (investableAmount > upgradeCost) {
			if (upgradeFn(nodeId, upgradeStep)) {
				info(ns, "hacknet-node-%d - %s upgraded: %d -> %d", [nodeId, item, itemLevel, itemLevel + upgradeStep]);
				await ns.clearPort(1);
				this.updateTotalExpenditure(ns, upgradeCost);
				return true;
			}
			else {
				error(ns, "hacknet-node-%d - Upgrading %s failed - Script is aborted", [nodeId, item]);
				ns.exit();
			}
		}
		else {
			if(ns.peek(1) == "NULL PORT DATA") {
				warning(ns, "hacknet-node-%d - Not enough money (%s) to upgrade %s (%s)", [nodeId, formatMoney(ns, investableAmount), item, formatMoney(ns, upgradeCost)]);
				await ns.writePort(1, "building money");
			}
		}
	}

	async upgradeFarm(ns, upgradeTarget) {
		const nodeId = upgradeTarget[0];
		if (nodeId == this.getNodeCount(ns))
			await this.buyNode(ns);
		else
			await this.upgradeNode(ns, upgradeTarget);
	}

	exportFarmStatus(ns) {
		return ns.sprintf("%s;%s;%s;%s\n", Date.now(), this.getTotalProd(ns), this.getTotalGains(ns), this.getTotalExpenditure(ns));
	}

	getTotalProd(ns) {
		let totalProd = 0;
		for(let i = 0; i < ns.hacknet.numNodes(); i++) {
			totalProd += ns.hacknet.getNodeStats(i).production;
		}
		return totalProd;
	}

	getTotalGains(ns) {
		let totalProd = 0;
		for(let i = 0; i < ns.hacknet.numNodes(); i++) {
			totalProd += ns.hacknet.getNodeStats(i).totalProduction;
		}
		return totalProd;
	}

}