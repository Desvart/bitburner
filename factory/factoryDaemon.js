{	/* TODO
	* - Buy 25 servers with 8 GB as soon as we have the 11 k$ to buy it
	* - Deploy an adaptative target strategy on those workers
	* - Monitor the turnover of the factory
	* - As soon as 25% of the turnover reaches the cost of the next factory level, upgrade all workers
	* - Deploy a target strategy on those workers
	* - loop
	*/}



/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
   	ns.tail();
	ns.clearLog();

	//ns.purchaseServer("worker-0", 2);
	ns.print(ns.scan().filter((server) => server.match(/worker-/)));
	//destroyFactory(ns, 4);
	//ns.print(ns.scan().filter((server) => server.match(/worker-/)));

	ns.print(ns.getServerMaxRam(ns.getPurchasedServers()[0]));

}


function upgradeFactory(ns) {

	// Determine next level
	// Determine if enough money

}


function buyFactory(ns, ramSize) {

	const workersRootName = "worker-";
	const maxWorkers = ns.getPurchasedServerLimit();
	const workerCost = ns.getPurchasedServerCost(ramSize);

	if(ns.getPurchasedServers().length == 0)
		for(let i = 0; i < maxWorkers; i++)
			if(ns.getServerMoneyAvailable("home") >= workerCost)
				ns.purchaseServer(workersRootName + i, ramSize);
}

function destroyFactory(ns) {
	const workers = ns.getPurchasedServers();
	for(let workerName of workers) {
		ns.killall(workerName);
		ns.deleteServer(workerName);
	}
}