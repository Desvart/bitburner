import { Log } from '/resources/helpers';
import { getService, ServiceName } from '/resources/service';
const HOME_RAM_BUFFER = 8; //GB
const DEFAULT_THREAD_RAM = 1.75; //GB
export class Network extends Array {
    constructor(ns) {
        super();
        this.ns = ns;
        this.buildServerNetwork();
    }
    get isFullyNuked() {
        return !this.filter(server => server.ram.max > 0).some(server => !server.isRoot);
    }
    getSmallestServers(threadsNeeded, ramPerScriptNeeded) {
        const sortedServers = this.filter(server => server.getThreadsCount(ramPerScriptNeeded) >= threadsNeeded).
            sort((curr, next) => curr.getThreadsCount(ramPerScriptNeeded) - next.getThreadsCount(ramPerScriptNeeded));
        return sortedServers[0];
    }
    static retrieveHostnames(ns, currentNode = 'home', scannedNodes = new Set()) {
        const nodesToScan = ns.scan(currentNode).filter(node => !scannedNodes.has(node));
        nodesToScan.forEach(node => {
            scannedNodes.add(node);
            Network.retrieveHostnames(ns, node, scannedNodes);
        });
        return Array.from(scannedNodes.keys());
    }
    buildServerNetwork() {
        Network.retrieveHostnames(this.ns).forEach(id => this.push(new Server(this.ns, id)));
    }
    map(mapper) {
        let mappedNetwork = new Network(this.ns);
        for (let i = 0; i < this.length; i++)
            mappedNetwork[i] = mapper(this[i]);
        return mappedNetwork;
    }
    getServer(hostname) {
        return this.filter(serv => serv.id === hostname)[0];
    }
}
export class Server {
    constructor(ns, id) {
        this.ns = ns;
        this.id = id;
        this.ram = new Ram(ns, id);
        this.security = new Security(ns, id);
        this.money = new Money(ns, id);
        this.level = ns.getServer(id).requiredHackingSkill;
        this.cores = ns.getServer(id).cpuCores;
        this.requiredPorts = ns.getServer(id).numOpenPortsRequired;
        this.purchased = ns.getServer(id).purchasedByPlayer;
        this.isHome = (id === 'home');
    }
    get isRoot() {
        return this.ns.getServer(this.id).hasAdminRights;
    }
    get canBeNuked() {
        const player = getService(this.ns, ServiceName.Player);
        return (!this.isRoot && player.hacking.level >= this.level && player.portsKeyCount >= this.requiredPorts);
    }
    get canExecScripts() {
        return (this.isRoot && this.ram.max > 0);
    }
    nuke() {
        if (this.canBeNuked) {
            this.openPorts();
            this.sudo();
        }
        else {
            new Log(this.ns).warn(`SERVER ${this.id} - Cannot perform nuke operation`, true);
        }
    }
    getThreadsCount(ramPerThread = DEFAULT_THREAD_RAM) {
        if (!this.canExecScripts)
            return 0;
        else
            return Math.floor(this.ram.free / ramPerThread);
    }
    openPorts() {
        const player = getService(this.ns, ServiceName.Player);
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
    sudo() {
        this.ns.nuke(this.id);
        const log = new Log(this.ns);
        if (this.isRoot)
            log.success(`SERVER ${this.id} - Nuke operation successful`);
        else
            log.warn(`SERVER ${this.id} - Nuke operation failed`, true);
    }
}
class Ram {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.max = ns.getServer(serverId).maxRam;
    }
    get used() {
        return this.ns.getServer(this.serverId).ramUsed;
    }
    get free() {
        return this.max - this.used - (this.serverId === 'home' ? HOME_RAM_BUFFER : 0);
    }
}
class Security {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.min = ns.getServer(serverId).minDifficulty;
    }
    get level() {
        return this.ns.getServer(this.serverId).hackDifficulty;
    }
}
class Money {
    constructor(ns, serverId) {
        this.ns = ns;
        this.serverId = serverId;
        this.max = ns.getServer(serverId).moneyMax;
        this.growth = ns.getServer(serverId).serverGrowth;
    }
    get available() {
        return this.ns.getServer(this.serverId).moneyAvailable;
    }
}
//# sourceMappingURL=network.js.map