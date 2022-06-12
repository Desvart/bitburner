import {INs, Log} from '/resources/helpers';
import {Install} from '/resources/install';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new InstallKittyHack(ns, new Log(ns));
    
    await install.downloadPackage();
    await install.downloadPackage(install.hostname, 'malwares');
    await install.precomputeStaticValues();
    install.launchDaemon();
}

class InstallKittyHack extends Install {
    constructor(ns: INs, log: Log) {
        super(ns, log);
    }
    
    async precomputeStaticValues(hostname: string = this.hostname): Promise<void> {
        const [GROW_FILE, HACK_FILE, HACK_FILE2, WEAKEN_FILE] = this.identifyMalwaresToDownload();

        const freeRam = this.ns.getServerMaxRam(hostname) - this.ns.getScriptRam(`/${this.packageName}/${this.packageName}-daemon.js`, hostname);
        const hackRam = this.ns.getScriptRam(HACK_FILE, hostname);
        const weakenRam = this.ns.getScriptRam(WEAKEN_FILE, hostname);
        const growRam = this.ns.getScriptRam(GROW_FILE, hostname);
        
        const hackThreadQty = Math.floor(freeRam / hackRam);
        const weakenThreadQty = Math.floor(freeRam / weakenRam);
        const growThreadQty = Math.floor(freeRam / growRam);
        
        const staticValues = {
            packageName: this.packageName,
            hostname: hostname,
            hackThreadQty: hackThreadQty,
            weakenThreadQty: weakenThreadQty,
            growThreadQty: growThreadQty,
            minSec: this.ns.getServerMinSecurityLevel(hostname),
            maxMoney: this.ns.getServerMaxMoney(hostname),
            HACK_FILE: HACK_FILE2,
            WEAKEN_FILE: WEAKEN_FILE,
            GROW_FILE: GROW_FILE,
        };
        const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
        await this.ns.write(initFile, JSON.stringify(staticValues), 'w');
        
        if (hostname !== this.hostname) {
            await this.ns.scp(initFile, hostname);
        }
    }
}