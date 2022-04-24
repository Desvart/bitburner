import {SHIVA_CONFIG} from '/shiva2/shiva-config';
import {LogNsAdapter} from '/resources/helpers';

export async function main(ns) {
    const target: string = ns.args[0];
    const runner: string = ns.args[1];
    
    const nsA = new ShivaInstallAdapter(ns);
    const logA = new LogNsAdapter(ns);
    
    const malwareStaticProperties: MalwareStaticProperty = gatherMalwareStaticProperty(nsA, runner, target);
    await saveStaticPropertiesToFile(nsA, malwareStaticProperties);
    
    killAnyPreviousMalware(nsA, malwareStaticProperties.targetName);
    await bringTargetToSpeed(nsA, logA, malwareStaticProperties);
    
    launchShivaDaemon(nsA, target, runner);
}

async function saveStaticPropertiesToFile(nsA: ShivaInstallAdapter, malwareStaticProperties: MalwareStaticProperty){
    await nsA.write(SHIVA_CONFIG.SETUP_PACKAGE[1], JSON.stringify(malwareStaticProperties));
}

function gatherMalwareStaticProperty(nsA: ShivaInstallAdapter, hostname: string, target: string): MalwareStaticProperty {
    return {
        runnerName: hostname,
        targetName: target,
        freeRam: nsA.getServerMaxRam(hostname) - nsA.getScriptRam(SHIVA_CONFIG.SETUP_PACKAGE[0], hostname),
        hackRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[1], hostname),
        weakenRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[2], hostname),
        growRam: nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[3], hostname),
        minSec: nsA.getServerMinSecurityLevel(target),
        maxMoney: nsA.getServerMaxMoney(target),
        purchasedServerLimit: nsA.getPurchasedServerLimit(),
        purchasedServerMaxRam: nsA.getPurchasedServerMaxRam(),
    };
}

function killAnyPreviousMalware(nsA: ShivaInstallAdapter, target: string) {
    const malwareNames = ['worm', 'kitty', 'hack', 'weaken', 'grow'];
    const processes: Process[] = nsA.ps(target);
    for (const process of processes) {
        if (malwareNames.some(m => process.filename.includes(m))) {
            nsA.kill(process.pid, target);
        }
    }
}

async function bringTargetToSpeed(nsA: ShivaInstallAdapter, logA: LogNsAdapter, prop: MalwareStaticProperty) {
    let actualSec = 100;
    let availMoney = 0;
    
    while (actualSec > prop.minSec || availMoney < prop.maxMoney) {
        actualSec = nsA.getServerSecurityLevel(prop.targetName);
        availMoney = nsA.getServerMoneyAvailable(prop.targetName);
        printHostState(logA, prop.targetName, actualSec, prop.minSec, availMoney, prop.maxMoney);
        
        if (actualSec > prop.minSec) {
            const threadQty = Math.floor(prop.freeRam / prop.weakenRam);
            nsA.exec(SHIVA_CONFIG.RUN_PACKAGE[2], prop.runnerName, prop.targetName, threadQty);
            await nsA.sleep(nsA.getWeakenTime(prop.targetName) + 100);
            
        } else if (availMoney < prop.maxMoney) {
            const threadQty = Math.floor(prop.freeRam / prop.growRam);
            nsA.exec(SHIVA_CONFIG.RUN_PACKAGE[3], prop.runnerName, prop.targetName, threadQty);
            await nsA.sleep(nsA.getGrowTime(prop.targetName) + 100);
        }
    }
    logA.debug(`SHIVA_INSTALL ${prop.targetName} - Target us up to speed:`);
    printHostState(logA, prop.targetName, actualSec, prop.minSec, availMoney, prop.maxMoney);
}

function printHostState(logA, hostname, actualSec, minSec, availMoney, maxMoney) {
    const secMsg = `Security: ${actualSec}/${minSec}`;
    const monMsg = `Money: ${logA.formatMoney(availMoney)}/${logA.formatMoney(maxMoney)}`;
    logA.debug(`SHIVA_INSTALL ${hostname} - ${secMsg} - ${monMsg}`);
}

function launchShivaDaemon(nsA: ShivaInstallAdapter, target: string, runner: string) {
    nsA.spawn(SHIVA_CONFIG.RUN_PACKAGE[0], target, runner);
}

class ShivaInstallAdapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    exec(filePath: string, runnerName: string, targetName: string, threadsQty: number) {
        this.ns.exec(filePath, runnerName, threadsQty, targetName, threadsQty, 0, 0, 0, false);
    }
    
    getWeakenTime(hostname: string): number {
        return this.ns.getWeakenTime(hostname);
    }
    
    getGrowTime(hostname: string): number {
        return this.ns.getGrowTime(hostname);
    }
    
    getServerMoneyAvailable(targetName: string): number {
        return this.ns.getServerMoneyAvailable(targetName);
    }
    
    getServerSecurityLevel(hostname: string): number {
        return this.ns.getServerSecurityLevel(hostname);
    }
    
    async sleep(duration: number): Promise<void> {
        await this.ns.sleep(duration);
    }
    
    async scp(files: string[], target: string): Promise<void> {
        this.ns.scp(files, 'home', target);
    }
    
    ps(target: string): Process[] {
        return this.ns.ps(target);
    }
    
    kill(pid: number, target: string): void {
        this.ns.kill(pid, target);
    }
    
    getScriptRam(file: string, hostname: string): number {
        return this.ns.getScriptRam(file, hostname);
    }
    
    getServerMaxRam(target: string): number {
        return this.ns.getServerMaxRam(target);
    }
    
    getServerMinSecurityLevel(target: string): number {
        return this.ns.getServerMinSecurityLevel(target);
    }
    
    getServerMaxMoney(target: string): number {
        return this.ns.getServerMaxMoney(target);
    }
    
    getHostname(): string {
        return this.ns.getHostname();
    }
    
    async write(file: string, content: string) {
        this.ns.write(file, content, 'w');
    }
    
    spawn(file: string, target: string, runner: string) {
        this.ns.spawn(file, 1, target, runner);
    }
    
    getPurchasedServerLimit(): number {
        return this.ns.getPurchasedServerLimit();
    }
    
    getPurchasedServerMaxRam(): number {
        return this.ns.getPurchasedServerMaxRam();
    }
}

interface Process {
    args: string[];
    filename: string;
    pid: number;
    threads: number;
}

interface MalwareStaticProperty {
    runnerName: string,
    targetName: string,
    freeRam: number,
    hackRam: number,
    weakenRam: number,
    growRam: number,
    minSec: number,
    maxMoney: number,
    purchasedServerLimit: number,
    purchasedServerMaxRam: number,
}