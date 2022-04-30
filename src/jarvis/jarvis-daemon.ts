import {Log, INs} from '/resources/helpers';
import {Server} from '/jarvis/server';

const CONFIG: {
    CYCLE_TIME: number,
    HACKNET_HOST: string,
    KITTYHACK_HOSTS: string[],
    WORM_HOSTS: string[],
    SHERLOCK_HOST: string,
    C2_HOST: string,
    WOLFSTREET_HOST: string,
} = {
    CYCLE_TIME: 12000, //60 * 1000, //ms
    HACKNET_HOST: 'foodnstuff',
    KITTYHACK_HOSTS: ['foodnstuff'], // & 'n00dles' hidden inside kittyhack-install because of RAM limitation)
    WORM_HOSTS: ['nectar-net', 'sigma-cosmetics', 'harakiri-sushi'],
    SHERLOCK_HOST: 'hong-fang-tea',
    C2_HOST: 'joesguns',
    WOLFSTREET_HOST: '?',
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const jarvis = new Jarvis(ns, new Log(ns));
    
    jarvis.removePreviousFiles();
    jarvis.nukeWeakServers();
    
    if (!jarvis.isDaemonFullyDeployed('hacknet')) {
        await jarvis.releaseDaemon('hacknet', CONFIG.HACKNET_HOST);
    }
    
    if (!jarvis.isDaemonFullyDeployed('kittyhack')) {
        await jarvis.releaseDaemon('kittyhack', CONFIG.KITTYHACK_HOSTS);
    }
    
    while (!jarvis.areAllServersOfGivenSizeHacked(16)) {
        await jarvis.waitNCycles();
        if (jarvis.isThereAServersOfGivenSizeToHack(16)) {
            jarvis.nukeWeakServers();
            if (!jarvis.isDaemonFullyDeployed('worm')) {
                await jarvis.releaseDaemon('worm', CONFIG.WORM_HOSTS);
            }
        }
    }
    
    if (!jarvis.isDaemonFullyDeployed('sherlock')) {
        await jarvis.releaseDaemon('sherlock', CONFIG.SHERLOCK_HOST); //TODO split script in two less than 16 GB RAM
    }
    
    if (!jarvis.isDaemonFullyDeployed('c2')) {
        await jarvis.releaseDaemon('C2', CONFIG.C2_HOST);
    }
    
    while (!jarvis.areAllServersOfGivenSizeHacked(32)) {
        await jarvis.waitNCycles(5);
        if (jarvis.isThereAServersOfGivenSizeToHack(32)) {
            jarvis.nukeWeakServers();
            if (jarvis.isDaemonFullyDeployed('wolfstreet')) {
                await jarvis.releaseDaemon('wolfstreet', CONFIG.WOLFSTREET_HOST);
            }
        }
    }
    
    while (!jarvis.isNetworkFullyOwned()) {
        await jarvis.waitNCycles();
        jarvis.nukeWeakServers();
    }
    
}

class Jarvis {
    private readonly ns: INs;
    private readonly log: Log;
    private readonly network: Server[];
    
    constructor(ns: INs, log: Log) {
        this.ns = ns;
        this.log = log;
        this.network = this.retrieveNetwork();
    }
    
    private retrieveNetwork(): Server[] {
        let discoveredNodes: Server[] = [];
        let nodesToScan: string[] = ['home'];
        let loopProtection = 999;
        
        while (nodesToScan.length > 0 && loopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (!discoveredNodes.map(n => n.hostname).includes(connectedNodeName)) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(new Server(this.ns, this.log, nodeName));
        }
        return discoveredNodes;
    }
    
    nukeWeakServers(): void {
        this.network.filter(n => n.isNukable()).forEach(n => n.nuke());
    }
    
    isDaemonFullyDeployed(daemonName: string): boolean {
        let allProcessesName: string[] = [];
        for (const server of this.network) {
            allProcessesName.push(...this.ns.ps(server.hostname).map(p => p.filename));
        }
        return allProcessesName.filter(fileName => fileName.includes(daemonName + '-daemon')).length > 0;
    }
    
    async releaseDaemon(daemonName: string, hostnames: string | string[]): Promise<boolean> {
        const files = [`/${daemonName}/${daemonName}-install.js`, '/resources/helpers.js', '/resources/install.js'];
        if (typeof hostnames === 'string')
            hostnames = [hostnames];
        
        let globalStatus = true;
        for (const hostname of hostnames) {
            
            const scpStatus = await this.ns.scp(files, hostname);
            const execStatus = this.ns.exec(files[0], hostname, 1);
            
            if (scpStatus === true && execStatus > 0) {
                this.log.success(`JARVIS - ${daemonName} installer successfully uploaded on ${hostname}`);
                
            } else if (scpStatus === false || execStatus === 0) {
                this.log.warn(`JARVIS - Couldn't upload ${daemonName} installer on ${hostname}`);
                globalStatus = false;
                
            } else {
                globalStatus = false;
            }
        }
        return globalStatus;
    }
    
    async waitNCycles(mult: number = 1): Promise<void> {
        await this.ns.sleep(CONFIG.CYCLE_TIME * mult);
    }
    
    areAllServersOfGivenSizeHacked(size: number): boolean {
        return !this.network.filter(n => n.ram === size).some(n => !n.hasRootAccess());
    }
    
    isThereAServersOfGivenSizeToHack(size: number): boolean {
        return this.network.filter(n => n.ram === size).some(n => n.isNukable());
    }
    
    isNetworkFullyOwned(): boolean {
        return !this.network.filter(n => n.isPotentialTarget).some(n => !n.hasRootAccess());
    }
    
    removePreviousFiles(): void {
        
        for (const server of this.network) {
            
            if (server.hostname === 'home')
                continue;
            
            const files: string[] = this.ns.ls(server.hostname);
            if (files.length > 0)
                this.log.info(`${server.hostname.toUpperCase()} - ${files.length} files detected:\n${files.join(', ')}`);
    
            for (let file of files) {
        
                if (file.includes('.js') || file.includes('-init.txt')) {
                    if (this.ns.rm(file, server.hostname) === true) {
                        this.log.info(`SUCCESS - File ${file} deleted.`);
                    } else {
                        this.log.info(`ERROR - Couldn't delete file ${file}.`);
                    }
                }
            }
        }
    }
}