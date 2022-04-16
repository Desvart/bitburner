import {KITTY_HACK_CONFIG} from '/kitty-hack/kitty-hack-config';
import {LogNsAdapter} from '/resources/helpers';
import {KittyHackAdapter} from '/kitty-hack/kitty-hack-adapters';

export async function main(ns) {
    ns.disableLog('ALL');
    
    const nsA = new KittyHackAdapter(ns);
    const logA = new LogNsAdapter(ns);
    
    //noinspection InfiniteLoopJS
    while (true) {
        const hostState = {
            minSec: nsA.getServerMinSecurityLevel(KITTY_HACK_CONFIG.HOSTNAME),
            actualSec: nsA.getServerSecurityLevel(KITTY_HACK_CONFIG.HOSTNAME),
            maxMoney: nsA.getServerMaxMoney(KITTY_HACK_CONFIG.HOSTNAME),
            availMoney: nsA.getServerMoneyAvailable(KITTY_HACK_CONFIG.HOSTNAME),
        };
        printHostState(logA, hostState);
        
        if (hostState.actualSec > hostState.minSec) {
            logA.debug(`KITTY-HACK - Start weaken.`);
            await nsA.weaken(KITTY_HACK_CONFIG.HOSTNAME);
            
        } else if (hostState.availMoney < hostState.maxMoney) {
            logA.debug(`KITTY-HACK - Start grow.`);
            await nsA.grow(KITTY_HACK_CONFIG.HOSTNAME);
            
        } else {
            logA.debug(`KITTY-HACK - Start hack.`);
            await nsA.hack(KITTY_HACK_CONFIG.HOSTNAME);
        }
    }
}

function printHostState(logA, hostState) {
    const secMsg = `Security: ${hostState.actualSec}/${hostState.minSec}`;
    const monMsg = `Money: ${logA.formatMoney(hostState.availMoney)}/${logA.formatMoney(hostState.maxMoney)}`;
    logA.debug(`KITTY-HACK - ${secMsg} - ${monMsg}`);
}