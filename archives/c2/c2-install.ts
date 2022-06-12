import {INs, IServer, loadNetwork, Log} from '/resources/helpers';
import {Install} from '/resources/install';

export const CONFIG: {
    NETWORK_FILE: string,
    SERVER_ROOT_NAME: string,
    PAUSE_BETWEEN_BLOCKS: number,
    HACK_RATIO: number,
    C2_WAIT_LOOP: number,
} = {
    NETWORK_FILE: '/network.txt',
    SERVER_ROOT_NAME: 'pServ-',
    PAUSE_BETWEEN_BLOCKS: 200, // ms
    HACK_RATIO: 75 / 100,
    C2_WAIT_LOOP: 2 * 60 * 1000, //ms
};

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const install = new InstallC2(ns, new Log(ns));
    
    await install.downloadPackage();
    await install.downloadPackage(install.hostname, 'malwares');
    await install.precomputeStaticValues();
    install.launchDaemon();
}

class InstallC2 extends Install {
    constructor(ns: INs, log: Log) {
        super(ns, log);
    }
    
    async precomputeStaticValues(hostname: string = this.hostname): Promise<void> {
        const [gFile, hFile, wFile] = this.identifyMalwaresToDownload();
        
        const staticValues = {
            packageName: this.packageName,
            hostname: hostname,
            serverRootName: CONFIG.SERVER_ROOT_NAME,
            loopPause: CONFIG.C2_WAIT_LOOP,
            nFile: CONFIG.NETWORK_FILE,
            fullTargetList: this.getFullTargetList(),
            hackRatio: CONFIG.HACK_RATIO,
            pauseBtwBlocks: CONFIG.PAUSE_BETWEEN_BLOCKS,
            hRam: this.ns.getScriptRam(hFile, hostname),
            wRam: this.ns.getScriptRam(wFile, hostname),
            gRam: this.ns.getScriptRam(gFile, hostname),
            
        };
        const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
        await this.ns.write(initFile, JSON.stringify(staticValues), 'w');
        
        if (hostname !== this.hostname) {
            await this.ns.scp(initFile, hostname);
        }
    }
    
    private getFullTargetList(): IServer[] {
        const network: IServer[] = loadNetwork(this.ns, this.hostname);
        return InstallC2.rateTargets(network)
            .filter(n => n.maxMoney > 0 && !n.purchasedByPlayer && n.maxRam > 16 && n.requiredHackingSkill > 50)
            .sort((prev, curr) => -prev.rate + curr.rate);
    }
    
    private static rateTargets(targets: IServer[]): IServer[] {
        const growthFactorMax = targets.sort((prev, curr) => -prev.growthFactor + curr.growthFactor)[0].growthFactor;
        const minSecMax = targets.sort((prev, curr) => -prev.minSec + curr.minSec)[0].minSec;
        const maxMoneyMax = targets.sort((prev, curr) => -prev.maxMoney + curr.maxMoney)[0].maxMoney;
        
        for (const target of targets) {
            const minSecNorm = (1 - target.minSec / minSecMax) * 100;
            const growthFactorNorm = target.growthFactor / growthFactorMax * 10;
            const maxMoneyNorm = target.maxMoney / maxMoneyMax; // * 1
            target.rate = minSecNorm + growthFactorNorm + maxMoneyNorm;
        }
        
        return targets;
    }
}