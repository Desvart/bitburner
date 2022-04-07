var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        yield new Jarvis(ns).runOperations();
    });
}
class Jarvis {
    constructor(ns) {
        this.nsA = new NsAdapter(ns);
        this.network = new Network(this.nsA);
    }
    runOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            debugger;
            this.hackAvailableHosts();
            yield this.deployHacknetFarm();
            this.activateHacknetOperations();
            while (this.network.isNetworkFullyOwned() === false) {
                this.hackAvailableHosts();
                const availableHosts = yield this.deployWormOnAvailableHosts();
                this.activateWormOnAvailableHosts(availableHosts);
                if (this.isCommandAndControlDeployed() === false && this.isCommandAndControlDeployable() === true) {
                    this.deployCommandAndControl();
                    this.activateCommandAndControl();
                }
                if (this.isSherlockDeployed() === false && this.isSherlockDeployable() === true) {
                    this.runSherlockOperations();
                }
                yield this.nsA.sleep(2000);
            }
        });
    }
    hackAvailableHosts() {
        let nukableHosts = this.network.identifyNukableHosts();
        this.network.nukeNodes(nukableHosts);
    }
    deployHacknetFarm() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.nsA.scp(HACKNET_CONFIG.FILE_LIST, 'home', HACKNET_CONFIG.TARGET);
        });
    }
    activateHacknetOperations() {
        this.nsA.exec(HACKNET_CONFIG.FILE_LIST[0], HACKNET_CONFIG.TARGET, 1);
    }
    deployWormOnAvailableHosts() {
        return __awaiter(this, void 0, void 0, function* () {
            const availableHosts = this.listAvailableHosts();
            yield this.deployWorm(availableHosts);
            return availableHosts;
        });
    }
    listAvailableHosts() {
        const potentialHosts = this.network.nodes.filter(n => n.isPotentialTarget && n.hasAdminRights());
        console.debug(this.network.nodes);
        let availableHosts = [];
        for (const potentialHost of potentialHosts) {
            if (this.nsA.ps(potentialHost.hostname).filter(p => p.filename.includes('worm-daemon.js')).length === 0) {
                availableHosts.push(potentialHost.hostname);
            }
        }
        return availableHosts;
    }
    deployWorm(availableHosts) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileToCpy = [
                '/malwares/worm-daemon.js',
                '/malwares/hack.js',
                '/malwares/weaken.js',
                '/malwares/grow.js'
            ];
            for (const target of availableHosts) {
                yield this.nsA.scp(fileToCpy, 'home', target);
            }
        });
    }
    activateWormOnAvailableHosts(availableHosts) {
        for (const target of availableHosts) {
            this.nsA.exec('/malware/worm-hacknet-daemon.js', target, 1);
        }
    }
    isCommandAndControlDeployed() {
        // TODO
        return false;
    }
    isCommandAndControlDeployable() {
        // TODO
        return false;
    }
    deployCommandAndControl() {
        // TODO
        // Deploy hydraManager as soon as we have access to a 32 GB RAM host
        // Activate malwares operations
        // Determine the RAM cost to // hack n00dles. If it is more than the RAM available on home, buy a server
        // Else run it against home
        // If enough money buy new server and hack next server
    }
    activateCommandAndControl() {
        // TODO
    }
    isSherlockDeployed() {
        // TODO
        return false;
    }
    isSherlockDeployable() {
        // TODO
        return false;
    }
    runSherlockOperations() {
        // TODO
        // Deploy contract farming as soon as we have access to a second 32GB RAM host
        // Activate sherlock operations
    }
}
class Network {
    constructor(nsA) {
        this.nsA = nsA;
    }
    get nodes() { return this.retrieveNetwork(); }
    ;
    identifyNukableHosts() {
        const network = this.retrieveNetwork();
        return this.filtersOutNonNukableNodes(network);
    }
    retrieveNetwork() {
        const nodeNames = this.retrieveNodeNames();
        return this.buildNetwork(nodeNames);
    }
    retrieveNodeNames() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let infiniteLoopProtection = GLOBAL_CONFIG.LOOP_SECURITY;
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
        }
        return discoveredNodes;
    }
    buildNetwork(nodeNames) {
        let nodes = [];
        for (const nodeName of nodeNames) {
            const node = new Node(this.nsA, nodeName);
            nodes.push(node);
        }
        return nodes;
    }
    filtersOutNonNukableNodes(network) {
        return network.filter(n => n.isNukable() === true);
    }
    nukeNodes(nukableNodes) {
        nukableNodes.forEach(n => n.nuke());
    }
    isNetworkFullyOwned() {
        const network = this.retrieveNetwork();
        return !network.filter(n => n.isPotentialTarget === true).some(n => n.hasAdminRights() === false);
    }
}
class Node {
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
class NsAdapter {
    constructor(ns) {
        this.ns = ns;
    }
    scan(hostname) {
        return this.ns.scan(hostname);
    }
    getNode(nodeName) {
        return this.ns.getServer(nodeName);
    }
    hasRootAccess(nodeName) {
        return this.ns.hasRootAccess(nodeName);
    }
    getPlayerHackingLevel() {
        return this.ns.getHackingLevel();
    }
    brutessh(hostname) {
        this.ns.brutessh(hostname);
    }
    ftpcrack(hostname) {
        this.ns.ftpcrack(hostname);
    }
    relaysmtp(hostname) {
        this.ns.relaysmtp(hostname);
    }
    httpworm(hostname) {
        this.ns.httpworm(hostname);
    }
    sqlinject(hostname) {
        this.ns.sqlinject(hostname);
    }
    fileExists(fileName, hostname) {
        return this.ns.fileExists(fileName, hostname);
    }
    nuke(hostname) {
        this.ns.nuke(hostname);
    }
    scp(files, source, target) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.scp(files, source, target);
        });
    }
    exec(script, target, threadCount, ...args) {
        this.ns.exec(script, target, threadCount, ...args);
    }
    ps(hostname) {
        return this.ns.ps(hostname);
    }
    sleep(duration) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(duration);
        });
    }
}
const GLOBAL_CONFIG = {
    EMPTY_QUEUE: 'NULL PORT DATA',
    HELPER_FILE: '/helpers/helper.js',
    CONFIG_FILE: '/config/config.js',
    LOOP_SECURITY: 9999,
    JARVIS_TAIL: false,
};
const JARVIS_CONFIG = {
    CYCLE_TIME: 60 * 1000, //ms
};
const NETWORK_CONFIG = {
    BLACK_LIST: ['home', 'darkweb', 'CSEC', 'The-Cave', 'run4theh111z', 'I.I.I.I', 'avmnite-02h', '.', 'w0r1d_d43m0n'],
};
const HACKNET_CONFIG = {
    FILE_LIST: ['/hacknet/hacknet-daemon.js'],
    TARGET: 'foodnstuff',
};
const WORM_CONFIG = {
    FILE_LIST: ['/malwares/worm-daemon.js', '/malwares/hack.js', '/malwares/weaken.js', '/malwares/grow.js'],
};
//# sourceMappingURL=jarvis-daemon.js.map