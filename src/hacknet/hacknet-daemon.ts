import {Farm} from '/hacknet/farm.js';
import {HacknetAdapters} from '/hacknet/hacknet-adapters.js';
import {LogNsAdapter} from '/resources/helpers.js';
import {hacknetConfig as configTech} from '/hacknet/hacknet-config.js';
import {hacknetConfig} from '/hacknet/hacknet-config.js';
import {configGlobal} from '/resources/global-config.js';


export async function main(ns) {
    
    const flags = ns.flags([
        ['deploy', false],
        ['operate', false],
    ]);
    
    const daemon = new HacknetDaemon(ns, flags);
    await daemon.setup();
    await daemon.run();
    
}

export class HacknetDaemon {
    private readonly flags: {'deploy', 'operate'};
    private readonly nsA: HacknetAdapters;
    private readonly logA: LogNsAdapter;
    private readonly farm: Farm;
    
    constructor(ns: object, flags: {'deploy', 'operate'}) {
        this.nsA = new HacknetAdapters(ns);
        this.logA = new LogNsAdapter(ns);
        this.farm = new Farm(this.nsA, this.logA);
        this.flags = flags;
        
    }
    
    async setup(): Promise<void> {
        if (this.flags.deploy === true) {
            this.kill();
            this.setupInfra();
            await this.deploy();
            this.activate();
        }
    }
    
    async run(): Promise<void> {
        if (this.flags.operate === true) {
            await this.farm.operate();
        }
    }
    
    private kill(): void {
        this.nsA.kill(configTech.DAEMON_FILE, hacknetConfig.LOCATION, '--operate');
    }
    
    private setupInfra(): void {
        this.nsA.nuke(hacknetConfig.LOCATION);
    }
    
    private async deploy() {
        if (hacknetConfig.LOCATION !== 'home') {
            const filesList = [configGlobal.CONFIG_FILE,
                configTech.CONFIG_FILE,
                configTech.DAEMON_FILE,
                configTech.MANAGER_FILE,
                configTech.FARM_FILE,
                configTech.NODE_FILE,
                configTech.COMPONENT_FILE,
                configGlobal.HELPER_FILE
            ];
            await this.nsA.scp(filesList, hacknetConfig.LOCATION);
        }
    }
    
    private activate(): void {
        if (this.nsA.scriptRunning(configTech.DAEMON_FILE, hacknetConfig.LOCATION) === false) {
            this.nsA.exec(configTech.DAEMON_FILE, hacknetConfig.LOCATION, 1, '--operate');
            this.logA.info('JARVIS_DAEMON - Hacknet HacknetDaemon activated with success.');
        } else {
            const msg = `JARVIS_DAEMON - Hacknet Daemon couldn't be activated: the process is already alive.`;
            this.logA.warn(msg);
        }
    }
    
}