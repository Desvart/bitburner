/** @param {NS} ns **/
export async function main(ns) {
	ns.disableLog("ALL");
	ns.clearLog();
	ns.tail();

	const target = ns.args[0];
	const packagePath = "/hacknet-pkg/";
	const config = {
		daemon	 : "/hacknet/hacknetDaemon-v3.js",
		model  	 : "/hacknet/hacknet-v4.js",
		helper 	 : "/helpers/helpers-v1.js",
		strategy : "cheapest", // {cheapest, roi, roi--}
	};

	ns.print("Step 1 - Zombify " + target);
	zombify(ns, target);

	ns.print("Step 2 - Build package");
	ns.print("\t - Package configuration: " + config);
	const packageContent = await buildPackage(ns, config, packagePath);

	ns.print("Step 3 - Deploy package");
	await deployPackageOnTargetServer(ns, packageContent, target);

	ns.print("Step 4 - Start daemon");
	const daemonFile = packageContent[0];
	executeDaemonOnTargetServer(ns, daemonFile, target, packagePath);
}


function zombify(ns, target) {
	ns.nuke(target);
	ns.killall(target);
}


async function buildPackage(ns, config, packagePath) {
	let packageContent = [];
	const values = Object.values(config);
	for(const value of values) {
		if(value.includes(".js")) {
			let fileDest = await packageFile(ns, value, packagePath);
			packageContent.push(fileDest);
		}
	}
	return packageContent;
}


async function packageFile(ns, source, packagePath) {

	const fileName = source.substring(source.lastIndexOf("/")+1);
	const fileDest = packagePath + fileName;
	let fileCode = ns.read(source);
	fileCode = updateDependencyPath(fileCode, packagePath);
	await ns.write(fileDest, fileCode, "w");

	return fileDest;


	function updateDependencyPath(fileCode, fileDest) {
    	let regexp = /(} from ")(.*\/)(.*js";)/;
		return fileCode.replace(regexp, "$1"+fileDest+"$3");
	}
}


async function deployPackageOnTargetServer(ns, packageContent, target) {

	const packagePath = packageContent[0].substring(0, packageContent[0].lastIndexOf("/")+1);
	cleanExistingPackage(ns, target, packagePath);

	await ns.scp(packageContent, "home", target);

	cleanLocalTmpPackage(ns, packageContent);


	function cleanExistingPackage(ns, target, packagePath) {
		const processes = ns.ps(target);
		const processesToKill = processes.filter(p => p.filename.includes(packagePath));
    	const idsOfprocessesToKill = processesToKill.map(p => p.pid);
		for(let id of idsOfprocessesToKill)
			ns.kill(id);

		const packages = ns.ls(target, packagePath);
    	for(let file of packages)
        	ns.rm(file, target);
	}

	function cleanLocalTmpPackage(ns, packageContent) {
		for(const file of packageContent) {
			ns.rm(file);
		}
	}
}


function executeDaemonOnTargetServer(ns, daemonFile, target, packagePath) {
	ns.exec(daemonFile, target, 1, packagePath);
}
