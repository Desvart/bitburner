import {INs, Log} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Player} from '/resources/player';

const HOME_RAM_BUFFER = 8; //GB
const DEFAULT_THREAD_RAM = 1.75; //GB

export interface IServer2 {
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
// TODO: refactor Network to extend an Array and not a Map
export class Network2 extends Map {
    
    constructor(private readonly ns: INs, subnetwork?) {
        super();
        if (!subnetwork)
            this.buildServerNetwork();
        else
            subnetwork.forEach((server, id) => this.set(id, server));
    }
    
    get isFullyNuked(): boolean {
        return !this.filter(server => server.ram.max > 0).some(server => !server.isRoot);
    }
    
    getSmallestServers(threadsNeeded: number, ramPerScriptNeeded: number) {
        const sortedServers = this.filter(server => server.getThreadsCount(ramPerScriptNeeded) >= threadsNeeded).
            sort((curr, next) => curr.getThreadsCount(ramPerScriptNeeded) - next.getThreadsCount(ramPerScriptNeeded));
        const [smallestServer] = sortedServers.values()
        return smallestServer;
    }
    
    filter(conditions: Function): Network {
        return new Network(this.ns, new Map([...this].filter(([id, server]) => conditions(server))));
    }
    
    some(conditions: Function): boolean {
        return [...this].some(([id, server]) => conditions(server));
    }
    
    sort(conditions: Function) {
        return new Network(this.ns, new Map([...this].sort((curr, next) => conditions(curr[1], next[1]))));
    }
    
    private retrieveHostnames(currentNode: string = 'home', scannedNodes: Set<string> = new Set()): string[] {
        const nodesToScan = this.ns.scan(currentNode).filter(node => !scannedNodes.has(node));
        nodesToScan.forEach(node => {
            scannedNodes.add(node);
            this.retrieveHostnames(node, scannedNodes);
        });
        return Array.from(scannedNodes.keys());
    }
    
    private buildServerNetwork(): void {
        this.retrieveHostnames().forEach(id => this.set(id, new Server2(this.ns, id)));
    }
}

export class Server2 implements IServer2 {
    readonly level: number;
    readonly cores: number;
    readonly requiredPorts: number;
    readonly purchased: boolean;
    readonly isHome: boolean;
    readonly ram: Ram;
    readonly security: Security;
    readonly money: Money;
    
    constructor(private readonly ns: INs, readonly id: string) {
        this.ram = new Ram(ns, id);
        this.security = new Security(ns, id);
        this.money = new Money(ns, id);
        this.level = ns.getServer(id).requiredHackingSkill;
        this.cores = ns.getServer(id).cpuCores;
        this.requiredPorts = ns.getServer(id).numOpenPortsRequired;
        this.purchased = ns.getServer(id).purchasedByPlayer;
        this.isHome = (id === 'home');
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