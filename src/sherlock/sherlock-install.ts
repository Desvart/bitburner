import {INs, Log} from '/resources/helpers';
import {Install} from '/resources/install';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new InstallSherlock(ns, new Log(ns));
    await install.downloadPackage();
    await install.precomputeStaticValues();
    install.launchDaemon();
}

class InstallSherlock extends Install {
    constructor(ns: INs, log: Log) {
        super(ns, log);
    }
    
    async precomputeStaticValues(hostname: string = this.hostname): Promise<void> {
        
        const staticValues = {
            packageName: this.packageName,
            hostname: hostname,
            network: this.mapNetwork(),
        };
        const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
        await this.ns.write(initFile, JSON.stringify(staticValues), 'w');
        
        if (hostname !== this.hostname) {
            await this.ns.scp(initFile, hostname);
        }
    }
    
    mapNetwork(): string[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection= 999;
    
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
}