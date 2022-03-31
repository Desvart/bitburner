export async function main(ns) {
    
    new Jarvis(ns).runOperations();
    
}

class Jarvis {
    private network: Network;
    
    constructor(ns: object) {
        this.network = new Network(ns);
    }
    
    runOperations(): void {
        this.hackAvailableHosts();
        this.runHacknetOperations();
        
        while (this.isNetworkOwned() === false) {
            
            this.hackAvailableHosts();
            this.deployLocalMalwareOnAvailableHosts();
            
            if (this.isHydraDeployed() === false) {
                this.runHydraOperations();
            }
            
            if (this.isSherlockDeployed() === false) {
                this.runSherlockOperations();
            }
        }
    }
    
    hackAvailableHosts(): void {
        let nukableHosts: Node[] = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    
    runHacknetOperations(): void {
        // TODO
        // Deploy hacknet farm on foodnstuff
        // Activate hacknet farm
    }
    
    isNetworkOwned(): boolean {
        // TODO
        return false;
    }
    
    deployLocalMalwareOnAvailableHosts(): void {
        // TODO
    }
    
    isHydraDeployed(): boolean {
        // TODO
        return false;
    }
    
    runHydraOperations(): void {
        // TODO
        // Deploy hydraManager as soon as we have access to a 32 GB RAM host
        // Activate hydra operations
        // Determine the RAM cost to // hack n00dles. If it is more than the RAM available on home, buy a server
        // Else run it against home
        // If enough money buy new server and hack next server
    }
    
    isSherlockDeployed(): boolean {
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
    
    constructor(ns) {
        this.nsA = new NsAdapter(ns);
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
    
    filtersOutNonNukableNodes(network: Node[]): Node[] {
        return network.filter(n => n.isNukable() === true);
    }
    
    nukeNodes(nukableNodes: Node[]): void {
        nukableNodes.forEach(n => n.nuke());
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
}

type Server = {
    hostname: string;
    requiredHackingSkill: number;
    numOpenPortsRequired: number;
    purchasedByPlayer: boolean;
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