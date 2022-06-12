import {INs, Log} from '/resources/helpers';
import {Install} from '/resources/install';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new InstallKittyHack(ns, new Log(ns));
    
    // Since n00dles RAM is not enough to execute the kittyhack-install script, then the install is done through foodnstuff
    const secondaryTarget: string = 'n00dles';
    await install.downloadPackage(secondaryTarget);
    await ns.scp('/resources/helpers.js', 'n00dles');
    await install.precomputeStaticValues(secondaryTarget);
    install.launchDaemon(secondaryTarget);
    
    await install.downloadPackage();
    await install.precomputeStaticValues(install.hostname, 4);
    install.launchDaemon(install.hostname, 4);
}

class InstallKittyHack extends Install {
    constructor(ns: INs, log: Log) {
        super(ns, log);
    }
    
    async precomputeStaticValues(hostname: string = this.hostname, numThreads: number = 1): Promise<void> {
        const staticValues = {
            packageName: this.packageName,
            hostname: hostname,
            minSec: this.ns.getServerMinSecurityLevel(hostname),
            maxMoney: this.ns.getServerMaxMoney(hostname),
            numThreads: numThreads,
        }
        const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
        await this.ns.write(initFile, JSON.stringify(staticValues), 'w');
        
        if (hostname !== this.hostname) {
            await this.ns.scp(initFile, hostname);
        }
    }
}