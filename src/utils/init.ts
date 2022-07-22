import {Log} from '/pkg.helpers';
import {Network} from '/services/network';
import {ServiceName} from '/services/service';
import {Player} from '/services/player';
import {Deployer} from '/services/deployer';
import {ProcessMngr} from '/services/processmngr';
import {INs} from '/utils/interfaces';

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
    constructor(private readonly ns: INs, private readonly log: Log) {}
    
    async startAllServices(): Promise<void> {
        this.ns.exec('/utils/monitor-overview-daemon.js', 'home');
        await this.ns.sleep(500);
        await this.getService<Player>(ServiceName.Player);
        await this.getService<Network>(ServiceName.Network);
        await this.getService<Deployer>(ServiceName.Deployer);
        await this.getService<ProcessMngr>(ServiceName.ProcessMngr);
    }
    
    retrieveService<ResultType>(serviceName: ServiceName): ResultType {
        const portHandle = this.ns.getPortHandle(serviceName);
        return portHandle.empty() ? null : portHandle.peek();
    }
    
    async getService<ResultType>(serviceName: ServiceName): Promise<ResultType> {
        let obj = this.retrieveService<ResultType>(serviceName);
        if (!obj) {
            this.ns.exec(`/services/${ServiceName[serviceName].toLowerCase()}-service.js`, 'home');
            do {
                await this.ns.sleep(500);
                obj = this.retrieveService<ResultType>(serviceName);
            } while (!obj)
        }
        return obj;
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