import {formatDuration, INs, Log} from '/helpers';
import {getService, ServiceName} from '/services/service';
import {Player} from '/services/player';

const HOME_RAM_BUFFER = 8; //GB
const DEFAULT_THREAD_RAM = 1.75; //GB

export interface INetwork extends Array<Server>{
    isFullyNuked: boolean;
    getSmallestServers(threadsNeeded: number, ramPerScriptNeeded: number): Server;
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

interface IRam {
    readonly max: number;
    free: number;
    used: number;
}

interface ISecurity {
    readonly min: number;
    level: number;
}

interface IMoney {
    readonly max: number;
    readonly growth: number;
    available: number;
}

export class Network extends Array<Server> implements INetwork {
    
    constructor(private readonly ns: INs) {
        super();
        this.buildServerNetwork2();
    }
    
    get isFullyNuked(): boolean {
        return !this.filter(server => server.ram.max > 0).some(server => !server.isRoot);
    }
    
    get hostnames(): string[] {
        return this.map(server => server.id);
    }
    
    getSmallestServers(threadsNeeded: number, ramPerScriptNeeded: number): Server {
        const sortedServers = this.filter(server => server.getThreadsCount(ramPerScriptNeeded) >= threadsNeeded).
            sort((curr, next) => curr.getThreadsCount(ramPerScriptNeeded) - next.getThreadsCount(ramPerScriptNeeded));
        return sortedServers[0];
    }
    
    static retrieveHostnames(ns: INs, currentNode: string = 'home', scannedNodes: Set<string> = new Set()): string[] {
        const nodesToScan = ns.scan(currentNode).filter(node => !scannedNodes.has(node));
        nodesToScan.forEach(node => {
            scannedNodes.add(node);
            Network.retrieveHostnames(ns, node, scannedNodes);
        });
        return Array.from(scannedNodes.keys());
    }
    
    retrieveHostnamesAndDepth(currentServer: string = 'home', scannedServers: Map<string, number> = new Map().set('home', 0)): Map<string, number> {
        const serversToScan = this.ns.scan(currentServer).filter(node => !scannedServers.has(node));
        for (let nodeName of serversToScan) {
            const depth: number = scannedServers.get(currentServer) + 1;
            scannedServers.set(nodeName, depth);
            this.retrieveHostnamesAndDepth(nodeName, scannedServers);
        }
        return scannedServers;
    }
    
    // private buildServerNetwork(): void {
    //     Network.retrieveHostnames(this.ns).forEach(id => this.push(new Server(this.ns, id)));
    //     // put 'home' server at the end of the list
    //     this.sort((a, b) => (a.isHome ? 1 : 0) - (b.isHome ? 1 : 0));
    // }
    
    private buildServerNetwork2(): void {
        this.retrieveHostnamesAndDepth().forEach((depth, id) => this.push(new Server(this.ns, id, depth)));
        // put 'home' server at the end of the list
        this.sort((a, b) => (a.isHome ? 1 : 0) - (b.isHome ? 1 : 0));
    }
    
    map(mapper: Function): any[] {
        let mappedNetwork = new Network(this.ns);
        for(let i = 0; i < this.length; i++)
            mappedNetwork[i] = mapper(this[i]);
        return mappedNetwork;
    }
    
    filter(filter: Function): Server[] {
        let filteredNetwork: Server[] = [];
        for(let i = 0; i < this.length; i++)
            if (filter(this[i]))
                filteredNetwork.push(this[i]);
        
        return filteredNetwork;
    }
    
    getNode(hostname: string): Server {
        return this.filter(serv => serv.id === hostname)[0];
    }
    
    getNuked(): Server[] {
        this.forEach(server => {
            if(server.canBeNuked)
                server.nuke();
        });
        return this.filter(server => server.isRoot);
    }
}

export class Server implements IServer {
    readonly level: number;
    readonly requiredPorts: number;
    readonly purchased: boolean;
    readonly isHome: boolean;
    readonly ram: Ram;
    readonly security: Security;
    readonly money: Money;
    readonly hk: Hack;
    readonly gw: Grow;
    readonly wk: Weaken;
    readonly growth: number;
    
    constructor(private readonly ns: INs, readonly id: string, readonly depth: number) {
        this.ram = new Ram(ns, id);
        this.security = new Security(ns, id);
        this.money = new Money(ns, id);
        this.level = ns.getServer(id).requiredHackingSkill;
        this.requiredPorts = ns.getServer(id).numOpenPortsRequired;
        this.purchased = ns.getServer(id).purchasedByPlayer;
        this.isHome = (id === 'home');
        this.hk = new Hack(ns, id);
        this.gw = new Grow(ns, id);
        this.wk = new Weaken(ns, id);
        this.growth = ns.getServer(id).serverGrowth;
    }
    
