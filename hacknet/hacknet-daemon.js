import {Log, initDaemon, formatMoney} 	from '/helper.js';
import {HacknetConfig, JarvisConfig} 	from '/config/config.js';
import {HacknetFarm} 					from '/hacknet-farm.js';
import {HacknetNode} 					from '/hacknet-node.js';

export async function main(ns) {
	initDaemon(ns, 'hacknet-daemon.js', HacknetConfig.displayTail);
	
	let hacknetDaemon = new HacknetDaemon(ns);
	await hacknetDaemon.operate();
}


export class HacknetDaemon {
	#ns;
	#cycleTime;
	#harvestRatio;
	location
	queueId;
	//#availableFunds
	get #farm() 		{ return new HacknetFarm(this.#ns); 		 				}
	//get #newNodeCost() 	{ return Math.ceil(this.#ns.hacknet.getPurchaseNodeCost()); }
	//get #turnover() 	{ return this.#farm.production - this.#farm.investment;  	}
	
	constructor(ns) {
		this.#ns 			= ns;
		this.#cycleTime  	= HacknetConfig.cycleTime;
		this.#harvestRatio 	= HacknetConfig.harvestRatio;
		this.location		= HacknetConfig.location;
		this.queueId		= HacknetConfig.queueId;
	}


	static async deploy(ns, location) {
		if (location !== 'home') {
			await ns.scp('helper.js', 			location);
			await ns.scp('hacknet-daemon.js', 	location);
			await ns.scp('hacknet-farm.js', 	location);
			await ns.scp('hacknet-node.js', 	location);
			await ns.scp('config.js', 			location);
		}
	}

	static activate(ns, location) {
		ns.nuke(location);
		ns.exec('hacknet-daemon.js', location, 1);
	}



	async operate() {

		// check which component should be upgraded (least expensive)
		let [nodeId, componentName, cost] = this.#identifyCheapestComponentToUpgrade();
		Log.info(this.#ns, `HACKNET_DAEMON - Upgrade target: Node ${nodeId} - ${componentName} - Cost: ${formatMoney(this.#ns, cost)}`);

		// check available funds
		while (this.#ns.getPlayer().money <= cost) {
			let availableFund = formatMoney(this.#ns, this.#ns.getPlayer().money);
			Log.warn(this.#ns, `HACKNET_DAEMON - Not enough money! Cost: ${formatMoney(this.#ns, cost)}, available: ${availableFund}`);
			await this.#ns.sleep(this.#cycleTime * 10);
		}

		// upgrade
		if (componentName === HacknetNode.Component.NODE) {
			this.#farm.buyNewNode();
		} else {
			this.#farm.nodeList[nodeId].upgrade(componentName);
		}

		// check which next element should be upgraded (least expensive)
		let [nodeIdNext, componentNameNext, costNext] = this.#identifyCheapestComponentToUpgrade();

		// compute time before next upgrade
		let timeToRoI 				= costNext / this.#farm.production; //s
		let timeBeforeNextUpgrade 	= Math.ceil(timeToRoI / this.#harvestRatio) * 1000; //ms

		if (componentNameNext === HacknetNode.Component.NODE) {
			Log.info(this.#ns, `HACKNET_DAEMON - Next upgrade: New node ${nodeIdNext} in ${timeBeforeNextUpgrade} s.`);
		} else {
			let upgradeNext = this.#farm.nodeList[nodeIdNext][componentNameNext] + 1;
			Log.info(this.#ns, `HACKNET_DAEMON - Next upgrade: Node ${nodeIdNext} - ${componentNameNext} -> ${upgradeNext} in ${timeBeforeNextUpgrade / 1000} s.`);
		}

		// if less than Jarvis loop, wait, else send Jarvis the wake-up timestamp
		if (timeBeforeNextUpgrade < JarvisConfig.cycleTime) {
			await this.#ns.sleep(timeBeforeNextUpgrade);
			await this.operate();
		} else {
			await this.#ns.writePort(this.queueId, Date.now() + timeBeforeNextUpgrade);
			Log.info(this.#ns, `HACKNET_DAEMON - Quit Hacknet Daemon. Jarvis should relaunch Hacknet Daemon in ${timeBeforeNextUpgrade / 1000} s.`);
		}
	}


	#identifyCheapestComponentToUpgrade() {

		let cheapestComponentToUpgrade = [];
		let upgradeCost = Infinity;
		
		if (this.#farm.nodeCount !== 0) {
			let nodeWithCheapestLevelUpgrade = this.#farm.nodeList.reduce((prev, curr) => prev.levelUpgradeCost < curr.levelUpgradeCost ? prev : curr);
			let nodeWithCheapestRamUpgrade 	 = this.#farm.nodeList.reduce((prev, curr) => prev.ramUpgradeCost   < curr.ramUpgradeCost   ? prev : curr);
			let nodeWithCheapestCoreUpgrade  = this.#farm.nodeList.reduce((prev, curr) => prev.coreUpgradeCost  < curr.coreUpgradeCost  ? prev : curr);
			
			
			if (nodeWithCheapestLevelUpgrade.levelUpgradeCost < nodeWithCheapestRamUpgrade.ramUpgradeCost && 
				nodeWithCheapestLevelUpgrade.levelUpgradeCost < nodeWithCheapestCoreUpgrade.coreUpgradeCost) {
				upgradeCost = nodeWithCheapestLevelUpgrade.levelUpgradeCost;
				cheapestComponentToUpgrade = [nodeWithCheapestLevelUpgrade.id, HacknetNode.Component.LEVEL, Math.ceil(upgradeCost)];

			} else if (nodeWithCheapestRamUpgrade.ramUpgradeCost < nodeWithCheapestLevelUpgrade.levelUpgradeCost && 
					   nodeWithCheapestRamUpgrade.ramUpgradeCost < nodeWithCheapestCoreUpgrade.coreUpgradeCost) {
				upgradeCost = nodeWithCheapestRamUpgrade.ramUpgradeCost;
				cheapestComponentToUpgrade = [nodeWithCheapestRamUpgrade.id, HacknetNode.Component.RAM, Math.ceil(upgradeCost)];

			} else if (nodeWithCheapestCoreUpgrade.coreUpgradeCost < nodeWithCheapestLevelUpgrade.levelUpgradeCost && 
					   nodeWithCheapestCoreUpgrade.coreUpgradeCost < nodeWithCheapestRamUpgrade.ramUpgradeCost) {
				upgradeCost = nodeWithCheapestCoreUpgrade.coreUpgradeCost;
				cheapestComponentToUpgrade = [nodeWithCheapestCoreUpgrade.id, HacknetNode.Component.CORE, Math.ceil(upgradeCost)];
			}
		}

		if (this.#farm.newNodeCost < upgradeCost) {
			cheapestComponentToUpgrade = [this.#farm.nodeCount, HacknetNode.Component.NODE, Math.ceil(this.#farm.newNodeCost)];
		}

		return cheapestComponentToUpgrade;
	}
}