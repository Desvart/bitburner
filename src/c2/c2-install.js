var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadNetwork, Log } from '/resources/helpers';
import { Install } from '/resources/install';
export const CONFIG = {
    NETWORK_FILE: '/network.txt',
    SERVER_ROOT_NAME: 'pServ-',
    PAUSE_BETWEEN_BLOCKS: 200,
    HACK_RATIO: 75 / 100,
    C2_WAIT_LOOP: 2 * 60 * 1000, //ms
};
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const install = new InstallC2(ns, new Log(ns));
        yield install.downloadPackage();
        yield install.downloadPackage(install.hostname, 'malwares');
        yield install.precomputeStaticValues();
        install.launchDaemon();
    });
}
class InstallC2 extends Install {
    constructor(ns, log) {
        super(ns, log);
    }
    precomputeStaticValues(hostname = this.hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const [gFile, hFile, wFile] = this.identifyMalwaresToDownload();
            const staticValues = {
                packageName: this.packageName,
                hostname: hostname,
                serverRootName: CONFIG.SERVER_ROOT_NAME,
                loopPause: CONFIG.C2_WAIT_LOOP,
                nFile: CONFIG.NETWORK_FILE,
                fullTargetList: this.getFullTargetList(),
                hackRatio: CONFIG.HACK_RATIO,
                pauseBtwBlocks: CONFIG.PAUSE_BETWEEN_BLOCKS,
                hRam: this.ns.getScriptRam(hFile, hostname),
                wRam: this.ns.getScriptRam(wFile, hostname),
                gRam: this.ns.getScriptRam(gFile, hostname),
            };
            const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
            yield this.ns.write(initFile, JSON.stringify(staticValues), 'w');
            if (hostname !== this.hostname) {
                yield this.ns.scp(initFile, hostname);
            }
        });
    }
    getFullTargetList() {
        const network = loadNetwork(this.ns, this.hostname);
        return InstallC2.rateTargets(network)
            .filter(n => n.maxMoney > 0 && !n.purchasedByPlayer && n.maxRam > 16 && n.requiredHackingSkill > 50)
            .sort((prev, curr) => -prev.rate + curr.rate);
    }
    static rateTargets(targets) {
        const growthFactorMax = targets.sort((prev, curr) => -prev.growthFactor + curr.growthFactor)[0].growthFactor;
        const minSecMax = targets.sort((prev, curr) => -prev.minSec + curr.minSec)[0].minSec;
        const maxMoneyMax = targets.sort((prev, curr) => -prev.maxMoney + curr.maxMoney)[0].maxMoney;
        for (const target of targets) {
            const minSecNorm = (1 - target.minSec / minSecMax) * 100;
            const growthFactorNorm = target.growthFactor / growthFactorMax * 10;
            const maxMoneyNorm = target.maxMoney / maxMoneyMax; // * 1
            target.rate = minSecNorm + growthFactorNorm + maxMoneyNorm;
        }
        return targets;
    }
}
//# sourceMappingURL=c2-install.js.map