    get cores(): number {
        return this.ns.getServer(this.id).cpuCores;
    }
    
    get backdoor(): boolean {
    return this.ns.getServer(this.id).backdoorInstalled;
    }
    
    get isRoot(): boolean {
        return this.ns.getServer(this.id).hasAdminRights;
    }
    
    get canBeNuked(): boolean {
        const player = getService<Player>(this.ns, ServiceName.Player);
        return (!this.isRoot && player.hacking.level >= this.level && player.portsKeyCount >= this.requiredPorts);
    }
    
    get canExecScripts(): boolean {
        return (this.isRoot && this.ram.max > 0);
    }
    
    nuke() {
        if (this.canBeNuked) {
            this.openPorts();
            this.sudo();
        } else {
            new Log(this.ns).warn(`SERVER ${this.id} - Cannot perform nuke operation`, true);
        }
    }
    
    getThreadsCount(ramPerThread: number = DEFAULT_THREAD_RAM): number {
        if (!this.canExecScripts)
            return 0;
        else
            return Math.floor(this.ram.free / ramPerThread);
    }
    
    private openPorts(): void {
        const player = getService<Player>(this.ns, ServiceName.Player);
        
        if (player.software.ssh)
            this.ns.brutessh(this.id);
        
        if (player.software.ftp)
            this.ns.ftpcrack(this.id);
        
        if (player.software.smtp)
            this.ns.relaysmtp(this.id);
        
        if (player.software.http)
            this.ns.httpworm(this.id);
        
        if (player.software.sql)
            this.ns.sqlinject(this.id);
    }
    
    private sudo(): void {
        this.ns.nuke(this.id);
        const log: Log = new Log(this.ns);
        if (this.isRoot)
            log.success(`SERVER ${this.id} - Nuke operation successful`);
        else
            log.warn(`SERVER ${this.id} - Nuke operation failed`, true);
    }
}

class Ram implements IRam {
    readonly max: number;
    
    constructor(private readonly ns: INs, private readonly serverId: string) {
        this.max = ns.getServer(serverId).maxRam;
    }
    
    get used(): number {
        return this.ns.getServer(this.serverId).ramUsed;
    }
    
    get free(): number {
        return this.max - this.used - (this.serverId === 'home' ? HOME_RAM_BUFFER : 0);
    }
}

class Security implements ISecurity {
    readonly min: number;
    
    constructor(private readonly ns: INs, private readonly serverId: string) {
        this.min = ns.getServer(serverId).minDifficulty;
    }
    
    get level(): number {
        return this.ns.getServer(this.serverId).hackDifficulty;
    }
}

class Money implements IMoney {
    readonly max: number;
    readonly growth: number;
    
    constructor(private readonly ns: INs, private readonly serverId: string) {
        this.max = ns.getServer(serverId).moneyMax;
        this.growth = ns.getServer(serverId).serverGrowth;
    }
    
    get available(): number {
        return this.ns.getServer(this.serverId).moneyAvailable;
    }
}

class Hack {
    constructor(private readonly ns: INs, private readonly serverId){}
    
    get duration(): number {
        return this.ns.getHackTime(this.serverId);
    }
    
    get durationStr(): string {
        return formatDuration(this.duration);
    }
    
    get chance(): number {
        return this.ns.hackAnalyzeChance(this.serverId);
    }
    
    getThreadsAmount(money: number): number {
        return Math.ceil(this.ns.hackAnalyzeThreads(this.serverId, money));
    }
    
    getSecurityIncrease(threadsQty: number): number {
        return this.ns.hackAnalyzeSecurity(threadsQty, this.serverId);
    }
    
    getMoneyStolen(threadsQty: number): number {
        return this.ns.hackAnalyze(this.serverId) * threadsQty;
    }
}

class Grow {
    constructor(private readonly ns: INs, private readonly serverId){}
    
    get duration(): number {
        return this.ns.getGrowTime(this.serverId);
    }
    
    get durationStr(): string {
        return formatDuration(this.duration);
    }
    
    getThreadsAmount(availableMoney: number, maxMoney: number, cores: number = 1): number {
        availableMoney = Math.max(1, availableMoney);
        return Math.ceil(this.ns.growthAnalyze(this.serverId, maxMoney / availableMoney, cores));
    }
    
    getSecurityIncrease(threadQty: number, cores: number = 1): number {
        return this.ns.growthAnalyzeSecurity(threadQty, this.serverId, cores);
    }
}

class Weaken {
    constructor(private readonly ns: INs, private readonly serverId){}
    
    get duration(): number {
        return this.ns.getWeakenTime(this.serverId);
    }
    
