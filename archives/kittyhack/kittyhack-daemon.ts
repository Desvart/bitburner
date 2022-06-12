import {INs, loadInitFile, Log} from '/resources/helpers';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const staticValues = loadInitFile(ns, ns.args[0]);
    const log = new Log(ns);
    
    //noinspection InfiniteLoopJS
    while (true) {
        const hostState = {
            minSec: staticValues.minSec,
            actualSec: ns.getServerSecurityLevel(staticValues.hostname),
            maxMoney: staticValues.maxMoney,
            availMoney: ns.getServerMoneyAvailable(staticValues.hostname),
        };
        log.printHostState('KITTYHACK', staticValues.hostname, hostState);
        
        if (hostState.actualSec > hostState.minSec) {
            log.info(`KITTYHACK - Start weaken.`);
            await ns.weaken(staticValues.hostname, { threads:  staticValues.numThreads });
            
        } else if (hostState.availMoney < hostState.maxMoney) {
            log.info(`KITTYHACK - Start grow.`);
            await ns.grow(staticValues.hostname, { threads:  staticValues.numThreads });
            
        } else {
            log.info(`KITTYHACK - Start hack.`);
            await ns.hack(staticValues.hostname, { threads:  staticValues.numThreads });
        }
    }
}