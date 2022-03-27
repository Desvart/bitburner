import {Farm} from '/hacknetTS/model/farm.js';
import {NsAdapter} from '/hacknetTS/adapters/ns-adapter.js';
import {LogNsAdapter} from '/resources/helperTS.js';
import {config as configTech} from '/hacknetTS/config.js';
import {config} from '/hacknetTS/model/config.js';
import {configGlobal} from '/resources/global-config.js';


export async function main(ns) {
    
    const flags = ns.flags([
        ['deploy', false],
        ['operate', false],
    ]);
    
    const daemon = new Daemon(ns, flags);
    await daemon.setup();
    await daemon.run();
    
}

export class Daemon {
    private readonly flags: {'deploy', 'operate'};
    private readonly nsA: NsAdapter;
    private readonly logA: LogNsAdapter;
    private readonly farm: Farm;
    
    constructor(ns: object, flags: {'deploy', 'operate'}) {
        this.nsA = new NsAdapter(ns);
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
        this.nsA.kill(configTech.DAEMON_FILE, config.LOCATION, '--operate');
    }
    
    private setupInfra(): void {
        this.nsA.nuke(config.LOCATION);
    }
    
    private async deploy() {
        if (config.LOCATION !== 'home') {
            const filesList = [configGlobal.CONFIG_FILE,
                configTech.CONFIG_FILE,
                configTech.DAEMON_FILE,
                configTech.MANAGER_FILE,
                configTech.FARM_FILE,
                configTech.NODE_FILE,
                configTech.COMPONENT_FILE,
                configGlobal.HELPER_FILE
            ];
            await this.nsA.scp(filesList, config.LOCATION);
        }
    }
    
    private activate(): void {
        if (this.nsA.scriptRunning(configTech.DAEMON_FILE, config.LOCATION) === false) {
            this.nsA.exec(configTech.DAEMON_FILE, config.LOCATION, 1, '--operate');
            this.logA.info('JARVIS_DAEMON - Hacknet Daemon activated with success.');
        } else {
            const msg = `JARVIS_DAEMON - Hacknet Daemon couldn't be activated: the process is already alive.`;
            this.logA.warn(msg);
        }
    }
    
}