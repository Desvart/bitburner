import {SHIVA_CONFIG} from '/shiva2/shiva-config';

export async function main(ns) {
    const targetName = ns.args[0];
    const hDuration = ns.args[1];
    const blockId = ns.args[2];
    
    let availableMoney = ns.getServerMoneyAvailable(targetName);
    let actualSecurity = ns.getServerSecurityLevel(targetName);
    let msg = `Target status: ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
    console.debug(`${targetName} - Shiva${blockId} - ${msg}`);
    
    await ns.sleep(hDuration + SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS / 2);
    availableMoney = ns.getServerMoneyAvailable(targetName);
    actualSecurity = ns.getServerSecurityLevel(targetName);
    msg = `Target status: HACK - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
    let shivaLoc = `Shiva${blockId}-3`;
    console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
    
    await ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
    availableMoney = ns.getServerMoneyAvailable(targetName);
    actualSecurity = ns.getServerSecurityLevel(targetName);
    msg = `Target status: WEAKEN1 - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
    shivaLoc = `Shiva${blockId}-0`;
    console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
    
    await ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
    availableMoney = ns.getServerMoneyAvailable(targetName);
    actualSecurity = ns.getServerSecurityLevel(targetName);
    msg = `Target status: GROW - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
    shivaLoc = `Shiva${blockId}-1`;
    console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
    
    await ns.sleep(SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS);
    availableMoney = ns.getServerMoneyAvailable(targetName);
    actualSecurity = ns.getServerSecurityLevel(targetName);
    msg = `Target status: WEAKEN2 - ${Math.floor(availableMoney)} \$, SEC-${actualSecurity}`;
    shivaLoc = `Shiva${blockId}-2`;
    console.debug(`${targetName} - ${shivaLoc} - ${msg}`);
}

