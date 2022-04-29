export function timeConverter(timestamp: number): string {
    const date = new Date(timestamp);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
}

export function nowStr(): string {
    return timeConverter(Date.now());
}

export class Log {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    info(msg: string): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} INFO - ${msg}`);
        const style = 'color: #42B5FF; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
    }
    
    success(msg: string, duration: number = 5000): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} SUCCESS - ${msg}`);
        const style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        this.ns.toast(`${msg}`, 'success', duration);
    }
    
    debug(msg: string, toggle: boolean = true): void {
        if (toggle === true) {
            const timestamp = nowStr();
            const style = 'color: #FFFFFF; font-size: 12px; padding: 5px;';
            console.debug(`${timestamp} %c${msg}`, style);
        }
    }
    
    warn(msg: string, toastSwitch: boolean = false): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} WARNING - ${msg}`);
        console.warn(`${timestamp} ${msg}`);
        if (toastSwitch)
            this.ns.toast(`${msg}`, 'warning', null);
    }
    
    error(msg: string): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} ERROR - ${msg}`);
        console.error(`${timestamp} ${msg}`);
        throw(`${timestamp} ${msg}`);
    }
    
    formatMoney(num) {
        return this.ns.nFormat(num, '0.00 a$');
    }
    
    formatDuration(num) {
        let sec = Math.trunc(num / 1000) % 60;
        let min = Math.trunc((num - sec) / 60) % 60;
        let hour = Math.trunc((num - (min * 60) - sec) / (60 * 2));
        return hour.toString() + ':' + min.toString() + ':' + sec.toString();
    }
}

export interface INs {
    args: any[];
    
    print(msg: string): void;
    toast(msg: string, status: string, duration: number): void;

    sleep(duration: number): void;
    
    scp(files: string|string[], targetName: string): Promise<boolean>;
    scp(files: string|string[], sourceName: string, targetName: string): Promise<boolean>;
    exec(script: string, hostname: string, numThread: number, args?: Array<string | number | boolean>): number;
    spawn(script: string, numThread: number, args?: Array<string|number|boolean>): void;
    ps(hostname: string): IProcess[];
    
    tail(): void;
    disableLog(logToDisable: string): void;
    clearLog(): void;
    
    getServerMoneyAvailable(hostname: string): number;
    
    getServer(hostname: string): INsServer;
    hasRootAccess(hostname: string): boolean;
    nuke(hostname: string): void;
    scan(hostname: string): string[];
    
    getHackingLevel(): number;
    
    ls(hostname: string, grep: string): string[];
    fileExists(file: string, hostname: string): boolean;
    getScriptName(): string;
    getHostname(): string;
    
    brutessh(hostname: string): void;
    ftpcrack(hostname: string): void;
    relaysmtp(hostname: string): void;
    httpworm(hostname: string): void;
    sqlinject(hostname: string): void;
    
    hacknet: {
        maxNumNodes(): number;
        numNodes(): number;
        getPurchaseNodeCost(): number;
        purchaseNode(): number;
        getNodeStats(nodeId: number): NodeStats;
        getLevelUpgradeCost(nodeId: number, upgradeQty: number): number;
        getRamUpgradeCost(nodeId: number, upgradeQty: number): number;
        getCoreUpgradeCost(nodeId: number, upgradeQty: number): number;
        upgradeLevel(nodeId: number, upgradeQty: number): void;
        upgradeRam(nodeId: number, upgradeQty: number): void;
        upgradeCore(nodeId: number, upgradeQty: number): void;
    }
}

export interface INsServer {
    backdoorInstalled: boolean;
    baseDifficulty: number;
    cpuCores: number;
    ftpPortOpen: boolean;
    hackDifficulty: number;
    hasAdminRights: boolean;
    hostname: string;
    httpPortOpen: boolean;
    ip: string;
    isConnectedTo: boolean;
    maxRam: number;
    minDifficulty: number;
    moneyAvailable: number;
    moneyMax: number;
    numOpenPortsRequired: number;
    openPortCount: number;
    organizationName: string;
    purchasedByPlayer: boolean;
    ramUsed: number;
    requiredHackingSkill: number;
    serverGrowth: number;
    smtpPortOpen: boolean;
    sqlPortOpen: boolean;
    sshPortOpen: boolean;
}

export interface IProcess {
    args: string[];
    filename: string;
    pid: number;
    threads: number;
}

export interface NodeStats {
    cache:	number;
    cores:	number;
    hashCapacity:	number;
    level:	number;
    name:	string;
    production:	number;
    ram:	number;
    ramUsed:	number;
    timeOnline:	number;
    totalProduction:	number;
}