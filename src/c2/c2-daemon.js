var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadInitFile, Log } from '/resources/helpers';
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const log = new Log(ns);
        const c2 = new C2(ns, log, loadInitFile(ns, ns.args[0]));
        while (c2.freeRunners.length > 0) {
            c2.identifyFreeRunners();
            c2.identifyNextTarget();
            if (c2.nextTarget !== undefined) {
                c2.computeRunnerRam();
                if (c2.isInfraAffordable()) {
                    c2.setupRunnerInfra();
                    yield c2.releaseShiva();
                }
                else
                    log.info(`C2_DAEMON - Infrastructure too expensive for actual wealth.`);
            }
            else
                log.info(`C2_DAEMON - No potential target at the moment.`);
            yield c2.pauseLoop();
        }
    });
}
class C2 {
    //private state: ShivaState[];
    constructor(ns, log, staticValues) {
        // Compute
        this.freeRunners = [];
        this.ns = ns;
        this.log = log;
        this.serverRootName = staticValues.SERVER_ROOT_NAME;
        this.loopPause = staticValues.C2_WAIT_LOOP;
        this.nFile = staticValues.NETWORK_FILE;
        this.fullTargetList = staticValues.fullTargetList;
        this.hackRatio = staticValues.HACK_RATIO;
        this.hRam = staticValues.hRam;
        this.wRam = staticValues.wRam;
        this.gRam = staticValues.gRam;
        this.pauseBtwBlocks = staticValues.pauseBtwBlocks;
        //this.state = this.determineShivaState();
    }
    identifyFreeRunners() {
        const maxPurchase = this.ns.getPurchasedServerLimit();
        const lastPurchaseId = this.ns.getPurchasedServers().length;
        for (let id = lastPurchaseId; id < maxPurchase; id++) {
            this.freeRunners.push(this.serverRootName + id);
        }
    }
    identifyNextTarget() {
        const validTargets = this.fullTargetList.filter(n => this.ns.hasRootAccess(n.hostname));
        const removedTargets = this.getRemovedTargets();
        const nextTargets = validTargets.filter(n => !removedTargets.includes(n.hostname));
        this.nextTarget = nextTargets[0];
    }
    computeRunnerRam() {
        const hThrdQty = Math.ceil(this.hackRatio / this.ns.hackAnalyze(this.nextTarget.hostname));
        const w1ThrdQty = Math.ceil(this.ns.hackAnalyzeSecurity(hThrdQty) / this.ns.weakenAnalyze(1));
        const gThrdQty = Math.ceil(this.ns.growthAnalyze(this.nextTarget.hostname, 1 / (1 - this.hackRatio))) + 1;
        const w2ThrdQty = Math.ceil(this.ns.growthAnalyzeSecurity(gThrdQty) / this.ns.weakenAnalyze(1));
        const blockRam = this.hRam * hThrdQty + this.wRam * (w1ThrdQty + w2ThrdQty) + this.gRam * gThrdQty;
        const maxParallelBlock = Math.ceil(this.ns.getWeakenTime(this.nextTarget.hostname) / (2 * this.pauseBtwBlocks));
        const minRamNeeded = blockRam * maxParallelBlock;
        for (let i = 0; i < 20; i++) {
            const ramSize = Math.pow(2, i);
            if (minRamNeeded < ramSize) {
                this.runnerRam = ramSize;
                return;
            }
        }
    }
    isInfraAffordable() {
        const serverCost = this.ns.getPurchasedServerCost(this.runnerRam);
        const availableMoney = this.ns.getServerMoneyAvailable('home');
        if (serverCost < availableMoney) {
            return true;
        }
        else {
            this.log.warn(`HYDRA_DAEMON - Not enough money ${availableMoney} / ${serverCost} to buy ${this.runnerRam}`);
            return false;
        }
    }
    setupRunnerInfra() {
        const purchasedResponse = this.ns.purchaseServer(this.nextRunner, this.runnerRam);
        if (purchasedResponse.length !== 0)
            this.log.success(`HYDRA_DAEMON - ${this.nextRunner} server successfully purchased.`);
        else
            this.log.error(`HYDRA_DAEMON - Cannot purchase new server ${this.nextRunner}. Unknown error.`);
    }
    releaseShiva(daemonName = 'shiva', runnerName = this.nextRunner) {
        return __awaiter(this, void 0, void 0, function* () {
            const files = [
                `/${daemonName}/${daemonName}-install.js`,
                '/resources/helpers.js',
                '/resources/install.js',
                this.nFile
            ];
            let globalStatus = true;
            const scpStatus = yield this.ns.scp(files, 'home', runnerName);
            const execStatus = this.ns.exec(files[0], runnerName, 1, this.nextTarget.hostname);
            if (scpStatus === true && execStatus > 0) {
                this.log.success(`C2_DAEMON - ${daemonName} installer successfully uploaded and launched on ${runnerName}`);
            }
            else if (scpStatus === false || execStatus === 0) {
                this.log.warn(`C2_DAEMON - Couldn't upload ${daemonName} installer on ${runnerName}`);
                globalStatus = false;
            }
            else {
                globalStatus = false;
            }
            return globalStatus;
        });
    }
    pauseLoop() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.ns.sleep(this.loopPause);
        });
    }
    getRemovedTargets() {
        let removedTargets = [];
        for (const server of this.ns.getPurchasedServers())
            removedTargets.push(this.ns.ps(server).filter(p => p.filename.includes('shiva-daemon'))[0].args[1]);
        return removedTargets;
    }
}
//# sourceMappingURL=c2-daemon.js.map