var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Log } from '/resources/helpers';
import { Install } from '/resources/install';
const CONFIG = {
    SERVER_ROOT_NAME: 'pServ-',
    HACK_RATIO: 20 / 100,
    PAUSE_BETWEEN_BLOCKS: 100, // ms
};
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const target = JSON.parse(ns.args[0]);
        const install = new InstallShiva(ns, new Log(ns), target);
        yield install.downloadPackage();
        yield install.downloadPackage(install.hostname, 'malwares');
        yield install.precomputeStaticValues();
        install.launchDaemon(install.hostname, 1, 'warmup', target.hostname);
    });
}
class InstallShiva extends Install {
    constructor(ns, log, target) {
        super(ns, log);
        this.target = target;
    }
    precomputeStaticValues(hostname = this.hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            [this.gFile, this.hFile, this.wFile] = this.identifyMalwaresToDownload();
            this.computeWarmupThreadQty();
            const staticValues = {
                packageName: this.packageName,
                runner: hostname,
                target: this.target,
                hFile: this.hFile,
                wFile: this.wFile,
                gFile: this.gFile,
                sFile: `/${this.packageName}/${this.packageName}-stat.js`,
                minSec: this.ns.getServerMinSecurityLevel(this.target.hostname),
                maxMoney: this.ns.getServerMaxMoney(this.target.hostname),
                hackRatio: CONFIG.HACK_RATIO,
                pauseBtwBlocks: CONFIG.PAUSE_BETWEEN_BLOCKS,
                wThrdQty: this.wThrdQty,
                gThrdQty: this.gThrdQty,
            };
            const initFile = `/${this.packageName}/${this.packageName}-init-${this.target.hostname}.txt`;
            yield this.ns.write(initFile, JSON.stringify(staticValues), 'w');
            if (hostname !== this.hostname) {
                yield this.ns.scp(initFile, hostname);
            }
        });
    }
    computeWarmupThreadQty() {
        const daemonRam = this.ns.getScriptRam(`/${this.packageName}/${this.packageName}-daemon.js`, 'home');
        const freeRam = this.ns.getServerMaxRam(this.hostname) - daemonRam;
        const weakenRam = this.ns.getScriptRam(this.wFile, 'home');
        const growRam = this.ns.getScriptRam(this.gFile, 'home');
        this.wThrdQty = Math.floor(freeRam / weakenRam);
        this.gThrdQty = Math.floor(freeRam / growRam);
    }
}
//# sourceMappingURL=shiva-install.js.map