    get durationStr(): string {
        return formatDuration(this.duration);
    }
    
    // getThreadsAmount(deltaSec: number): number {
    //     return Math.ceil(deltaSec * 20);
    // }
    
    getThreadsAmount(deltaSec: number, cores: number = 1): number {
        const threadsCount: number = deltaSec / this.ns.weakenAnalyze(1, cores);
        return Math.ceil(threadsCount);
    }
    
    getSecurityDecrease(threadsQty: number, cores: number = 1): number {
        return this.ns.weakenAnalyze(threadsQty, cores);
    }
}

const CONSTANTS = {
    ServerBaseGrowthRate:  1.03,
    ServerMaxGrowthRate: 1.0035
}

const BitNodeMultipliers = {
    ServerGrowthRate: 1
}

export function numCycleForGrowthCorrected(server, targetMoney, startMoney, p, cores = 1) {
    if (startMoney < 0) { startMoney = 0; }
    if (targetMoney > server.money.max) { targetMoney = server.money.max; }
    if (targetMoney <= startMoney) { return 0; }
    
    const adjGrowthRate = (1 + (CONSTANTS.ServerBaseGrowthRate - 1) / server.security.level);
    const exponentialBase = Math.min(adjGrowthRate, CONSTANTS.ServerMaxGrowthRate); // cap growth rate
    
    const serverGrowthPercentage = server.growth / 100.0;
    const coreMultiplier = 1 + ((cores - 1) / 16);
    const threadMultiplier = serverGrowthPercentage * p.hacking.multipliers.grow * coreMultiplier * BitNodeMultipliers.ServerGrowthRate;
    
    const x = threadMultiplier * Math.log(exponentialBase);
    const y = startMoney * x + Math.log(targetMoney * x);

    let w;
    if (y < Math.log(2.5)) {
        const ey = Math.exp(y);
        w = (ey + 4/3 * ey*ey) / (1 + 7/3 * ey + 5/6 * ey*ey);
    } else {
        w = y;
        if (y > 0) w -= Math.log(y);
    }
    let cycles = w/x - startMoney;
    
    const bt = exponentialBase**threadMultiplier;
    let corr = Infinity;
    do {
        const bct = bt**cycles;
        const opc = startMoney + cycles;
        const diff = opc * bct - targetMoney;
        corr = diff / (opc * x + 1.0) / bct
        cycles -= corr;
    } while (Math.abs(corr) >= 1)
    const fca = Math.floor(cycles);
    if (targetMoney <= (startMoney + fca)*Math.pow(exponentialBase, fca*threadMultiplier)) {
        return fca;
    }
    const cca = Math.ceil(cycles);
    if (targetMoney <= (startMoney + cca)*Math.pow(exponentialBase, cca*threadMultiplier)) {
        return cca;
    }
    return cca + 1;
}

/**
 * This function calculates the number of threads needed to grow a server based on a pre-hack money and hackAmt
 * (ie, if you're hacking a server with $1e6 moneyAvail for 60%, this function will tell you how many threads to regrow it
 * A good replacement for the current ns.growthAnalyze if you want players to have more control/responsibility
 * @param server - Server being grown
 * @param hackProp - the proportion of money hacked (total, not per thread, like 0.60 for hacking 60% of available money)
 * @param prehackMoney - how much money the server had before being hacked (like 200000 for hacking a server that had $200000 on it at time of hacking)
 * @param p - Reference to Player object
 * @returns Number of "growth cycles" needed to reverse the described hack
 */
export function numCycleForGrowthByHackAmt(server, hackProp, prehackMoney, p, cores = 1) {
    if (prehackMoney > server.money.max) prehackMoney = server.money.max;
    const posthackMoney = Math.floor(prehackMoney * Math.min(1, Math.max(0, (1 - hackProp))));
    return numCycleForGrowthCorrected(server, prehackMoney, posthackMoney, p, cores);
}

/**
 * This function calculates the number of threads needed to grow a server based on an expected growth multiplier assuming it will max out
 * (ie, if you expect to grow a server by 60% to reach maxMoney, this function will tell you how many threads to grow it)
 * PROBABLY the best replacement for the current ns.growthAnalyze to maintain existing scripts
 * @param server - Server being grown
 * @param growth - How much the server is being grown by, as a multiple in DECIMAL form (e.g. 1.5 rather than 50). Infinity is acceptable.
 * @param p - Reference to Player object
 * @returns Number of "growth cycles" needed
 */
export function numCycleForGrowthByMultiplier(server, growth, p, cores = 1) {
    if (growth < 1.0) growth = 1.0;
    const targetMoney = server.money.max;
    const startingMoney = server.money.max / growth;
    return numCycleForGrowthCorrected(server, targetMoney, startingMoney, p, cores);
}