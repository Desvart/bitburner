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
        printHostState(log, hostState);
        
        if (hostState.actualSec > hostState.minSec) {
            log.info(`KITTYHACK - Start weaken.`);
            await ns.weaken(staticValues.hostname);
            
        } else if (hostState.availMoney < hostState.maxMoney) {
            log.info(`KITTYHACK - Start grow.`);
            await ns.grow(staticValues.hostname);
            
        } else {
            log.info(`KITTYHACK - Start hack.`);
            await ns.hack(staticValues.hostname);
        }
    }
}

function printHostState(log, hostState) {
    const secMsg = `Security: ${log.formatNumber(hostState.actualSec)}/${hostState.minSec}`;
    const monMsg = `Money: ${log.formatMoney(hostState.availMoney)}/${log.formatMoney(hostState.maxMoney)}`;
    log.info(`KITTYHACK - ${secMsg} - ${monMsg}\n`);
}