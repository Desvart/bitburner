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
        // Since n00dles RAM is not enough to execute the kittyhack-install script, then the install is done through foodnstuff
        const secondaryTarget = 'n00dles';
        yield install.downloadPackage(secondaryTarget);
        yield ns.scp('/resources/helpers.js', 'n00dles');
        yield install.precomputeStaticValues(secondaryTarget);
        install.launchDaemon(secondaryTarget);
        yield install.downloadPackage();
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
            const staticValues = {
                packageName: this.packageName,
                hostname: hostname,
                minSec: this.ns.getServerMinSecurityLevel(hostname),
                maxMoney: this.ns.getServerMaxMoney(hostname),
            };
            const initFile = `/${this.packageName}/${this.packageName}-init.txt`;
            yield this.ns.write(initFile, JSON.stringify(staticValues), 'w');
            if (hostname !== this.hostname) {
                yield this.ns.scp(initFile, hostname);
            }
        });
    }
}
//# sourceMappingURL=kittyhack-install.js.map