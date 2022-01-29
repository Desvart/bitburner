/** @param {NS} ns **/
export async function main(ns) {

	var config;
	if(ns.args.length == 0){
		config = [
			["pServ-0", "n00dles"],
			["pServ-1", "foodnstuff"],
			["pServ-2", "sigma-cosmetics"],
			["pServ-3", "joesguns"],
			["pServ-4", "zer0"],
			["pServ-5", "zer0"],
			["pServ-6", "silver-helix"],
			["pServ-7", "silver-helix"],
			["pServ-8", "silver-helix"],
			["pServ-9", "the-hub"],
			["pServ-10", "hong-fang-tea"],
			["pServ-11", "nectar-net"],
			["pServ-12", "neo-net"],
			["pServ-13", "max-hardware"],
			["pServ-14", "phantasy"],
			["pServ-15", "phantasy"],
			["pServ-16", "phantasy"],
			["pServ-17", "harakiri-sushi"],
			["pServ-18", "iron-gym"],
			["pServ-19", "iron-gym"],
			["pServ-20", "johnson-ortho"],
			["pServ-21", "omega-net"],
			["pServ-22", "omega-net"],
			["pServ-23", "crush-fitness"],
			["pServ-24", "the-hub"]	
		];
	} else{
		config = [["home", "joesguns"]];
	}
	
	for(var i=0; i<config.length; i++){
		if(ns.args.length == 0) ns.killall(config[i][0]);
		ns.tprint("Check 1.1");
		ns.run("deployRemoteWorm.js", 1, config[i][0], config[i][1]);
		ns.tprint("Check 1.2");
	}

}
