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
    isPotentialTarget: boolean;
    private readonly nsA: NsAdapter;
    
    constructor(nsA: NsAdapter, nodeName: string) {
        this.nsA = nsA;
        
        const node: any = nsA.getNode(nodeName);
        this.hostname = node.hostname;
        this.requiredHackingSkill = node.requiredHackingSkill;
        this.numOpenPortsRequired = node.numOpenPortsRequired;
        this.purchasedByPlayer = node.purchasedByPlayer;
        this.isPotentialTarget = this.checkIfPotentialTarget();
    }
    
    hasAdminRights(): boolean {
        return this.nsA.hasRootAccess(this.hostname);
    }
    
    isNukable(): boolean {
        return (this.isPotentialTarget === true &&
            this.hasAdminRights() === false &&
            this.requiredHackingSkill <= this.nsA.getPlayerHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    
    private checkIfPotentialTarget(): boolean {
        
        if (this.purchasedByPlayer === true)
            return false;
        
        for (let blackNode of NETWORK_CONFIG.BLACK_LIST)
            if (this.hostname === blackNode)
                return false;
        
        return true;
    }
    
    getAvailableKeysCount(): number {
        return this.getAvailableKeys().length;
    }
    
    nuke() {
        this.openPorts();
        this.getRootAccess();
    }
    
    private openPorts(): number {
        const availableKeys = this.getAvailableKeys();
        let portOpenedCount: number = 0;
        for (let key of availableKeys) {
            switch (key) {
                case this.KEYS[0]:
                    this.nsA.brutessh(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[1]:
                    this.nsA.ftpcrack(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[2]:
                    this.nsA.relaysmtp(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[3]:
                    this.nsA.httpworm(this.hostname);
                    portOpenedCount++;
                    break;
                
                case this.KEYS[4]:
                    this.nsA.sqlinject(this.hostname);
                    portOpenedCount++;
                    break;
            }
        }
        return portOpenedCount;
    }
    
    private getAvailableKeys() {
        return this.KEYS.filter(key => this.nsA.fileExists(key, 'home'));
    }
    
    private getRootAccess() {
        this.nsA.nuke(this.hostname);
    }
}