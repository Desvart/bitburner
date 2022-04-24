import {WORM_CONFIG} from '/worm/worm-config';
import {LogNsAdapter} from '/resources/helpers';

export async function main(ns) {
    const nsA = new WormAdapter(ns);
    const logA = new LogNsAdapter(ns);
    const hostConst = JSON.parse(ns.read(WORM_CONFIG.INSTALL_PACKAGE[3]));

    //noinspection InfiniteLoopJS
    while (true) {
        const hostState = {
            minSec: hostConst.minSec,
            actualSec: nsA.getServerSecurityLevel(hostConst.hostname),
            maxMoney: hostConst.maxMoney,
            availMoney: nsA.getServerMoneyAvailable(hostConst.hostname),
        };
        printHostState(logA, hostConst.hostname, hostState);
        
        if (hostState.actualSec > hostState.minSec) {
            const threadQty = Math.floor(hostConst.freeRam / hostConst.weakenRam);
            nsA.exec(WORM_CONFIG.RUN_PACKAGE[2], hostConst.hostname, threadQty);
            await nsA.sleep(nsA.getWeakenTime(hostConst.hostname) + 100);
            
        } else if (hostState.availMoney < hostState.maxMoney) {
            const threadQty = Math.floor(hostConst.freeRam / hostConst.growRam);
            nsA.exec(WORM_CONFIG.RUN_PACKAGE[3], hostConst.hostname, threadQty);
            await nsA.sleep(nsA.getGrowTime(hostConst.hostname) + 100);
            
        } else {
            const threadQty = Math.floor(hostConst.freeRam / hostConst.hackRam);
            nsA.exec(WORM_CONFIG.RUN_PACKAGE[1], hostConst.hostname, threadQty);
            await nsA.sleep(nsA.getHackTime(hostConst.hostname) + 100);
        }
    }
}

function printHostState(logA, hostname, hostState) {
    const secMsg = `Security: ${hostState.actualSec}/${hostState.minSec}`;
    const monMsg = `Money: ${logA.formatMoney(hostState.availMoney)}/${logA.formatMoney(hostState.maxMoney)}`;
    logA.debug(`WORM ${hostname} - ${secMsg} - ${monMsg}`);
}


class WormAdapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    exec(filePath: string, targetName: string, threadsQty: number) {
        this.ns.exec(filePath, targetName, threadsQty, targetName, threadsQty, 0, 0, 0, false);
    }
    
    getHackTime(hostname: string): number {
        return this.ns.getHackTime(hostname);
    }
    
    getWeakenTime(hostname: string): number {
        return this.ns.getWeakenTime(hostname);
    }
    
    getGrowTime(hostname: string): number {
        return this.ns.getGrowTime(hostname);
    }
    
    getServerMoneyAvailable(targetName: string): number {
        return this.ns.getServerMoneyAvailable(targetName);
    }
    
    getServerSecurityLevel(hostname: string): number {
        return this.ns.getServerSecurityLevel(hostname);
    }
    
    async sleep(duration: number): Promise<void> {
        await this.ns.sleep(duration);
        
    }
}