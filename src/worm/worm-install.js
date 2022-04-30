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
export function main(ns) {
    return __awaiter(this, void 0, void 0, function* () {
        ns.tail();
        ns.disableLog('ALL');
        ns.clearLog();
        const install = new InstallKittyHack(ns, new Log(ns));
        yield install.downloadPackage();
        yield install.downloadPackage(install.hostname, 'malwares');
        yield install.precomputeStaticValues();
        install.launchDaemon();
    });
}
class InstallKittyHack extends Install {
    constructor(ns, log) {
        super(ns, log);
    }
    precomputeStaticValues(hostname = this.hostname) {
        return __awaiter(this, void 0, void 0, function* () {
            const [GROW_FILE, HACK_FILE, WEAKEN_FILE] = this.identifyMalwaresToDownload();
            const freeRam = this.ns.getServerMaxRam(hostname) - this.ns.getScriptRam(`/${this.packageName}/${this.packageName}-daemon.js`, hostname);
            const hackRam = this.ns.getScriptRam(HACK_FILE, hostname);
            const weakenRam = this.ns.getScriptRam(WEAKEN_FILE, hostname);
            const growRam = this.ns.getScriptRam(GROW_FILE, hostname);
            const hackThreadQty = Math.floor(freeRam / hackRam);
            const weakenThreadQty = Math.floor(freeRam / weakenRam);
            const growThreadQty = Math.floor(freeRam / growRam);
            const staticValues = {
                packageName: this.packageName,
                hostname: hostname,
                hackThreadQty: hackThreadQty,
                weakenThreadQty: weakenThreadQty,
                growThreadQty: growThreadQty,
                minSec: this.ns.getServerMinSecurityLevel(hostname),
                maxMoney: this.ns.getServerMaxMoney(hostname),
                HACK_FILE: HACK_FILE,
                WEAKEN_FILE: WEAKEN_FILE,
                GROW_FILE: GROW_FILE,
            };
            const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
            yield this.ns.write(initFile, JSON.stringify(staticValues), 'w');
            if (hostname !== this.hostname) {
                yield this.ns.scp(initFile, hostname);
            }
        });
    }
}
//# sourceMappingURL=worm-install.js.map