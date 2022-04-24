import {LogNsAdapter} from '/resources/helpers';
import {SHIVA_CONFIG} from '/shiva2/shiva-config';

export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    
    let targetName = ns.args[0];
    let runnerName = ns.args[1];
    
    const nsA = new C2Adapter(ns);
    const logA = new LogNsAdapter(ns);
    
    let freeServerAvail = nsA.getPurchasedServerLimit() - nsA.getPurchasedServers().length;
    while (freeServerAvail > 0) {
        const c2 = new C2(nsA, logA);
    
        targetName = c2.findNextBestTarget(targetName);
        if (targetName.length !== 0) {
            logA.debug(`HYDRA_DAEMON - Potential target: ${targetName}.`);
            if (runnerName === undefined) {
                runnerName = c2.setupRunnerInfra(targetName);
            }
            await c2.uploadShivaInstallOnRunner(runnerName);
            c2.executeShivaInstall(runnerName, targetName);
        } else {
            logA.warn(`HYDRA_DAEMON - No potential target at the moment.`);
        }
        
        freeServerAvail = nsA.getPurchasedServerLimit() - nsA.getPurchasedServers().length;
        await ns.sleep(2000);
    }
}

class C2 {
    private readonly nsA;
    private readonly logA;
    private readonly STATIC_PROP;
    
    constructor(nsA: C2Adapter, logA: LogNsAdapter) {
        this.nsA = nsA;
        this.logA = logA;
    }
    
    findNextBestTarget(targetName: string = null): string {
        if (targetName === null) {
            const availableTargets: Node[] = this.getTargets();
            if (availableTargets.length !== 0) {
                targetName = this.identifyMostProfitableTarget(availableTargets);
            } else {
                targetName = '';
            }
        }
        return targetName;
    }
    
