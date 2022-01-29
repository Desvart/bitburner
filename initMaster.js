/** @param {NS} ns **/
export async function main(ns) {
	ns.tail();
    ns.clearLog();
	//ns.disableLog("ALL");

	ns.print("STEP 0 - Release Jarvis");
	ns.print("\t - NOT YET IMPLEMENTED");


	ns.print("STEP 1 - Release the Hacknet daemon");

	const host = "foodnstuff";
	ns.run("/deployers/hacknetDeployer-v1.js", 1, host);

	ns.print("\t - Hacknet daemon released");


	ns.print("STEP 3 - Release the Factory daemon");
	ns.print("\t - NOT YET IMPLEMENTED");

	
}