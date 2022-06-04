import {INs, IServer, Log} from '/resources/helpers';
import {Install} from '/resources/install';

const CONFIG: {
    SERVER_ROOT_NAME: string,
    HACK_RATIO: number,
    PAUSE_BETWEEN_BLOCKS: number,
} = {
    SERVER_ROOT_NAME: 'pServ-',
    HACK_RATIO: 20 / 100,
    PAUSE_BETWEEN_BLOCKS: 100, // ms
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const target: IServer = JSON.parse(ns.args[0]);
    const install = new InstallShiva(ns, new Log(ns), target);
    
    await install.downloadPackage();
    await install.downloadPackage(install.hostname, 'malwares');
    await install.precomputeStaticValues();
    install.launchDaemon(install.hostname, 1, 'warmup', target.hostname);
}

class InstallShiva extends Install {
    
    // Static
    private readonly target: IServer;
    
    // Compute
    private hFile: string;
    private wFile: string;
    private gFile: string;
    private wThrdQty: number;
    private gThrdQty: number;
    
    constructor(ns: INs, log: Log, target: IServer) {
        super(ns, log);
        this.target = target;
    }
    
    async precomputeStaticValues(hostname: string = this.hostname): Promise<void> {
        [this.gFile, this.hFile, this.wFile] = this.identifyMalwaresToDownload();
        this.computeWarmupThreadQty();
        
        const staticValues = {
            packageName: this.packageName,
            runner: hostname,
            target: this.target,
            hFile: this.hFile,
            wFile: this.wFile,
            gFile: this.gFile,
            sFile: `/${this.packageName}/${this.packageName}-stat.js`,
            minSec: this.ns.getServerMinSecurityLevel(this.target.hostname),
            maxMoney: this.ns.getServerMaxMoney(this.target.hostname),
            hackRatio: CONFIG.HACK_RATIO,
            pauseBtwBlocks: CONFIG.PAUSE_BETWEEN_BLOCKS,
            wThrdQty: this.wThrdQty,
            gThrdQty: this.gThrdQty,
        };
        const initFile = `/${this.packageName}/${this.packageName}-init-${this.target.hostname}.txt`;
        await this.ns.write(initFile, JSON.stringify(staticValues), 'w');
        
        if (hostname !== this.hostname) {
            await this.ns.scp(initFile, hostname);
        }
    }
    
    computeWarmupThreadQty(): void {
        const daemonRam = this.ns.getScriptRam(`/${this.packageName}/${this.packageName}-daemon.js`, 'home');
        const freeRam = this.ns.getServerMaxRam(this.hostname) - daemonRam;
        const weakenRam = this.ns.getScriptRam(this.wFile, 'home');
        const growRam = this.ns.getScriptRam(this.gFile, 'home');

        this.wThrdQty = Math.floor(freeRam / weakenRam);
        this.gThrdQty = Math.floor(freeRam / growRam);
    }
}