import {INs, Log} from '/resources/helpers';
import {getService, ServiceName} from '/resources/service';
import {Player} from '/resources/player';

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
        this.buildServerNetwork();
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
    
    private buildServerNetwork(): void {
        Network.retrieveHostnames(this.ns).forEach(id => this.push(new Server(this.ns, id)));
    }
    
    map(mapper: Function): any[] {
        let mappedNetwork = new Network(this.ns);
        for(let i = 0; i < this.length; i++)
            mappedNetwork[i] = mapper(this[i]);
        return mappedNetwork;
    }
    
    getServer(hostname: string): Server {
        return this.filter(serv => serv.id === hostname)[0];
    }
}

export class Server implements IServer {
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
