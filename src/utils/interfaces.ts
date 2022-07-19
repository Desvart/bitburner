import {Server} from '/services/network';

export type timestamp = number;

export interface INetwork extends Array<IServer> {
    isFullyNuked: boolean;
    getSmallestServers(threadsNeeded: number, ramPerScriptNeeded: number): IServer;
    map(mapper: Function): Array<any>;
}

export interface IServer {
    readonly id: string;
    readonly level: number;
    readonly cores: number;
    readonly requiredPorts: number;
    readonly purchased: boolean;
    readonly isHome: boolean;
    ram: IRam;
    security: ISecurity;
    money: IMoney;
    canBeNuked: boolean;
    isRoot: boolean;
    canExecScripts: boolean;
    nuke(): void;
    getThreadsCount(ramNeeded?: number): number;
}

export interface IRam {
    readonly max: number;
    free: number;
    used: number;
}

export interface ISecurity {
    readonly min: number;
    level: number;
}

export interface IMoney {
    readonly max: number;
    readonly growth: number;
    available: number;
}

export interface IBatchReq extends IBatchThreads {
    landing?: number;
    target: string;
}

export interface IBatchThreads {
    hk: number;
    wk1: number;
    gw: number;
    wk2: number;
}

export interface IBatch extends Array<IJob> {
    target: IServer;
    runner: IServer;
    execute(): void;
}

export interface IJob {
    pid: number;
    script: string;
    runnerHostname: string;
    threads: number;
    landingTime: timestamp;
    // args?: (string | number)[];
    ram: number;
    ns: INs;
    args?: string;
}

export interface IBaseServer {
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

export interface IBaseProcess {
    args: string[];
    filename: string;
    pid: number;
    threads: number;
}

export interface IBaseNodeStats {
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

export interface IBasicHGWOptions {
    stock?: boolean;
    threads?: number;
}

export interface ICodingAttemptOptions {
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

export interface IBasePlayer {
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

export interface INs {
    args: any[];
    
    print(msg: string): void;
    tprint(...args: any[]): void;
    toast(msg: string, status: string, duration: number): void;
    flags(schema: [string, string | number | boolean][]): any;
    nFormat(n: number, format: string): string;
    tFormat(milliseconds: number, milliPrecision?: boolean): string;
    
    sleep(millis: number): Promise<true>;
    asleep(millis: number): Promise<true>;
    scp(files: string | string[], targetName: string): Promise<boolean>;
    scp(files: string | string[], sourceName: string, targetName: string): Promise<boolean>;
    run(script: string, numThreads?: number, ...args: Array<string | number | boolean>): number;
    exec(script: string, host: string, numThreads?: number, ...args: Array<string | number | boolean>): number;
    spawn(script: string, numThreads?: number, ...args: string[]): void;
    atExit(f: () => void): void;
    
    ps(hostname: string): IBaseProcess[];
    kill(script: string, host: string, ...args: string[]): boolean;
    kill(pid: number): boolean;
    killall(host?: string, safetyguard?: boolean): boolean;
    exit(): void;
    
    tail(): void;
    disableLog(logToDisable: string): void;
    clearLog(): void;
    closeTail(pid?: number): void;
    
    write(file: string, data?: string[] | number | string, mode?: 'w' | 'a'): Promise<void>;
    read(file: string): any;
    rm(name: string, host?: string): boolean;
    getPortHandle(port: number): INetscriptPort;
    
    getPlayer(): IBasePlayer;
    
    hasRootAccess(hostname: string): boolean;
    nuke(hostname: string): void;
    
    scan(hostname: string): string[];
    
    getPurchasedServerLimit(): number;
    getPurchasedServers(): string[];
    getPurchasedServerCost(ram: number): number;
    purchaseServer(serverName: string, ram: number): string;
    
    getServer(hostname: string): IBaseServer;
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
    hackAnalyzeThreads(host: string, hackAmount: number): number;
    growthAnalyzeSecurity(threads: number, hostname?: string, cores?: number): number;
    hackAnalyzeChance(host: string): number;
    hack(host: string, opts?: IBasicHGWOptions): Promise<number>;
    weaken(host: string, opts?: IBasicHGWOptions): Promise<number>;
    grow(host: string, opts?: IBasicHGWOptions): Promise<number>;
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
        getNodeStats(nodeId: number): IBaseNodeStats;
        getLevelUpgradeCost(nodeId: number, upgradeQty: number): number;
        getRamUpgradeCost(nodeId: number, upgradeQty: number): number;
        getCoreUpgradeCost(nodeId: number, upgradeQty: number): number;
        upgradeLevel(nodeId: number, upgradeQty: number): void;
        upgradeRam(nodeId: number, upgradeQty: number): void;
        upgradeCore(nodeId: number, upgradeQty: number): void;
    };
    
    codingcontract: {
        attempt(
            answer: string[] | number, filename: string, host?: string, opts?: ICodingAttemptOptions): boolean | string;
        getContractType(filename: string, host?: string): string;
        getData(filename: string, host?: string): any;
    };
    
    formulas: {
        hacking: {
            weakenTime(server: IBaseServer, player: IBasePlayer): number;
        }
        hacknetNodes: {
            hacknetNodeCost(n: number, mult: number): number;
            levelUpgradeCost(startingLevel: number, extraLevels?: number, costMult?: number): number;
            ramUpgradeCost(startingRam: number, extraLevels?: number, costMult?: number): number;
            coreUpgradeCost(startingCore: number, extraCores?: number, costMult?: number): number;
        }
    };
}

