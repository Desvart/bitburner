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
    
    success(msg: string, duration: number | boolean = 5000): void {
        const timestamp = nowStr();
        this.ns.print(`${timestamp} SUCCESS - ${msg}`);
        const style = 'color: #00FF08; font-size: 12px; padding: 5px;';
        console.info(`${timestamp} %c${msg}`, style);
        if (typeof duration !== 'boolean')
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
    
    formatNumber(num: number): string {
        return this.ns.nFormat(num, '0.00 a');
    }
    
    formatMoney(num: number): string {
        return this.ns.nFormat(num, '0.00 a$');
    }
    
    formatDuration(num: number) {
        num = num / 1000;
        const sec = Math.trunc(num) % 60;
        const min = Math.trunc((num - sec) / 60) % 60;
        const hour = Math.trunc((num - (min * 60) - sec) / (60 * 2));
        return hour.toString() + ':' + min.toString() + ':' + sec.toString();
    }
    
    printHostState(malware, hostname, hostState): void {
        const secMsg = `Security: ${this.formatNumber(hostState.actualSec)}/${hostState.minSec}`;
        const monMsg = `Money: ${this.formatMoney(hostState.availMoney)}/${this.formatMoney(hostState.maxMoney)}`;
        this.info(`${malware} ${hostname} - ${secMsg} - ${monMsg}\n`);
    }
}

export function loadNetwork(ns: INs, hostname: string): IServer[] {
    const file: string = ns.ls(hostname, 'network')[0];
    return JSON.parse(ns.read(file));
}

export function loadInitFile(ns: INs, hostname: string, target: string = ''): any {
    if (target !== '')
        target = '-' + target;
    
    const file: string = ns.ls(hostname, `-init${target}.txt`)[0];
    return JSON.parse(ns.read(file));
}

export interface INs {
    args: any[];
    
    print(msg: string): void;
    toast(msg: string, status: string, duration: number): void;
    
    sleep(millis: number): Promise<true>;
    asleep(millis: number): Promise<true>;
    scp(files: string | string[], targetName: string): Promise<boolean>;
    scp(files: string | string[], sourceName: string, targetName: string): Promise<boolean>;
    run(script: string, numThreads?: number, ...args: Array<string | number | boolean>): number;
    exec(script: string, host: string, numThreads?: number, ...args: Array<string | number | boolean>): number;
    spawn(script: string, numThreads?: number, ...args: string[]): void;
    atExit(f: () => void): void;
    
    ps(hostname: string): IProcess[];
    killall(hostname: string): boolean;
    exit(): void;
    
    tail(): void;
    disableLog(logToDisable: string): void;
    clearLog(): void;
    closeTail(pid?: number): void;
    
    write(file: string, data?: string[] | number | string, mode?: 'w' | 'a'): Promise<void>;
    read(file: string): any;
    rm(name: string, host?: string): boolean;
    getPortHandle(port: number): INetscriptPort;
    
    getPlayer(): IPlayer;
    
    hasRootAccess(hostname: string): boolean;
    nuke(hostname: string): void;
    
    scan(hostname: string): string[];
    
    getPurchasedServerLimit(): number;
    getPurchasedServers(): string[];
    getPurchasedServerCost(ram: number): number;
    purchaseServer(serverName: string, ram: number): string;
    
    getServer(hostname: string): INsServer;
    getServerMoneyAvailable(hostname: string): number;
    getServerMinSecurityLevel(hostname: string): number;
    getServerSecurityLevel(hostname: string): number;
    getServerMaxMoney(hostname: string): number;
    getServerMoneyAvailable(hostname: string): number;
    getServerMaxRam(hostname: string): number;
    getServerUsedRam(hostname: string): number;
    
    hackAnalyze(host: string): number;
    weakenAnalyze(threads: number, cores?: number): number;
    growthAnalyze(host: string, growthAmount: number, cores?: number): number;
    hackAnalyzeSecurity(threads: number, hostname?: string): number;
    growthAnalyzeSecurity(threads: number, hostname?: string, cores?: number): number;
    hack(host: string, opts?: BasicHGWOptions): Promise<number>;
    weaken(host: string, opts?: BasicHGWOptions): Promise<number>;
    grow(host: string, opts?: BasicHGWOptions): Promise<number>;
    getHackTime(host: string): number;
    getWeakenTime(host: string): number;
    getGrowTime(host: string): number;
    getHackingLevel(): number;
    
    ls(hostname: string, grep?: string): string[];
    fileExists(file: string, hostname: string): boolean;
    getScriptName(): string;
    getScriptRam(file: string, hostname: string): number;
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
    };
    
    codingcontract: {
        attempt(
            answer: string[] | number, filename: string, host?: string, opts?: CodingAttemptOptions): boolean | string;
        getContractType(filename: string, host?: string): string;
        getData(filename: string, host?: string): any;
    };
    
    formulas: {
        hacking: {
            weakenTime(server: INsServer, player: IPlayer): number;
        }
    };
}

