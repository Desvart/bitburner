import {INs, Log} from '/pkg.helpers';
import {getService, ServiceName} from '/services/service';
import {Deployer, Job} from '/services/deployer';
import {Network} from '/services/network';

const CONFIG: {
    CYCLE_TIME: number,
} = {
    CYCLE_TIME: 2000, //60 * 1000, //ms
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const log = new Log(ns);
    const jarvis = new Jarvis(ns, log);
    
    if (ns.args[0] === 'reset') {
        await jarvis.startServices();
        jarvis.killAllScript();
        jarvis.removePreviousFiles();
    }
    
    await jarvis.startServices();
    
    while (!jarvis.areAllDaemonsRunning()) {
    
        jarvis.nukeServers();
    
        if (!jarvis.isDaemonRunning('hacknet')) {
            await jarvis.startDaemon('hacknet');
        }
    
        if (!jarvis.isDaemonRunning('shiva')) {
            await jarvis.startDaemon('shiva');
        }
    
        if (!jarvis.isDaemonRunning('sherlock')) {
            await jarvis.startDaemon('sherlock');
        }
    
        if (jarvis.isDaemonRunning('wolfstreet')) {
            await jarvis.startDaemon('wolfstreet');
        }
        
        await jarvis.waitNCycles();
    }
}

class Jarvis {
    
    network: Network;
    private deployer: Deployer;
    
    constructor(private readonly ns: INs, private readonly log: Log) { }
    
    public async startServices(): Promise<void> {
        this.ns.exec('/resources/serviceStatus-daemon.js', 'home');
        this.ns.exec('/resources/player-service.js', 'home');
        await this.ns.sleep(500);
        this.ns.exec('/resources/network-service.js', 'home');
        await this.ns.sleep(500);
        this.ns.exec('/resources/deployer-service.js', 'home');
        await this.ns.sleep(500);
        
        this.deployer = getService(this.ns, ServiceName.Deployer);
        this.network = getService(this.ns, ServiceName.Network);
    }
    
    nukeServers(): void {
        this.network.servers.filter(n => n.canBeNuked()).forEach(n => n.nuke());
    }
    
    isDaemonRunning(daemonName: string): boolean {
        let allProcessesName: string[] = [];
        for (const server of this.network.servers) {
            allProcessesName.push(...this.ns.ps(server.hostname).map(p => p.filename));
        }
        return allProcessesName.filter(fileName => fileName.includes(daemonName + '-daemon')).length > 0;
    }
    
    areAllDaemonsRunning(): boolean {
        const daemonList = ['hacknet', 'shiva', 'sherlock', 'wolfstreet'];
        return !daemonList.some(d => !this.isDaemonRunning(d));
    }
    
    async startDaemon(daemonName: string): Promise<Job> {
    
        const files: string[] = this.ns.ls('home', daemonName);
        let setupScript: string = '';
        let setupRam: number = 0;
        if (files.includes('-setup')) {
            setupScript = `/${daemonName}/${daemonName}-setup.js`;
            setupRam = this.ns.getScriptRam(setupScript, 'home');
        }
        let daemonScript = `/${daemonName}/${daemonName}-daemon.js`;
        let daemonRam = this.ns.getScriptRam(daemonScript, 'home');
        let startingScript = setupScript || daemonScript;
        
        const daemonJob = {
            script: startingScript,
            dependencies: files.filter(f => f !== startingScript),
            scriptRam: Math.max(setupRam, daemonRam)
        }
        
        return await this.deployer.deploy(daemonJob);
    }
    
    async waitNCycles(mult: number = 1): Promise<void> {
        await this.ns.sleep(CONFIG.CYCLE_TIME * mult);
    }
    
    killAllScript() {
        for (const server of this.network.servers) {
            
            if (server.hostname === 'home')
                continue;
            
            this.ns.killall(server.hostname);
        }
    }
    
    removePreviousFiles(): void {
        for (const server of this.network.servers) {
            
            if (server.hostname === 'home')
                continue;
            
            const files: string[] = this.ns.ls(server.hostname);
            if (files.length > 0)
                this.log.info(
                    `${server.hostname.toUpperCase()} - ${files.length} files detected:\n${files.join(', ')}`);
            
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