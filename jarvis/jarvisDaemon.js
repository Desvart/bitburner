import {Network} from "/jarvis/network-v1.js";
import {getPortKeysList, info, error} from "/helpers/helpers-v1.js";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	ns.clearLog();
	
	// Create the first map
	var network = new Network(ns);

	// Get player stat
	var playerHackingLevel = ns.getPlayer().hacking;

	// Get number of port openner
	let nPortKeys = getNumberOfAvailablePortKeys(ns);
	
	//Filter hackable nodes
	let hackableNetwork = network.nodes.filter(x => x.hasAdminRights == false && 
							     x.requiredHackingSkill <= playerHackingLevel &&
								 x.numOpenPortsRequired <= nPortKeys);
	let hackableNodeNames = hackableNetwork.map(node => node.hostname);

	// Zombify hackable nodes
	if(hackableNodeNames.length != 0)
		zombify(ns, hackableNodeNames);
	else
	info(ns, "No new nodes to nuke at the moment.");
}


function getNumberOfAvailablePortKeys(ns) {
	
	let portKeys = getPortKeysList();
	let nPortKeys = 0;
	
	for(let portKey of portKeys) {
		if(ns.fileExists(portKey, "home"))
			nPortKeys++;
	}

	return nPortKeys;
}


function zombify(ns, targets) {

	if(Array.isArray(targets) == false)
		targets = [targets];

	let portKeys = getPortKeysList();
	let availablePortKeys = portKeys.filter(key => ns.fileExists(key, "home"));

	for(target of targets) {
		for(let portKey of availablePortKeys)
			switch(portKey) {
				case portKeys[0]: ns.brutessh(target);  break;
				case portKeys[1]: ns.ftpcrack(target);  break;
				case portKeys[2]: ns.relaysmtp(target); break;
				case portKeys[3]: ns.httpworm(target);  break;
				case portKeys[4]: ns.sqlinject(target); break;
			}
		ns.nuke(target);
		info(ns, "Node %s has been nuked successfuly.", target);
	}
}

class KeyRing {
	
	#keys = ["BruteSSH.exe", "FTPCrack.exe", "relaySMTP.exe", "HTTPWorm.exe", "SQLInject.exe"];

	constructor(ns) {
		this.ns = ns;
		this.availableKeys = this.getAvailableKeys();
		this.nAvailableKeys = this.availableKeys.length; 
	}

	getAvailableKeys() {
		return this.#keys.filter(key => this.ns.fileExists(key, "home"));
	}

	openPorts(target) {
		for(let key of this.availableKeys)
			switch(key) {
				case this.#keys[0]: ns.brutessh(target);  break;
				case this.#keys[1]: ns.ftpcrack(target);  break;
				case this.#keys[2]: ns.relaysmtp(target); break;
				case this.#keys[3]: ns.httpworm(target);  break;
				case this.#keys[4]: ns.sqlinject(target); break;
				default: error(ns, "Key %s doesn't exists.", key);
			}
	}

	zombify(target) {
		if(Array.isArray(targets) == false)
		targets = [targets];

		for(target of targets) {
			this.openPorts(target)
			ns.nuke(target);
			info(ns, "Node %s has been nuked successfuly.", target);
		}
	}





	
	
}
