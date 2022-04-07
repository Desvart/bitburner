export async function main(ns) {
    ns.tail();
    ns.disableLog('ALL');
    ns.clearLog();
    await new Jarvis(ns).runOperations();
    
}

class Jarvis {
    private readonly nsA: NsAdapter;
    private network: Network;
    
    constructor(ns: object) {
        this.nsA = new NsAdapter(ns);
        this.network = new Network(this.nsA);
    }
    
    async runOperations(): Promise<void> {
        debugger
        this.hackAvailableHosts();
        
        await this.deployHacknetFarm();
        this.activateHacknetOperations();
        
        while (this.network.isNetworkFullyOwned() === false) {
            
            this.hackAvailableHosts();
            
            const availableHosts: string[] = await this.deployWormOnAvailableHosts();
            this.activateWormOnAvailableHosts(availableHosts);
            
            if (this.isCommandAndControlDeployed() === false && this.isCommandAndControlDeployable() === true) {
                this.deployCommandAndControl();
                this.activateCommandAndControl();
            }
            
            if (this.isSherlockDeployed() === false && this.isSherlockDeployable() === true) {
                this.runSherlockOperations();
            }
            
            await this.nsA.sleep(2000);
        }
    }
    
    hackAvailableHosts(): void {
        let nukableHosts: Node[] = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    
    async deployHacknetFarm(): Promise<void> {
        await this.nsA.scp(HACKNET_CONFIG.FILE_LIST, 'home', HACKNET_CONFIG.TARGET);
    }
    
    activateHacknetOperations(): void {
        this.nsA.exec(HACKNET_CONFIG.FILE_LIST[0], HACKNET_CONFIG.TARGET, 1);
    }
    
    async deployWormOnAvailableHosts(): Promise<string[]> {
        const availableHosts: string[] = this.listAvailableHosts();
        await this.deployWorm(availableHosts);
        return availableHosts;
    }
    
    listAvailableHosts(): string[] {
        const potentialHosts: Node[] = this.network.nodes.filter(n => n.isPotentialTarget && n.hasAdminRights());
        console.debug(this.network.nodes);
        let availableHosts: string[] = [];
        for (const potentialHost of potentialHosts) {
            if (this.nsA.ps(potentialHost.hostname).filter(p => p.filename.includes('worm-daemon.js')).length === 0) {
                availableHosts.push(potentialHost.hostname);
            }
        }
        return availableHosts;
    }
    
    async deployWorm(availableHosts: string[]): Promise<void> {
        const fileToCpy: string[] = [
            '/malwares/worm-daemon.js',
            '/malwares/hack.js',
            '/malwares/weaken.js',
            '/malwares/grow.js'];
        
        for (const target of availableHosts) {
            await this.nsA.scp(fileToCpy, 'home', target);
        }
    }
    
    activateWormOnAvailableHosts(availableHosts: string[]): void {
        for (const target of availableHosts) {
            this.nsA.exec('/malware/worm-hacknet-daemon.js', target, 1);
        }
    }
    
    isCommandAndControlDeployed(): boolean {
        // TODO
        return false;
    }
    isCommandAndControlDeployable(): boolean {
        // TODO
        return false;
    }
    
    deployCommandAndControl(): void {
        // TODO
        // Deploy hydraManager as soon as we have access to a 32 GB RAM host
        // Activate malwares operations
        // Determine the RAM cost to // hack n00dles. If it is more than the RAM available on home, buy a server
        // Else run it against home
        // If enough money buy new server and hack next server
    }
    
    activateCommandAndControl(): void {
        // TODO
    }
    
    isSherlockDeployed(): boolean {
        // TODO
        return false;
    }
    
    isSherlockDeployable(): boolean {
        // TODO
        return false;
    }
    
    runSherlockOperations(): void {
        // TODO
        // Deploy contract farming as soon as we have access to a second 32GB RAM host
        // Activate sherlock operations
    }
}

class Network {
    
    private readonly nsA: NsAdapter;
    
    get nodes(): Node[] { return this.retrieveNetwork(); };
    
    constructor(nsA) {
        this.nsA = nsA;
    }
    
    identifyNukableHosts() {
        const network: Node[] = this.retrieveNetwork();
        return this.filtersOutNonNukableNodes(network);
    }
    
    private retrieveNetwork(): Node[] {
        const nodeNames: string[] = this.retrieveNodeNames();
        return this.buildNetwork(nodeNames);
    }
    
