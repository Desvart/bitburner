import {INs, INsServer, IServer, Log} from '/resources/helpers';

export class Network {
    
    public servers: Server[];
    
    constructor(private ns: INs, private log: Log) {
        this.servers = this.retrieveNetwork();
    }
    
    getNode(hostname: string): Server {
        return this.servers.filter(n => n.hostname === hostname)[0];
    }
    
    private retrieveNetwork(): Server[] {
        let discoveredNodes: Server[] = [];
        let nodesToScan: string[] = ['home'];
        let maxLoop = 999;
        
        while (nodesToScan.length > 0 && maxLoop-- > 0) {
            
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.ns.scan(nodeName);
            
            for (const connectedNodeName of connectedNodeNames)
                if (!discoveredNodes.map(n => n.hostname).includes(connectedNodeName))
                    nodesToScan.push(connectedNodeName);
            
            discoveredNodes.push(new Server(this.ns, this.log, nodeName));
        }
        
        return discoveredNodes;
    }
    
    getSmallestServers(threadsNeeded, scriptRam): Server {
        return this.servers
            .filter(server => server.getAvailableThreads(scriptRam) >= threadsNeeded)
            .sort((a, n) => (a.getAvailableThreads(scriptRam) - n.getAvailableThreads(scriptRam)))[0];
    }
    
    isFullyNuked(): boolean {
        return !this.servers.filter(n => n.isPotentialTarget).some(n => !n.hasAdminAccess());
    }
}

export class Server implements IServer {
    
    private readonly DEFAULT_SCRIPT_RAM = 1.75;
    
    private readonly KEYS = [
        'BruteSSH.exe',
        'FTPCrack.exe',
        'relaySMTP.exe',
        'HTTPWorm.exe',
        'SQLInject.exe'];
    
    hostname: string;
    requiredHackingSkill: number;
    numOpenPortsRequired: number;
    purchasedByPlayer: boolean;
    maxRam: number;
    isPotentialTarget: boolean;
    coresCount: number;
    minSec: number;
    maxMoney: number;
    growthFactor: number;
    
    constructor(private readonly ns: INs, private readonly log: Log, hostname: string) {
        const nsServer: INsServer = ns.getServer(hostname);
        this.hostname = nsServer.hostname;
        this.requiredHackingSkill = nsServer.requiredHackingSkill;
        this.numOpenPortsRequired = nsServer.numOpenPortsRequired;
        this.purchasedByPlayer = nsServer.purchasedByPlayer;
        this.maxRam = nsServer.maxRam;
        this.isPotentialTarget = nsServer.moneyMax > 0;
        this.coresCount = nsServer.cpuCores;
        this.minSec = nsServer.minDifficulty;
        this.maxMoney = nsServer.moneyMax;
        this.growthFactor = nsServer.serverGrowth;
    }
    
    hasAdminAccess(): boolean {
        return this.ns.hasRootAccess(this.hostname);
    }
    
    getAvailableMoney(): number {
        return this.ns.getServerMoneyAvailable(this.hostname);
    }
    
    getSecurityLevel(): number {
        return this.ns.getServerSecurityLevel(this.hostname);
    }
    
    private getUsedRam(): number {
        return this.ns.getServerUsedRam(this.hostname);
    }
    
    canBeNuked(): boolean {
        return (this.isPotentialTarget === true &&
            this.hasAdminAccess() === false &&
            this.requiredHackingSkill <= this.ns.getHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    
    canExecScripts(): boolean {
        return (
            this.hasAdminAccess() &&
            this.maxRam > 0
        );
    }
    
    nuke(): boolean {
        if (this.canBeNuked()) {
            this.openPorts();
            this.getRootAccess();
            this.log.success(`SERVER - ${this.hostname} successfully nuked.`);
            return true;
        } else {
            this.log.warn(`SERVER - Cannot nuke ${this.hostname}.`, true);
            return false;
        }
    }
    
    private openPorts(): number {
        const availableKeys = this.getAvailableKeys();
        let portOpenedCount: number = 0;
        for (let key of availableKeys) {
            switch (key) {
                case this.KEYS[0]:
                    this.ns.brutessh(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[1]:
                    this.ns.ftpcrack(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[2]:
                    this.ns.relaysmtp(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[3]:
                    this.ns.httpworm(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[4]:
                    this.ns.sqlinject(this.hostname);
                    portOpenedCount++;
                    break;
            }
        }
        return portOpenedCount;
    }
    
    private getAvailableKeys(): string[] {
        return this.KEYS.filter(key => this.ns.fileExists(key, 'home'));
    }
    
    private getAvailableKeysCount(): number {
        return this.getAvailableKeys().length;
    }
    
    private getRootAccess(): void {
        this.ns.nuke(this.hostname);
    }
    
    private availableRam(): number {
        
        let reservedRam: number = 0;
        if (this.hostname === 'home')
            reservedRam = 1024; // non allocatable RAM on home
        
        return Math.max(this.maxRam - this.getUsedRam() - reservedRam);
    }
    
    getAvailableThreads(scriptRam: number = this.DEFAULT_SCRIPT_RAM): number {
        if (!this.canExecScripts())
            return 0;
        else
            return Math.floor(this.availableRam() / scriptRam);
    }
}