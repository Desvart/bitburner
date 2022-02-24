import {Log, initDaemon}    from 'helper.js';
import {ShivaConfig}        from '../config/config';
import {NetworkNode}        from 'network-node.js';

export async function main(ns) {
    
    initDaemon(ns, 'shiva-leecher-daemon.js', ShivaConfig.displayTail);

    const target  = ns.args[0];
    const farm    = ns.args[1];

    
    const shiva  = new ShivaLeecher(ns, JSON.parse(target), farm);
    await shiva.leechTarget();

}


class ShivaLeecher {

	ns;
	
	// CONFIG
	malwareFiles        = ShivaConfig.malwareFiles;
	pauseBetweenSteps   = ShivaConfig.pauseBetweenSteps
    hackRatio           = ShivaConfig.hackRatio
	
	// INPUTS
    target;
    farm;
	
	// CONSTANTS
    shivasSteps;
    coresCount;
    weakenEffect;
	
	// TO BE COMPUTED AND SHARED
	relativeDelaysInLaunchSequence;
	threadsCountsInLaunchSequence;
	malwareFilesInLaunchSequence;
	
    constructor(ns, target, farm) {
        this.ns                  = ns;
        //this.target              = new NetworkNode(ns, target);
        this.target              = target;
        this.farm                = farm;
    }

    async leechTarget() {
        
        let i = 0;
        while (true) {

            await this.ns.sleep(4 * this.pauseBetweenSteps);
            //await this.bleedTarget(i);
            this.ns.exec('shiva-bleeder-daemon.js', this.farm, 1, JSON.stringify(this.target), this.farm, i);

            if (i < 1000 )
                i++;
            else
                i = 0;
            
        }
    }
}