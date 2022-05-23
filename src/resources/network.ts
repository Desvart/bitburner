import {INs, INsServer, IServer, Log} from '/resources/helpers';

export class Network {
    
    public servers: Server[];
    
    constructor(private ns: INs, private log: Log) {
        this.servers = this.retrieveNetwork();
    }
    
    getNode(hostname: string) {
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
}

export class Server implements IServer {
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
    private readonly ns: INs;
    private readonly log: Log;
    
    constructor(ns: INs, log: Log, hostname: string) {
        this.ns = ns;
        this.log = log;
        
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
    
    getAdminAccess(): boolean {
        return this.ns.hasRootAccess(this.hostname);
    }
    
    getAvailableMoney(): number {
        return this.ns.getServerMoneyAvailable(this.hostname);
    }
    
    getSecurityLevel(): number {
        return this.ns.getServerSecurityLevel(this.hostname);
    }
    
    isNukable(): boolean {
        return (this.isPotentialTarget === true &&
            this.getAdminAccess() === false &&
            this.requiredHackingSkill <= this.ns.getHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    
    nuke(): boolean {
        if (this.isNukable()) {
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
}