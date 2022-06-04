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
        log.printHostState('WORM', staticValues.hostname, hostState);
        
        if (hostState.actualSec > hostState.minSec) {
            ns.exec(staticValues.WEAKEN_FILE, staticValues.hostname, staticValues.weakenThreadQty,
                staticValues.hostname, staticValues.weakenThreadQty);
            await ns.sleep(ns.getWeakenTime(staticValues.hostname) + 200);
            
        } else if (hostState.availMoney < hostState.maxMoney) {
            ns.exec(staticValues.GROW_FILE, staticValues.hostname, staticValues.growThreadQty, staticValues.hostname,
                staticValues.growThreadQty);
            await ns.sleep(ns.getGrowTime(staticValues.hostname) + 200);
            
        } else {
            //ns.exec(staticValues.HACK_FILE, staticValues.hostname, staticValues.hackThreadQty, staticValues.hostname, staticValues.hackThreadQty);
            const param = {
                target: staticValues.hostname,
                threadCount: staticValues.hackThreadQty,
                callRef: 'WORM'};
            ns.exec(staticValues.HACK_FILE, staticValues.hostname, staticValues.hackThreadQty, JSON.stringify(param));
            await ns.sleep(ns.getHackTime(staticValues.hostname) + 200);
        }
    }
}

