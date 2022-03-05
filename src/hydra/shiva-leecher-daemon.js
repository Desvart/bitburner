import {Log, initDaemon} from '/helpers/helper.js';
import {ShivaConfig} from '/config/config';


export async function main(ns) {
    
    initDaemon(ns, '/hydra/shiva-leecher-daemon.js', ShivaConfig.displayTail);
    
    const targetName = ns.args[0];
    const farmName = ns.args[1];
    
    const shiva = new ShivaLeecher(ns, targetName, farmName);
    await shiva.leechTarget();
    
}

class ShivaLeecher {
    malwareFiles = ShivaConfig.malwareFiles;
    pauseBetweenSteps = ShivaConfig.pauseBetweenSteps;
    hackRatio = ShivaConfig.hackRatio;
    bleederMalware = ShivaConfig.modulePath + 'shiva-bleeder-daemon.js';
    targetName;
    farmName;
    _ns;
    
    
    constructor(ns, targetName, farmName) {
        this._ns = ns;
        this.targetName = targetName;
        this.farmName = farmName;
    }
    
    
    async leechTarget() {
        
        let blockId = 0;
        let i = 1;
        while (i-- > 0) {
            
            await this._ns.sleep(4 * this.pauseBetweenSteps);
            this._ns.exec(this.bleederMalware, this.farmName, 1, this.targetName, this.farmName, blockId);
            
            blockId = blockId < 1000 ? blockId + 1 : 0;
            
        }
    }
}