    setupRunnerInfra(targetName: string): string {
        const existingRunnerName = this.getServersHacking(targetName)[0];
        const newRunnerName = this.identifyNewRunner(existingRunnerName);
        const newRunnerRam = this.determineRunnerRam(targetName);
        this.upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName);
        return newRunnerName;
    }
    
    async uploadShivaInstallOnRunner(runnerName) {
        if (runnerName !== 'home') {
            await this.nsA.scp(SHIVA_CONFIG.INSTALL_PACKAGE, runnerName);
            this.logA.info(`Hydra malwares deployed on ${runnerName}`);
        }
    }
    
    executeShivaInstall(runnerName, targetName) {
        this.nsA.exec(SHIVA_CONFIG.INSTALL_PACKAGE[0], runnerName, targetName, runnerName);
        this.logA.info(`HYDRA_DAEMON - Shiva-daemon activated on ${runnerName} and targeting ${targetName}.`);
    }
    
    private getTargets(): Node[] {
        return this.getNetwork().filter(n =>
            !this.getLockedTargets().includes(n.hostname) &&
            n.isPotentialTarget &&
            n.hasAdminRights &&
            n.hackChance === 1,
        );
    }
    
    private getNetwork(): Node[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection = 999;
        let network: Node[] = [];
        
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
            network.push(this.nsA.getNode(nodeName));
        }
        return network;
    }
    
    private getLockedTargets(): string[] {
        let lockedTargets: string[] = [];
        for (const server of this.nsA.getPurchasedServers()) {
            const processes: Process[] = this.nsA.ps(server);
            for (const process of processes)
                if (process.filename === SHIVA_CONFIG.RUN_PACKAGE[0])
                    lockedTargets.push(process.args[0]);
        }
        return lockedTargets;
    }
    
    private identifyMostProfitableTarget(availableTargets: Node[]): string {
        
        let ratedTargets = this.rateTargets(availableTargets);
        const mostProfitableTarget: Node = ratedTargets.sort((prev, curr) => -prev.rate + curr.rate)[0];
        return mostProfitableTarget.hostname;
    }
    
    // noinspection JSMethodCanBeStatic
    private rateTargets(targets: Node[]): Node[] {
        const growthFactorMax = targets.sort((prev, curr) => -prev.growthFactor + curr.growthFactor)[0].growthFactor;
        const minSecMax = targets.sort((prev, curr) => -prev.minSec + curr.minSec)[0].minSec;
        const maxMoneyMax = targets.sort((prev, curr) => -prev.maxMoney + curr.maxMoney)[0].maxMoney;
        
        for (const target of targets) {
            const minSecNorm = (1 - target.minSec / minSecMax) * 100;
            const growthFactorNorm = target.growthFactor / growthFactorMax * 10;
            // noinspection PointlessArithmeticExpressionJS
            const maxMoneyNorm = target.maxMoney / maxMoneyMax * 1;
            target.rate = minSecNorm + growthFactorNorm + maxMoneyNorm;
        }
        
        return targets;
    }
    
    private identifyNewRunner(existingRunnerName: string = ''): string {
        if (existingRunnerName.length === 0) {
            return SHIVA_CONFIG.SERVER_ROOT_NAME + this.serverCount();
        } else {
            return existingRunnerName;
        }
    }
    
    private determineRunnerRam(targetName: string): number {
        
        const hackThreads = Math.ceil(SHIVA_CONFIG.HACK_RATIO / this.nsA.hackAnalyze(targetName));
        const weaken1Threads = Math.ceil(this.nsA.hackAnalyzeSecurity(hackThreads) / this.nsA.weakenAnalyze(1));
        const growThreads = Math.ceil(this.nsA.growthAnalyze(targetName, 1 / (1 - SHIVA_CONFIG.HACK_RATIO))) + 1;
        const weaken2Threads = Math.ceil(this.nsA.growthAnalyzeSecurity(growThreads) / this.nsA.weakenAnalyze(1));
        
        const hackRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[1]);
        const weakenRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[2]);
        const growRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[3]);
        const minRamNeededFor1Block =
            hackRam * hackThreads +
            weakenRam * weaken1Threads +
            growRam * growThreads +
            weakenRam * weaken2Threads;
        
        const maxNumberOfParallelBlock = Math.ceil(
            this.nsA.getWeakenTime(targetName) / (2 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS));
        const minRamNeeded = minRamNeededFor1Block * maxNumberOfParallelBlock;
        
        for (let i = 0; i < 20; i++) {
            const ramSize = Math.pow(2, i);
            if (minRamNeeded < ramSize) {
                return ramSize;
            }
        }
    }
    
    private upgradeInfraWithNewRunner(newRunnerName: string, newRunnerRam: number, existingRunnerName: string): void {
        this.deleteServer(existingRunnerName);
        this.buyNewServer(newRunnerName, newRunnerRam);
    }
    
    private serversList(): string[] {
        return this.nsA.getPurchasedServers();
    }
    
    private serverCount(): number {
        return this.serversList.length;
    }
    
    private buyNewServer(serverName: string, ramSize: number): string | null {
        if (this.checkIfLimitReached(serverName) === false && this.checkIfEnoughMoney(serverName, ramSize) === true) {
            const purchasedResponse = this.nsA.purchaseServer(serverName, ramSize);
            return this.validatePurchase(purchasedResponse, serverName);
        } else {
            return null;
        }
    }
    
    private checkIfLimitReached(serverName: string): boolean {
        if (this.nsA.getPurchasedServers().length < this.nsA.getPurchasedServerLimit()) {
            return false;
        } else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                Max number of servers already bought.`);
            return true;
        }
    }
    
    private checkIfEnoughMoney(serverName: string, ramSize: number): boolean {
        const serverCost = this.nsA.getPurchasedServerCost(ramSize);
        const availableMoney = this.nsA.getMoneyAvailable();
        if (serverCost < availableMoney) {
            return true;
        } else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                    Not enough money ${availableMoney} / ${serverCost}.`);
            return false;
        }
    }
    
    private validatePurchase(purchasedResponse: string = '', serverName: string): string {
        if (purchasedResponse.length !== 0) {
            return purchasedResponse;
        } else {
            this.logA.error(`HYDRA_DAEMON - Cannot purchase new server ${serverName}. Unknown error.`);
        }
    }
    
    private deleteServer(serverName: string = ''): void {
        if (serverName.length !== 0) {
            
            this.nsA.killall(serverName);
            const resp = this.nsA.deleteServer(serverName);
            
            if (resp === true) {
                this.logA.info(`HYDRA_DAEMON - Successfully deleted server ${serverName}.`);
            } else {
                this.logA.error(`HYDRA_DAEMON - Cannot delete server ${serverName}. Unknown error.`);
            }
        }
    }
    
    private getServersHacking(targetName: string): string[] {
        let detectedServer = [];
        for (const server of this.serversList()) {
            const processList: Process[] = this.nsA.ps(server);
            for (const process of processList) {
                if (process.args.includes(targetName) === true) {
                    detectedServer.push(server);
                }
            }
        }
        return detectedServer;
    }
    
    // noinspection JSUnusedLocalSymbols
    private getNewServerCost(ramSize: number): number {
        return this.nsA.getPurchasedServerCost(ramSize);
    }
}

