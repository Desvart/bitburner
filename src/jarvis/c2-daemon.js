var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { LogNsAdapter } from '/resources/helpers';
import { SHIVA_CONFIG } from '/shiva2/shiva-config';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        let targetName = ns.args[0];
        let runnerName = ns.args[1];
        const nsA = new C2Adapter(ns);
        const logA = new LogNsAdapter(ns);
        let freeServerAvail = nsA.getPurchasedServerLimit() - nsA.getPurchasedServers().length;
        while (freeServerAvail > 0) {
            const c2 = new C2(nsA, logA);
            targetName = c2.findNextBestTarget(targetName);
            if (targetName.length !== 0) {
                logA.debug(`HYDRA_DAEMON - Potential target: ${targetName}.`);
                if (runnerName === undefined) {
                    runnerName = c2.setupRunnerInfra(targetName);
                }
                yield c2.uploadShivaInstallOnRunner(runnerName);
                c2.executeShivaInstall(runnerName, targetName);
            }
            else {
                logA.warn(`HYDRA_DAEMON - No potential target at the moment.`);
            }
            freeServerAvail = nsA.getPurchasedServerLimit() - nsA.getPurchasedServers().length;
            yield ns.sleep(2000);
        }
    });
}
class C2 {
    constructor(nsA, logA) {
        this.nsA = nsA;
        this.logA = logA;
    }
    findNextBestTarget(targetName = null) {
        if (targetName === null) {
            const availableTargets = this.getTargets();
            if (availableTargets.length !== 0) {
                targetName = this.identifyMostProfitableTarget(availableTargets);
            }
            else {
                targetName = '';
            }
        }
        return targetName;
    }
    setupRunnerInfra(targetName) {
        const existingRunnerName = this.getServersHacking(targetName)[0];
        const newRunnerName = this.identifyNewRunner(existingRunnerName);
        const newRunnerRam = this.determineRunnerRam(targetName);
        this.upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName);
        return newRunnerName;
    }
    uploadShivaInstallOnRunner(runnerName) {
        return __awaiter(this, void 0, void 0, function* () {
            if (runnerName !== 'home') {
                yield this.nsA.scp(SHIVA_CONFIG.INSTALL_PACKAGE, runnerName);
                this.logA.info(`Hydra malwares deployed on ${runnerName}`);
            }
        });
    }
    executeShivaInstall(runnerName, targetName) {
        this.nsA.exec(SHIVA_CONFIG.INSTALL_PACKAGE[0], runnerName, targetName, runnerName);
        this.logA.info(`HYDRA_DAEMON - Shiva-daemon activated on ${runnerName} and targeting ${targetName}.`);
    }
    getTargets() {
        return this.getNetwork().filter(n => !this.getLockedTargets().includes(n.hostname) &&
            n.isPotentialTarget &&
            n.hasAdminRights &&
            n.hackChance === 1);
    }
    getNetwork() {
        let discoveredNodes = [];
        let nodesToScan = ['home'];
        let infiniteLoopProtection = 999;
        let network = [];
        while (nodesToScan.length > 0 && infiniteLoopProtection-- > 0) {
            const nodeName = nodesToScan.pop();
            const connectedNodeNames = this.nsA.scan(nodeName);
            for (const connectedNodeName of connectedNodeNames) {
                if (discoveredNodes.includes(connectedNodeName) === false) {
                    nodesToScan.push(connectedNodeName);
                }
            }
            discoveredNodes.push(nodeName);
            network.push(this.nsA.getNode(nodeName));
        }
        return network;
    }
    getLockedTargets() {
        let lockedTargets = [];
        for (const server of this.nsA.getPurchasedServers()) {
            const processes = this.nsA.ps(server);
            for (const process of processes)
                if (process.filename === SHIVA_CONFIG.RUN_PACKAGE[0])
                    lockedTargets.push(process.args[0]);
        }
        return lockedTargets;
    }
    identifyMostProfitableTarget(availableTargets) {
        let ratedTargets = this.rateTargets(availableTargets);
        const mostProfitableTarget = ratedTargets.sort((prev, curr) => -prev.rate + curr.rate)[0];
        return mostProfitableTarget.hostname;
    }
    // noinspection JSMethodCanBeStatic
    rateTargets(targets) {
        const growthFactorMax = targets.sort((prev, curr) => -prev.growthFactor + curr.growthFactor)[0].growthFactor;
        const minSecMax = targets.sort((prev, curr) => -prev.minSec + curr.minSec)[0].minSec;
        const maxMoneyMax = targets.sort((prev, curr) => -prev.maxMoney + curr.maxMoney)[0].maxMoney;
        for (const target of targets) {
            const minSecNorm = (1 - target.minSec / minSecMax) * 100;
            const growthFactorNorm = target.growthFactor / growthFactorMax * 10;
            // noinspection PointlessArithmeticExpressionJS
            const maxMoneyNorm = target.maxMoney / maxMoneyMax * 1;
            target.rate = minSecNorm + growthFactorNorm + maxMoneyNorm;
        }
        return targets;
    }
    identifyNewRunner(existingRunnerName = '') {
        if (existingRunnerName.length === 0) {
            return SHIVA_CONFIG.SERVER_ROOT_NAME + this.serverCount();
        }
        else {
            return existingRunnerName;
        }
    }
    determineRunnerRam(targetName) {
        const hackThreads = Math.ceil(SHIVA_CONFIG.HACK_RATIO / this.nsA.hackAnalyze(targetName));
        const weaken1Threads = Math.ceil(this.nsA.hackAnalyzeSecurity(hackThreads) / this.nsA.weakenAnalyze(1));
        const growThreads = Math.ceil(this.nsA.growthAnalyze(targetName, 1 / (1 - SHIVA_CONFIG.HACK_RATIO))) + 1;
        const weaken2Threads = Math.ceil(this.nsA.growthAnalyzeSecurity(growThreads) / this.nsA.weakenAnalyze(1));
        const hackRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[1]);
        const weakenRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[2]);
        const growRam = this.nsA.getScriptRam(SHIVA_CONFIG.RUN_PACKAGE[3]);
        const minRamNeededFor1Block = hackRam * hackThreads +
            weakenRam * weaken1Threads +
            growRam * growThreads +
            weakenRam * weaken2Threads;
        const maxNumberOfParallelBlock = Math.ceil(this.nsA.getWeakenTime(targetName) / (2 * SHIVA_CONFIG.PAUSE_BETWEEN_BLOCKS));
        const minRamNeeded = minRamNeededFor1Block * maxNumberOfParallelBlock;
        for (let i = 0; i < 20; i++) {
            const ramSize = Math.pow(2, i);
            if (minRamNeeded < ramSize) {
                return ramSize;
            }
        }
    }
    upgradeInfraWithNewRunner(newRunnerName, newRunnerRam, existingRunnerName) {
        this.deleteServer(existingRunnerName);
        this.buyNewServer(newRunnerName, newRunnerRam);
    }
    serversList() {
        return this.nsA.getPurchasedServers();
    }
    serverCount() {
        return this.serversList.length;
    }
    buyNewServer(serverName, ramSize) {
        if (this.checkIfLimitReached(serverName) === false && this.checkIfEnoughMoney(serverName, ramSize) === true) {
            const purchasedResponse = this.nsA.purchaseServer(serverName, ramSize);
            return this.validatePurchase(purchasedResponse, serverName);
        }
        else {
            return null;
        }
    }
    checkIfLimitReached(serverName) {
        if (this.nsA.getPurchasedServers().length < this.nsA.getPurchasedServerLimit()) {
            return false;
        }
        else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                Max number of servers already bought.`);
            return true;
        }
    }
    checkIfEnoughMoney(serverName, ramSize) {
        const serverCost = this.nsA.getPurchasedServerCost(ramSize);
        const availableMoney = this.nsA.getMoneyAvailable();
        if (serverCost < availableMoney) {
            return true;
        }
        else {
            this.logA.warn(`HYDRA_DAEMON - Cannot purchase new server ${serverName}.
                    Not enough money ${availableMoney} / ${serverCost}.`);
            return false;
        }
    }
    validatePurchase(purchasedResponse = '', serverName) {
        if (purchasedResponse.length !== 0) {
            return purchasedResponse;
        }
        else {
            this.logA.error(`HYDRA_DAEMON - Cannot purchase new server ${serverName}. Unknown error.`);
        }
    }
    deleteServer(serverName = '') {
        if (serverName.length !== 0) {
            this.nsA.killall(serverName);
            const resp = this.nsA.deleteServer(serverName);
            if (resp === true) {
                this.logA.info(`HYDRA_DAEMON - Successfully deleted server ${serverName}.`);
            }
            else {
                this.logA.error(`HYDRA_DAEMON - Cannot delete server ${serverName}. Unknown error.`);
            }
        }
    }
    getServersHacking(targetName) {
        let detectedServer = [];
        for (const server of this.serversList()) {
            const processList = this.nsA.ps(server);
            for (const process of processList) {
                if (process.args.includes(targetName) === true) {
                    detectedServer.push(server);
                }
            }
        }
        return detectedServer;
    }
    // noinspection JSUnusedLocalSymbols
    getNewServerCost(ramSize) {
        return this.nsA.getPurchasedServerCost(ramSize);
    }
}
class C2Adapter {
    constructor(ns) {
        this.ns = ns;
    }
    getPurchasedServers() {
        return this.ns.getPurchasedServers();
    }
    ps(hostname) {
        return this.ns.ps(hostname);
    }
    scan(hostname) {
        return this.ns.scan(hostname);
    }
    scp(files, target) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.ns.scp(files, 'home', target);
        });
    }
    getNode(hostname) {
        const node = this.ns.getServer(hostname);
        return {
            hostname: node.hostname,
            purchasedByPlayer: node.purchasedByPlayer,
            ram: node.maxRam,
            isPotentialTarget: this.checkIfPotentialTarget(node),
            hasAdminRights: node.hasAdminRights,
            hackChance: this.hackChance(node.hostname),
            growthFactor: node.serverGrowth,
            minSec: node.minDifficulty,
            maxMoney: node.moneyMax,
            rate: 0,
        };
    }
    // noinspection JSMethodCanBeStatic
    checkIfPotentialTarget(node) {
        if (node.purchasedByPlayer === true)
            return false;
        for (let blackNode of SHIVA_CONFIG.BLACK_LIST)
            if (node.hostname === blackNode)
                return false;
        return true;
    }
    hackChance(hostname) {
        return this.ns.hackAnalyzeChance(hostname);
    }
    hackAnalyze(hostname) {
        return this.ns.hackAnalyze(hostname);
    }
    hackAnalyzeSecurity(hackThreadsCount) {
        return this.ns.hackAnalyzeSecurity(hackThreadsCount);
    }
    growthAnalyze(hostname, growthAmount) {
        return this.ns.growthAnalyze(hostname, growthAmount);
    }
    growthAnalyzeSecurity(growThreadsCount) {
        return this.ns.growthAnalyzeSecurity(growThreadsCount);
    }
    weakenAnalyze(weakenThreadsCount) {
        return this.ns.weakenAnalyze(weakenThreadsCount);
    }
    read(file) {
        return this.ns.read(file);
    }
    getWeakenTime(hostname) {
        return this.ns.getWeakenTime(hostname);
    }
    deleteServer(serverName) {
        this.ns.deleteServer(serverName);
    }
    killall(serverName) {
        this.ns.killall(serverName);
    }
    getMoneyAvailable() {
        return this.ns.getServerMoneyAvailable('home');
    }
    getScriptRam(file) {
        return this.ns.getScriptRam(file, 'home');
    }
    exec(script, target, ...args) {
        this.ns.exec(script, target, 1, ...args);
    }
    getPurchasedServerLimit() {
        return this.ns.getPurchasedServerLimit();
    }
    getPurchasedServerCost(ramSize) {
        return this.ns.getPurchasedServerCost(ramSize);
    }
    purchaseServer(serverName, ramSize) {
        return this.ns.purchaseServer(serverName, ramSize);
    }
}
//# sourceMappingURL=c2-daemon.js.map