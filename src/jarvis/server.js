export class Server {
    constructor(ns, log, hostname) {
        this.KEYS = [
            'BruteSSH.exe',
            'FTPCrack.exe',
            'relaySMTP.exe',
            'HTTPWorm.exe',
            'SQLInject.exe'
        ];
        this.ns = ns;
        this.log = log;
        const nsServer = ns.getServer(hostname);
        this.hostname = nsServer.hostname;
        this.requiredHackingSkill = nsServer.requiredHackingSkill;
        this.numOpenPortsRequired = nsServer.numOpenPortsRequired;
        this.purchasedByPlayer = nsServer.purchasedByPlayer;
        this.ram = nsServer.maxRam;
        this.isPotentialTarget = nsServer.moneyMax > 0;
    }
    hasRootAccess() {
        return this.ns.hasRootAccess(this.hostname);
    }
    isNukable() {
        return (this.isPotentialTarget === true &&
            this.hasRootAccess() === false &&
            this.requiredHackingSkill <= this.ns.getHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    nuke() {
        if (this.isNukable()) {
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
}
//# sourceMappingURL=server.js.map