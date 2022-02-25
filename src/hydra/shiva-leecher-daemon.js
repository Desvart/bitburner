import {Log, initDaemon}    from '/helpers/helper.js';
import {ShivaConfig}        from '/config/config';
//const ns = import('../../assets/ns-mockup.js').then(obj => ns)

export async function main(ns) {
    
    initDaemon(ns, '/hydra/shiva-leecher-daemon.js', ShivaConfig.displayTail);

    const target  = ns.args[0];
    const farm    = ns.args[1];

    
    const shiva  = new ShivaLeecher(ns, JSON.parse(target), farm);
    await shiva.leechTarget();

}


class ShivaLeecher {

	  _ns;
    malwareFiles        = ShivaConfig.malwareFiles;
    pauseBetweenSteps   = ShivaConfig.pauseBetweenSteps
    hackRatio         = ShivaConfig.hackRatio
    target;
    farm;
	
    constructor(ns, target, farm) {
        this._ns    = ns;
        this.target = target;
        this.farm   = farm;
    }

    async leechTarget() {
        
        let i = 0;
        while (true) {

            await this._ns.sleep(4 * this.pauseBetweenSteps);
            this._ns.exec('/hydra/shiva-bleeder-daemon.js', this.farm, 1, JSON.stringify(this.target), this.farm, i);

            if (i < 1000 )
                i++;
            else
                i = 0;
            
        }
    }
}