    private retrieveNodeNames(): string[] {
        let discoveredNodes: string[] = [];
        let nodesToScan: string[] = ['home'];
        let infiniteLoopProtection: number = GLOBAL_CONFIG.LOOP_SECURITY;
        
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName: string = nodesToScan.pop();
            const connectedNodeNames: string[] = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
    
    private buildNetwork(nodeNames: string[]): Node[] {
        let nodes: Node[] = [];
        for (const nodeName of nodeNames) {
            const node = new Node(this.nsA, nodeName);
            nodes.push(node);
        }
        return nodes;
    }
    
    private filtersOutNonNukableNodes(network: Node[]): Node[] {
        return network.filter(n => n.isNukable() === true);
    }
    
    nukeNodes(nukableNodes: Node[]): void {
        nukableNodes.forEach(n => n.nuke());
    }
    
    isNetworkFullyOwned(): boolean {
        const network: Node[] = this.retrieveNetwork();
        return !network.filter(n => n.isPotentialTarget === true).some(n => n.hasAdminRights() === false);
    }
}

class Node {
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
        
        const node: Server = nsA.getNode(nodeName);
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

class NsAdapter {
    private readonly ns;
    
    constructor(ns: object) {
        this.ns = ns;
    }
    
    scan(hostname: string): string[] {
        return this.ns.scan(hostname);
    }
    
    getNode(nodeName: string): Server {
        return this.ns.getServer(nodeName);
    }
    
    hasRootAccess(nodeName: string): boolean {
        return this.ns.hasRootAccess(nodeName);
    }
    
    getPlayerHackingLevel(): number {
        return this.ns.getHackingLevel();
    }
    
    brutessh(hostname: string): void {
        this.ns.brutessh(hostname);
    }
    
    ftpcrack(hostname: string): void {
        this.ns.ftpcrack(hostname);
    }
    
    relaysmtp(hostname: string): void {
        this.ns.relaysmtp(hostname);
    }
    
    httpworm(hostname: string): void {
        this.ns.httpworm(hostname);
    }
    
    sqlinject(hostname: string): void {
        this.ns.sqlinject(hostname);
    }
    
    fileExists(fileName: string, hostname: string): boolean {
        return this.ns.fileExists(fileName, hostname);
    }
    
    nuke(hostname: string): void {
        this.ns.nuke(hostname);
    }
    
    async scp(files: string | string[], source: string, target: string): Promise<void> {
        await this.ns.scp(files, source, target);
    }
    
    exec(script: string, target: string, threadCount: number, ...args: any[]): void {
        this.ns.exec(script, target, threadCount, ...args);
    }
    
    ps(hostname: string): Process[] {
        return this.ns.ps(hostname);
    }
    
    async sleep(duration: number): Promise<void> {
        await this.ns.sleep(duration);
        
    }
}

type Server = {
    hostname: string;
    requiredHackingSkill: number;
    numOpenPortsRequired: number;
    purchasedByPlayer: boolean;
    hasAdminRights: boolean;
}

type Process = {
    filename: string;
}

const GLOBAL_CONFIG: {
    EMPTY_QUEUE: string,
    HELPER_FILE: string,
    CONFIG_FILE: string,
    LOOP_SECURITY: number,
    JARVIS_TAIL: boolean,
} = {
    EMPTY_QUEUE: 'NULL PORT DATA',
    HELPER_FILE: '/helpers/helper.js',
    CONFIG_FILE: '/config/config.js',
    LOOP_SECURITY: 9999,
    JARVIS_TAIL: false,
};

const JARVIS_CONFIG: {
    CYCLE_TIME: number,
} = {
    CYCLE_TIME: 60 * 1000, //ms
};

const NETWORK_CONFIG: {
    BLACK_LIST: string[],
} = {
    BLACK_LIST: ['home', 'darkweb', 'CSEC', 'The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', '.', 'w0r1d_d43m0n'],
};

const HACKNET_CONFIG: {
    FILE_LIST: string[],
    TARGET: string,
} = {
    FILE_LIST: ['/hacknetTS/hacknet-daemon.js'],
    TARGET: 'foodnstuff',
};

const WORM_CONFIG: {
    FILE_LIST: string[],
} = {
    FILE_LIST: ['/malwares/worm-daemon.js', '/malwares/hack.js', '/malwares/weaken.js', '/malwares/grow.js'],
};
