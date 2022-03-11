import {Log, initDaemon}            from '/helpers/helper.js';
import {HydraConfig, ShivaConfig}   from '/config/config';
import {Network}                    from '/network/network.js';

export async function main(ns) {
    
    initDaemon(ns, 'hydra-daemon.js', HydraConfig.displayTail);
    //const network               = ns.args[1];
    const network                 = new Network(ns);
    //const potentialTargetsList  = ns.args[0];
    //const potentialTargetsList    = [network.getNode('n00dles'), network.getNode('foodnstuff')];
    const potentialTargetsList  = [network.getNode('foodnstuff')];

    const hydra = new Hydra(ns, potentialTargetsList, network);
    await hydra.deployMalwares();
    hydra.identifyTargetsAndFarms();
    hydra.invokeShivas();
}




export class Hydra {

    potentialTargetsList;
    targetsList;
    network;
    farmsList;
    malwareFiles;
    alreadyHackedServerList;
    _ns;

    constructor(ns, potentialTargetsList, network) {
        this._ns                = ns;
        this.potentialTargetsList  = potentialTargetsList;
        this.network           = new Network(ns);
        this.farmsList         = ['home'];
        this.malwareFiles      = ShivaConfig.malwareFiles;
        this.modulePath        = HydraConfig.modulePath;
        this.targetsList       = [];
    }


    async deployMalwares() {
        for (let farm of this.farmsList) {
            if (farm !== 'home') {
                await this._ns.scp(this.malwareFiles, farm);
                Log.info(this._ns, `Hydra malwares deployed on ${farm}`);
            }
        }
    }


    identifyTargetsAndFarms() {

        for (let i = 0; i < this.potentialTargetsList.length; i++) {
            this.targetsList.push([this.potentialTargetsList[i].hostname, this.farmsList[0]]);
        }

    }


    invokeShivas() {
        for (let [targetName, farmName] of this.targetsList) {
            this._ns.exec(this.modulePath + 'shiva-daemon2.js', farmName, 1, targetName, farmName);
            Log.info(this._ns, `Shiva-daemon activated on ${farmName} and targeting ${targetName}.`);
        }
    }


    identifyMostProfitableTarget() {
        const network = new Network(this._ns);
        let potentialTargets = network.nodesList.filter(n => n.isPotentialTarget === true &&
                                                             n.hasAdminRights    === true &&
                                                             n.hackChance        === 1 &&
                                                             this.alreadyHackedServerList.includes(n.hostname) === false);
        potentialTargets.sort((prev, curr) => {return (Math.sign(prev.securityMin - curr.securityMin) + Math.sign(- prev.moneyMax + curr.moneyMax)/10)});
        return potentialTargets[0].hostname;
    }
    
    computeMinRamToHack(targetName) {
        const leecherRam = this._ns.getScriptRam('/hydra/shiva-daemon2.js', 'home');
        const bleederRam = this._ns.getScriptRam('/hydra/shiva-daemon.js', 'home');
        const weakenRam  = this._ns.getScriptRam('/hydra/weaken.js',  'home');
        const hackRam    = this._ns.getScriptRam('/hydra/hack.js',    'home');
        const growRam    = this._ns.getScriptRam('/hydra/grow.js',    'home');
        
        const weakenDuration = this._ns.getWeakenTime(targetName);
        
        const delta = ShivaConfig.pauseBetweenSteps;
        const maxSimultaneousBlockCount = Math.ceil((weakenDuration + 2 * delta) / (4 * delta));
        
        const ramNeededForASingleBlock = bleederRam + (2 * weakenRam) + hackRam + growRam;
        const totalRamNeeded = leecherRam + maxSimultaneousBlockCount * ramNeededForASingleBlock;
        
        return totalRamNeeded;
        
    }

}