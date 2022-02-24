import {Log, initDaemon}            from 'helper.js';
import {HydraConfig, ShivaConfig}   from '../config/config';
import {Network}                    from 'network.js';

export async function main(ns) {
    
    initDaemon(ns, 'hydra-daemon.js', HydraConfig.displayTail);

    try {
        const shivaProcessId = ns.ps('home').filter(p => p.filename === 'hydra-daemon.js')[0].pid;
//        ns.kill(shivaProcessId);
    } catch{}
    //const network               = ns.args[1];
    const network                     = new Network(ns);

    //const potentialTargetsList  = ns.args[0];
    const potentialTargetsList        = [network.getNode('n00dles'), network.getNode('foodnstuff')];
    //const potentialTargetsList        = [network.getNode('harakiri-sushi')];
    const hydra = new Hydra(ns, potentialTargetsList, network);
    await hydra.deployMalwares();
    hydra.identifyTargetsAndFarms();
    hydra.invokeShivas();
}




class Hydra {

    potentialTargetsList;
    targetsList;
    network;
    farmsList;
    malwareFiles;
    ns;

    constructor(ns, potentialTargetsList, network) {
        this.ns                = ns;
        this.potentialTargetsList  = potentialTargetsList;
        this.network           = network;
        this.farmsList         = ['home'];
        this.malwareFiles      = ShivaConfig.malwareFiles;
        this.targetsList       = [];
    }


    async deployMalwares() {
        for (let farm of this.farmsList) {
            if (farm !== 'home') {
                await this.ns.scp(this.malwareFiles, farm);
                Log.info(this.ns, `Hydra malwares deployed on ${farm}`);
            }
        }
    }


    identifyTargetsAndFarms() {

        for (let i = 0; i < this.potentialTargetsList.length; i++) {
            this.targetsList.push([this.potentialTargetsList[i].hostname, this.farmsList[0]]);
        }

    }


    invokeShivas() {
        for (let [targetName, farm] of this.targetsList) {
            this.ns.exec('shiva-leecher-daemon.js', farm, 1, JSON.stringify(targetName), farm);
            Log.info(this.ns, `Shiva-daemon activated on ${farm} and targeting ${targetName}.`);
        }
    }




}