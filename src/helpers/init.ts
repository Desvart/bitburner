import {INs, Log} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Deployer} from '/resources/deployer';
import {Player} from '/resources/player';
import {Network} from '/resources/network';

const FLAGS: [string, boolean][] = [
    ['killall', false],
];

export async function main(ns: INs) {
    const flags = ns.flags(FLAGS);
    const init = new Init(ns, new Log(ns));
    
    if (flags.killall) {
        const hostnames = Network.retrieveHostnames(ns);
        init.removePreviousFiles(hostnames);
        init.globalKillAll(hostnames);
    }
    
    await init.startAllServices();
}

class Init {
    private deployer: Deployer;
    private player: Player;
    private network: Network;
    
    constructor(private readonly ns: INs, private readonly log: Log) {}
    
    async startAllServices(): Promise<void> {
        
        this.ns.exec('/resources/monitor-overview-daemon.js', 'home');
        await this.ns.asleep(500);
        
        this.ns.exec('/resources/player-service.js', 'home');
        await this.ns.asleep(500);
        
        this.ns.exec('/resources/network-service.js', 'home');
        await this.ns.asleep(500);
        
        this.ns.exec('/resources/deployer-service.js', 'home');
        await this.ns.asleep(500);
        
        this.deployer = getService<Deployer>(this.ns, ServiceName.Deployer);
        this.player = getService<Player>(this.ns, ServiceName.Player);
        this.network = getService<Network>(this.ns, ServiceName.Network);
    }
    
    globalKillAll(hostnames: string[]): void {
        hostnames.forEach(hostname => {
            this.ns.killall(hostname, true);
        });
    }
    
    removePreviousFiles(hostnames: string[]): void {
        hostnames.forEach(hostname => {
            if (hostname !== 'home') {
                const files: string[] = this.ns.ls(hostname);
                if (files.length > 0)
                    this.log.info(`${hostname.toUpperCase()} - ${files.length} files detected:\n${files.join(', ')}`);
                
                files.forEach(file => {
                    if (file.includes('.js') || file.includes('-init.txt')) {
                        if (this.ns.rm(file, hostname) === true)
                            this.log.info(`SUCCESS - File ${file} deleted.`);
                        else
                            this.log.info(`ERROR - Couldn't delete file ${file}.`);
                    }
                });
            }
        });
    }
}