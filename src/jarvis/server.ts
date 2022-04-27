import {INs, INsServer, Log} from '/resources/helpers';

export class Server {
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
    ram: number;
    isPotentialTarget: boolean;
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
        this.ram = nsServer.maxRam;
        this.isPotentialTarget = nsServer.moneyMax > 0;
    }
    
    hasRootAccess(): boolean {
        return this.ns.hasRootAccess(this.hostname);
    }
    
    isNukable(): boolean {
        return (this.isPotentialTarget === true &&
            this.hasRootAccess() === false &&
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