export interface INsServer {
    backdoorInstalled?: boolean;
    baseDifficulty: number;
    cpuCores: number;
    ftpPortOpen?: boolean;
    hackDifficulty?: number;
    hasAdminRights?: boolean;
    hostname: string;
    httpPortOpen?: boolean;
    ip?: string;
    isConnectedTo?: boolean;
    maxRam: number;
    minDifficulty: number;
    moneyAvailable?: number;
    moneyMax: number;
    numOpenPortsRequired: number;
    openPortCount?: number;
    organizationName?: string;
    purchasedByPlayer: boolean;
    ramUsed?: number;
    requiredHackingSkill: number;
    serverGrowth: number;
    smtpPortOpen?: boolean;
    sqlPortOpen?: boolean;
    sshPortOpen?: boolean;
}

export interface IServer {
    minSec: number;
    coresCount: number;
    hostname: string;
    maxRam: number;
    maxMoney: number;
    numOpenPortsRequired: number;
    purchasedByPlayer: boolean;
    requiredHackingSkill: number;
    growthFactor: number;
    rate?: number;
}

export interface IProcess {
    args: string[];
    filename: string;
    pid: number;
    threads: number;
}

export interface NodeStats {
    cache: number;
    cores: number;
    hashCapacity: number;
    level: number;
    name: string;
    production: number;
    ram: number;
    ramUsed: number;
    timeOnline: number;
    totalProduction: number;
}

export interface BasicHGWOptions {
    stock?: boolean;
    threads?: number;
}

export interface CodingAttemptOptions {
    returnReward: boolean;
}

export interface INetscriptPort {
    clear(): void;
    empty(): boolean;
    full(): boolean;
    peek(): string | number | any;
    read(): string | number;
    tryWrite(value: string | number): boolean;
    write(value: string | number): null | string | number;
}

export interface IPlayer {
    agility_exp_mult: number;
    agility_exp: number;
    agility_mult: number;
    agility: number;
    bitNodeN: number;
    bladeburner_analysis_mult: number;
    bladeburner_max_stamina_mult: number;
    bladeburner_stamina_gain_mult: number;
    bladeburner_success_chance_mult: number;
    charisma_exp_mult: number;
    charisma_exp: number;
    charisma_mult: number;
    charisma: number;
    city: string;
    className: string;
    company_rep_mult: number;
    companyName: string;
    createProgramName: string;
    createProgramReqLvl: number;
    crime_money_mult: number;
    crime_success_mult: number;
    crimeType: string;
    currentWorkFactionDescription: string;
    currentWorkFactionName: string;
    defense_exp_mult: number;
    defense_exp: number;
    defense_mult: number;
    defense: number;
    dexterity_exp_mult: number;
    dexterity_exp: number;
    dexterity_mult: number;
    dexterity: number;
    entropy: number;
    faction_rep_mult: number;
    factions: string[];
    hacking_chance_mult: number;
    hacking_exp_mult: number;
    hacking_exp: number;
    hacking_grow_mult: number;
    hacking_money_mult: number;
    hacking_mult: number;
    hacking_speed_mult: number;
    hacking: number;
    hacknet_node_core_cost_mult: number;
    hacknet_node_level_cost_mult: number;
    hacknet_node_money_mult: number;
    hacknet_node_purchase_cost_mult: number;
    hacknet_node_ram_cost_mult: number;
    has4SData: boolean;
    has4SDataTixApi: boolean;
    hasCorporation: boolean;
    hasTixApiAccess: boolean;
    hasWseAccount: boolean;
    hp: number;
    inBladeburner: boolean;
    intelligence: number;
    isWorking: boolean;
    jobs: any;
    location: string;
    max_hp: number;
    money: number;
    numPeopleKilled: number;
    playtimeSinceLastAug: number;
    playtimeSinceLastBitnode: number;
    strength_exp_mult: number;
    strength_exp: number;
    strength_mult: number;
    strength: number;
    tor: boolean;
    totalPlaytime: number;
    work_money_mult: number;
    workAgiExpGained: number;
    workAgiExpGainRate: number;
    workChaExpGained: number;
    workChaExpGainRate: number;
    workDefExpGained: number;
    workDefExpGainRate: number;
    workDexExpGained: number;
    workDexExpGainRate: number;
    workHackExpGained: number;
    workHackExpGainRate: number;
    workMoneyGained: number;
    workMoneyGainRate: number;
    workMoneyLossRate: number;
    workRepGained: number;
    workRepGainRate: number;
    workStrExpGained: number;
    workStrExpGainRate: number;
    workType: string;
}