import {INs, IServer, loadInitFile, Log} from '/resources/helpers';

export async function main(ns: INs) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    const log = new Log(ns);
    const warmup = new ShivaWarmup(ns, log, loadInitFile(ns, ns.args[0], ns.args[1]));
    
    warmup.logSteps('START');
    
    while (warmup.actualSec() !== warmup.target.minSec || warmup.availMoney() !== warmup.target.maxMoney) {
        
        warmup.printHostState();

        if (warmup.actualSec() > warmup.target.minSec) {
            warmup.computeNextWeakenStepParam();
            await warmup.weakenAndWait();
            
        } else if (warmup.availMoney() < warmup.target.maxMoney) {
            warmup.computeNextGrowStepParam();
            await warmup.growAndWait();
        }
    }
    warmup.printHostState();
    
    warmup.logSteps('STOP');
    
    warmup.launchDaemon();
}

class ShivaWarmup {
    private readonly ns: INs;
    private readonly log: Log;
    
    // Static
    private readonly package: string;
    private readonly runner: string;
    private readonly wFile: string;
    private readonly gFile: string;
    readonly target: IServer;
    
    // Computed
    private wThrdQty: number;
    private gThrdQty: number;
    
    constructor(ns: INs, log: Log, staticValues: any) {
        this.ns = ns;
        this.log = log;
        this.package = staticValues.packageName;
        this.runner = staticValues.runner;
        this.target = staticValues.target;
        this.wFile = staticValues.wFile;
        this.gFile = staticValues.gFile;
        //this.wThrdQty = staticValues.wThrdQty;
        //this.gThrdQty = staticValues.gThrdQty;
    }
    
    actualSec(): number {
        return this.ns.getServerSecurityLevel(this.target.hostname);
    }
    
    availMoney(): number {
        return this.ns.getServerMoneyAvailable(this.target.hostname);
    }
    
    async weakenAndWait(): Promise<void> {
        const wDuration = this.log.formatDuration(this.ns.getWeakenTime(this.target.hostname));
        this.log.info(`SHIVA_WARMUP ${this.target.hostname} - WEAKEN starts: ${this.wThrdQty}x; ${wDuration} duration`);
        this.ns.exec(this.wFile, this.runner, this.wThrdQty, this.target.hostname, this.wThrdQty, 0, 0, 0, false,
            'SHIVA_WARMUP');
        await this.ns.sleep(this.ns.getWeakenTime(this.target.hostname) + 200);
    }
    
    async growAndWait(): Promise<void> {
        const gDuration = this.log.formatDuration(this.ns.getGrowTime(this.target.hostname));
        this.log.info(`SHIVA_WARMUP ${this.target.hostname} - GROW starts: ${this.gThrdQty}x; ${gDuration} duration`);
        this.ns.exec(this.gFile, this.runner, this.gThrdQty, this.target.hostname, this.gThrdQty, 0, 0, 0, false,
            'SHIVA_WARMUP');
        await this.ns.sleep(this.ns.getGrowTime(this.target.hostname) + 200);
    }
    
    computeNextGrowStepParam(): void {
        const growthRatio = Math.ceil(this.target.maxMoney / this.ns.getServerMoneyAvailable(this.target.hostname));
        this.gThrdQty = Math.ceil(this.ns.growthAnalyze(this.target.hostname, growthRatio));
    }
    
    computeNextWeakenStepParam(): void {
        const deltaSec = this.ns.getServerSecurityLevel(this.target.hostname) - this.target.minSec;
        this.wThrdQty = Math.ceil(deltaSec / this.ns.weakenAnalyze(1));
    }
    
    printHostState(): void {
        const secMsg = `Security: ${this.log.formatNumber(this.actualSec())}/ ${this.target.minSec}`;
        const monMsg = `Money: ${this.log.formatMoney(this.availMoney())} / ${this.log.formatMoney(
            this.target.maxMoney)}`;
        this.log.info(`SHIVA_WARMUP > STATUS ${this.target.hostname}: ${secMsg} - ${monMsg}\n`);
    }
    
    logSteps(border: string): void {
        this.log.info(`SHIVA_WARMUP ${this.target.hostname} - ${border} -----------------\n`);
    }
    
    launchDaemon(): void {
        const daemonFile = `/${this.package}/${this.package}-daemon.js`;
        ShivaWarmup.closeTail(this.package);
        this.ns.spawn(daemonFile, 1, this.runner, this.target.hostname);
    }
    
    private static closeTail(packageName: string): void {
        const doc = eval('document');
        let xpath = `//h6[starts-with(text(),'/${packageName}/')]/parent::*//button[text()='Close']`;
        const obj = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        if (obj !== null)
            obj.click();
    }
}


