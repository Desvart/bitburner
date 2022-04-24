import { NETWORK_CONFIG } from '/jarvis/jarvis-config.js';
export class Server {
    constructor(nsA, nodeName) {
        this.KEYS = [
            'BruteSSH.exe',
            'FTPCrack.exe',
            'relaySMTP.exe',
            'HTTPWorm.exe',
            'SQLInject.exe'
        ];
        this.nsA = nsA;
        const node = nsA.getNode(nodeName);
        this.hostname = node.hostname;
        this.requiredHackingSkill = node.requiredHackingSkill;
        this.numOpenPortsRequired = node.numOpenPortsRequired;
        this.purchasedByPlayer = node.purchasedByPlayer;
        this.ram = node.maxRam;
        this.isPotentialTarget = this.checkIfPotentialTarget();
    }
    hasAdminRights() {
        return this.nsA.hasRootAccess(this.hostname);
    }
    isNukable() {
        return (this.isPotentialTarget === true &&
            this.hasAdminRights() === false &&
            this.requiredHackingSkill <= this.nsA.getPlayerHackingLevel() &&
            this.numOpenPortsRequired <= this.getAvailableKeysCount());
    }
    checkIfPotentialTarget() {
        if (this.purchasedByPlayer === true)
            return false;
        for (let blackNode of NETWORK_CONFIG.BLACK_LIST)
            if (this.hostname === blackNode)
                return false;
        return true;
    }
    getAvailableKeysCount() {
        return this.getAvailableKeys().length;
    }
    nuke() {
        this.openPorts();
        this.getRootAccess();
    }
    openPorts() {
        const availableKeys = this.getAvailableKeys();
        let portOpenedCount = 0;
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
    getAvailableKeys() {
        return this.KEYS.filter(key => this.nsA.fileExists(key, 'home'));
    }
    getRootAccess() {
        this.nsA.nuke(this.hostname);
    }
}
//# sourceMappingURL=server.js.map