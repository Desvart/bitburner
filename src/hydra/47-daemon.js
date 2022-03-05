import {NetworkNode} from '/network/server.js';
import {Log} from '/helpers/helper.js';

export async function main(ns) {
    
    const GROW_FACTOR = 1.05;
    
    const targetName = ns.args[0];
    const blockId = ns.args[1];
    
    const target = new NetworkNode(ns, targetName);
    const coresCount = ns.getServer('home').cpuCores;
    const weakenDuration = ns.getWeakenTime(targetName);
    const growDuration = ns.getGrowTime(targetName);
    const securityDecrease = ns.weakenAnalyze(1, coresCount);
    const growThreadsCount = Math.ceil(ns.growthAnalyze(targetName, GROW_FACTOR, coresCount));
    
    const weakenThreadsCount = Math.ceil(ns.growthAnalyzeSecurity(growThreadsCount) / securityDecrease);
    
    ns.exec('/hydra/weaken.js', 'home', weakenThreadsCount, targetName, weakenThreadsCount, false, blockId, 0);
    
    await ns.sleep(weakenDuration - 200 - growDuration);
    
    if(target.actualSecurity === target.securityMin) {
        ns.exec('/hydra/grow.js', 'home', growThreadsCount, targetName, growThreadsCount, false, blockId, 1);
    }
    
    
    await ns.sleep(growDuration + 200 / 2);
    let msg = `Target status: ${Math.floor(target.availableMoney)} \$, SEC-${target.actualSecurity}`;
    let shivaLoc = `Shiva${blockId}-1`;
    Log.info(ns, `${target.hostname} - ${shivaLoc} - ${msg}`);
    
    await ns.sleep(200);
    msg = `Target status: ${Math.floor(target.availableMoney)} \$, SEC-${target.actualSecurity}`;
    shivaLoc = `Shiva${blockId}-0`;
    Log.info(ns, `${target.hostname} - ${shivaLoc} - ${msg}`);
}