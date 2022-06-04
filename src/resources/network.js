export class Network {
    constructor(ns, log) {
        this.ns = ns;
        this.log = log;
        this.servers = this.retrieveNetwork();
    }
    getNode(hostname) {
        return this.servers.filter(n => n.hostname === hostname)[0];
    }
    retrieveNetwork() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let maxLoop = 999;
        while (nodesToScan.length > 0 && maxLoop-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.ns.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames)
                if (!discoveredNodes.map(n => n.hostname).includes(connectedNodeName))
                    nodesToScan.push(connectedNodeName);
            discoveredNodes.push(new Server(this.ns, this.log, nodeName));
        }
        return discoveredNodes;
    }
    getSmallestServers(threadsNeeded, scriptRam) {
        return this.servers
            .filter(server => server.getAvailableThreads(scriptRam) >= threadsNeeded)
            .sort((a, n) => (a.getAvailableThreads(scriptRam) - n.getAvailableThreads(scriptRam)))[0];
    }
    isFullyNuked() {
        return !this.servers.filter(n => n.isPotentialTarget).some(n => !n.hasAdminAccess());
    }
}
export class Server {
    constructor(ns, log, hostname) {
        this.ns = ns;
        this.log = log;
        this.DEFAULT_SCRIPT_RAM = 1.75;
        this.KEYS = [
            'BruteSSH.exe',
            'FTPCrack.exe',
            'relaySMTP.exe',
            'HTTPWorm.exe',
            'SQLInject.exe'
        ];
        const nsServer = ns.getServer(hostname);
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
    hasAdminAccess() {
        return this.ns.hasRootAccess(this.hostname);
    }
    getAvailableMoney() {
        return this.ns.getServerMoneyAvailable(this.hostname);
    }
    getSecurityLevel() {
        return this.ns.getServerSecurityLevel(this.hostname);
    }
    getUsedRam() {
        return this.ns.getServerUsedRam(this.hostname);
    }
    canBeNuked() {
        return (this.isPotentialTarget === true &&
            this.hasAdminAccess() === false &&
            this.requiredHackingSkill <= this.ns.getHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    canExecScripts() {
        return (this.hasAdminAccess() &&
            this.maxRam > 0);
    }
    nuke() {
        if (this.canBeNuked()) {
            this.openPorts();
            this.getRootAccess();
            this.log.success(`SERVER - ${this.hostname} successfully nuked.`);
            return true;
        }
        else {
            this.log.warn(`SERVER - Cannot nuke ${this.hostname}.`, true);
            return false;
        }
    }
    openPorts() {
        const availableKeys = this.getAvailableKeys();
        let portOpenedCount = 0;
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
    getAvailableKeys() {
        return this.KEYS.filter(key => this.ns.fileExists(key, 'home'));
    }
    getAvailableKeysCount() {
        return this.getAvailableKeys().length;
    }
    getRootAccess() {
        this.ns.nuke(this.hostname);
    }
    availableRam() {
        let reservedRam = 0;
        if (this.hostname === 'home')
            reservedRam = 1024; // non allocatable RAM on home
        return Math.max(this.maxRam - this.getUsedRam() - reservedRam);
    }
    getAvailableThreads(scriptRam = this.DEFAULT_SCRIPT_RAM) {
        if (!this.canExecScripts())
            return 0;
        else
            return Math.floor(this.availableRam() / scriptRam);
    }
}
//# sourceMappingURL=network.js.map