import {WORM_CONFIG} from '/worm/worm-config';

export async function main(ns) {
    
    const hostname = ns.getHostname();
    
    await ns.scp(WORM_CONFIG.INSTALL_PACKAGE, 'home', hostname);
   
    const daemonFile = WORM_CONFIG.RUN_PACKAGE[0];
    const hackFile = WORM_CONFIG.RUN_PACKAGE[1];
    const weakenFile = WORM_CONFIG.RUN_PACKAGE[2];
    const growFile = WORM_CONFIG.RUN_PACKAGE[3];
    const hostConstFile = WORM_CONFIG.INSTALL_PACKAGE[3];
    
    const hostConst = {
        hostname: hostname,
        
        freeRam: ns.getServerMaxRam(hostname) - ns.getScriptRam(daemonFile, hostname),
        hackRam: ns.getScriptRam(hackFile, hostname),
        weakenRam: ns.getScriptRam(weakenFile, hostname),
        growRam: ns.getScriptRam(growFile, hostname),
        
        minSec: ns.getServerMinSecurityLevel(hostname),
        maxMoney: ns.getServerMaxMoney(hostname),
    };
    
    await ns.write(hostConstFile, JSON.stringify(hostConst), 'w');
    
    ns.spawn(daemonFile, 1);
}