class C2Adapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    getPurchasedServers(): string[] {
        return this.ns.getPurchasedServers();
    }
    
    ps(hostname: string): Process[] {
        return this.ns.ps(hostname);
    }
    
    scan(hostname: string): string[] {
        return this.ns.scan(hostname);
    }
    
    async scp(files: string[], target: string): Promise<boolean> {
        return await this.ns.scp(files, 'home', target);
    }
    
    getNode(hostname: string): Node {
        const node = this.ns.getServer(hostname);
        return {
            hostname: node.hostname,
            purchasedByPlayer: node.purchasedByPlayer,
            ram: node.maxRam,
            isPotentialTarget: this.checkIfPotentialTarget(node),
            hasAdminRights: node.hasAdminRights,
            hackChance: this.hackChance(node.hostname),
            growthFactor: node.serverGrowth,
            minSec: node.minDifficulty,
            maxMoney: node.moneyMax,
            rate: 0,
        };
    }
    
    // noinspection JSMethodCanBeStatic
    private checkIfPotentialTarget(node): boolean {
        
        if (node.purchasedByPlayer === true)
            return false;
        
        for (let blackNode of SHIVA_CONFIG.BLACK_LIST)
            if (node.hostname === blackNode)
                return false;
        
        return true;
    }
    
    hackChance(hostname: string): number {
        return this.ns.hackAnalyzeChance(hostname);
    }
    
    hackAnalyze(hostname: string): number {
        return this.ns.hackAnalyze(hostname);
    }
    
    hackAnalyzeSecurity(hackThreadsCount: number): number {
        return this.ns.hackAnalyzeSecurity(hackThreadsCount);
    }
    
    growthAnalyze(hostname: string, growthAmount: number): number {
        return this.ns.growthAnalyze(hostname, growthAmount);
    }
    
    growthAnalyzeSecurity(growThreadsCount: number): number {
        return this.ns.growthAnalyzeSecurity(growThreadsCount);
    }
    
    weakenAnalyze(weakenThreadsCount: number): number {
        return this.ns.weakenAnalyze(weakenThreadsCount);
    }
    
    read(file: string): string {
        return this.ns.read(file);
    }
    
    getWeakenTime(hostname: number): number {
        return this.ns.getWeakenTime(hostname);
    }
    
    deleteServer(serverName: string): void {
        this.ns.deleteServer(serverName);
    }
    
    killall(serverName: string): void {
        this.ns.killall(serverName);
    }
    
    getMoneyAvailable(): number {
        return this.ns.getServerMoneyAvailable('home');
    }
    
    getScriptRam(file: string): number {
        return this.ns.getScriptRam(file, 'home');
    }
    
    exec(script: string, target: string, ...args: any[]): void {
        this.ns.exec(script, target, 1, ...args);
    }
    
    getPurchasedServerLimit(): number {
        return this.ns.getPurchasedServerLimit();
    }
    
    getPurchasedServerCost(ramSize: number): number {
        return this.ns.getPurchasedServerCost(ramSize);
    }
    
    purchaseServer(serverName: string, ramSize: number): string {
        return this.ns.purchaseServer(serverName, ramSize);
    }
}

interface Process {
    args: string[];
    filename: string;
    pid: number;
    threads: number;
}

interface Node {
    hostname: string,
    purchasedByPlayer: boolean,
    ram: number,
    isPotentialTarget: boolean,
    hasAdminRights: boolean,
    hackChance: number,
    growthFactor: number,
    minSec: number,
    maxMoney: number,
    rate: number,
}