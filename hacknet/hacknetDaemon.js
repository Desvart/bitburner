import {hacknet} from "/hacknet/hacknet-v4.js";

/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.tail();
	const packagePath = ns.args[0];

	let refreshRate = 200;
	let fn = trampoline(ns, buyAndUpgrade, refreshRate);
	await fn();
}

/** @param {NS} ns **/
function trampoline(ns, fn, pause = 200) {
	return async () => {
		let res = await fn(ns);
		while (typeof (res) === "function") {
			res = await res(ns);
			await ns.asleep(pause);
		}
	}
}

/** @param {NS} ns **/
async function buyAndUpgrade(ns) {

	const hFarm = new hacknet(ns);

	const farmStatus = hFarm.exportFarmStatus(ns);
	await saveFarmStatusLog(ns, farmStatus);

	//const upgradeTarget = hFarm.identifyCheapestUpgrade(ns);
	const upgradeTarget = hFarm.identifyMostProfitableUpgrade(ns);
	if (upgradeTarget[0] != -1)
		hFarm.upgradeFarm(ns, upgradeTarget);

	/*
	if(nNodes == maxNodes && coreRes == 0 && ramRes == 0 && levelRes == 0) {
		ns.tprint("All " + nodeCount + " Hacknet nodes are maxed.");
		localStorage.clear("totalHacknetInvested");
		return;
	}*/

	return buyAndUpgrade;
}


async function saveFarmStatusLog(ns, farmStatus) {
	var scriptName = ns.getScriptName();
	const targetFolder = scriptName.substring(0, scriptName.lastIndexOf("/")+1);
	let filename = targetFolder + "LOG-hacknet-roi.txt";
    await ns.write(filename, farmStatus, "a");
}
