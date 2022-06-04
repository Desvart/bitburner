import {INs, Log} from '/resources/helpers';

export async function main(ns) {
    const target = ns.args[0];
    const blockId = ns.args[1];
    const delay = ns.args[2];
    const pauseBetweenBlocks = ns.args[3];
    
    const log = new Log(ns);
    
    await ns.sleep(delay);
    let msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
    log.info(`SHIVA > STATUS ${target} < HACK     ${blockId}-0: ${msg}`);
    
    await ns.sleep(pauseBetweenBlocks);
    msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
    log.info(`SHIVA > STATUS ${target} > HACK     ${blockId}-4: ${msg}`);
    
    await ns.sleep(pauseBetweenBlocks);
    msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
    log.info(`SHIVA > STATUS ${target} > WEAKEN 1 ${blockId}-1: ${msg}`);
    
    await ns.sleep(pauseBetweenBlocks);
    msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
    log.info(`SHIVA > STATUS ${target} > GROW     ${blockId}-2: ${msg}`);
    
    await ns.sleep(pauseBetweenBlocks);
    msg = `${getAvailMoney(ns, log, target)} \$, SEC-${getActualSec(ns, log, target)}`;
    log.info(`SHIVA > STATUS ${target} > WEAKEN 2 ${blockId}-3: ${msg}`);
}

function getAvailMoney(ns: INs, log: Log, targetName: string) {
    return log.formatMoney(Math.floor(ns.getServerMoneyAvailable(targetName)));
}

function getActualSec(ns: INs, log: Log, targetName: string) {
    return log.formatNumber(ns.getServerSecurityLevel(targetName));
}


